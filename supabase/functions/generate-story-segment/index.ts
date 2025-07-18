
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { getGenerationSettings } from './settings.ts'
import { processImageGeneration } from './image-background-tasks.ts'
import { generateAudio } from './audio.ts'
import { validateRequest } from './request-validation.ts'
import { createStoryIfNeeded, fetchPreviousSegments } from './story-creation.ts'
import { generateStoryContent } from './text-generation.ts'
import { saveStorySegment } from './segment-storage.ts'
import { checkOVHHealth } from './ovh-health-check.ts'
import { buildNarrativeContext } from './narrative-context-builder.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const requestBody = await req.json();
    const { prompt, genre, storyId, parentSegmentId, choiceText, skipImage, skipAudio, storyMode, voice, targetAge } = validateRequest(requestBody);

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Load admin settings for image generation configuration
    console.log('⚙️ Loading admin settings for image generation...');
    const settings = await getGenerationSettings(supabaseAdmin);
    console.log('⚙️ Image provider settings:', settings.imageProviders);
    
    // Perform OVH health check to diagnose any issues early
    console.log('🏥 Checking OVH AI service health...');
    const healthCheck = await checkOVHHealth();
    console.log('🏥 OVH Health Check Results:', healthCheck);
    
    if (!healthCheck.isHealthy) {
      console.warn('⚠️ OVH AI service not healthy, will rely on OpenAI fallback');
    }

    // Create story or get existing story ID
    const finalStoryId = await createStoryIfNeeded(supabaseClient, storyId, prompt, genre, storyMode, targetAge);

    // Fetch previous segments for context
    const previousSegments = await fetchPreviousSegments(supabaseClient, finalStoryId);

    // Build comprehensive narrative context for consistency
    console.log('🏗️ Building enhanced narrative context...')
    const narrativeContext = await buildNarrativeContext(previousSegments, genre || storyMode || 'fantasy', prompt);
    
    // Generate story text with enhanced context
    console.log('📝 Starting text generation with enhanced context...')
    const visualContext = {
      genre: genre || storyMode || 'fantasy',
      characters: narrativeContext.characters.map(c => ({ name: c.name, description: c.description })),
      setting: narrativeContext.setting.location,
      previousSegments: narrativeContext.previousSegments.substring(0, 1000), // Increased context length
      style: `${narrativeContext.tone} ${narrativeContext.genre} art style`,
      worldRules: narrativeContext.worldRules.map(r => r.rule).join(', '),
      plotThreads: narrativeContext.plotThreads.map(t => t.description).join(', ')
    };
    
    const storyResult = await generateStoryContent(prompt, choiceText, visualContext, narrativeContext, genre || storyMode || 'fantasy', supabaseClient, targetAge || '7-9')
    console.log('✅ Text generation completed')

    // Handle audio generation
    let audioUrl: string | null = null
    let audioStatus = 'not_started'
    
    if (!skipAudio) {
      try {
        console.log('🔊 Starting audio generation...')
        const audioResult = await generateAudio(storyResult.segmentText, voice || 'fable', supabaseAdmin)
        audioUrl = audioResult?.audioUrl || null;
        audioStatus = audioResult ? 'completed' : 'failed';
      } catch (audioError) {
        console.error('❌ Audio generation failed:', audioError)
        audioStatus = 'failed';
      }
    }

    // Save segment to database
    const segment = await saveStorySegment(
      supabaseClient,
      finalStoryId,
      parentSegmentId,
      storyResult,
      choiceText,
      audioUrl,
      audioStatus,
      skipImage ?? false
    );

    // Start image generation as background task if not skipped
    if (!skipImage && storyResult.imagePrompt) {
      console.log('🎨 STARTING BACKGROUND IMAGE GENERATION');
      console.log('🎨 Image generation details:', {
        segmentId: segment.id,
        storyId: finalStoryId,
        imagePrompt: storyResult.imagePrompt,
        skipImage: skipImage,
        hasImagePrompt: !!storyResult.imagePrompt
      });
      
      const imageVisualContext = {
        genre: genre || storyMode || 'fantasy',
        characters: narrativeContext.characters.map(c => ({ name: c.name, description: c.description })),
        setting: narrativeContext.setting.location,
        previousSegments: narrativeContext.previousSegments.substring(0, 1000),
        style: `${narrativeContext.tone} ${narrativeContext.genre} art style`,
        worldRules: narrativeContext.worldRules.map(r => r.rule).join(', '),
        plotThreads: narrativeContext.plotThreads.map(t => t.description).join(', '),
        atmosphere: narrativeContext.setting.atmosphere,
        timePeriod: narrativeContext.setting.timePeriod
      };

      EdgeRuntime.waitUntil(
        processImageGeneration(
          segment.id,
          finalStoryId,
          storyResult.imagePrompt,
          supabaseAdmin,
          supabaseClient,
          imageVisualContext
        )
      );
    } else {
      console.log('🎨 SKIPPING IMAGE GENERATION', {
        skipImage: skipImage,
        hasImagePrompt: !!storyResult.imagePrompt,
        reason: skipImage ? 'skipImage is true' : 'no image prompt'
      });
    }

    return new Response(
      JSON.stringify({ success: true, data: segment }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )
  } catch (error) {
    console.error('💥 Error in story generation:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Story generation failed'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
        status: 500 
      }
    )
  }
})
