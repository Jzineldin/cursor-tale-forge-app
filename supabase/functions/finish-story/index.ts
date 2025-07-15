import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('=== FINISH STORY FUNCTION START ===');
    
    const { storyId, skipImage = false } = await req.json()
    console.log('🏁 Finishing story with ID:', storyId);
    console.log('📸 Skip image for ending:', skipImage);

    if (!storyId) {
      throw new Error('Story ID is required');
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    // Get the story details and all segments for context
    const { data: story, error: storyError } = await supabaseClient
      .from('stories')
      .select('*')
      .eq('id', storyId)
      .single();

    if (storyError) {
      console.error('Error fetching story:', storyError);
      throw new Error(`Failed to fetch story: ${storyError.message}`);
    }

    // Get all story segments for context
    const { data: segments, error: segmentsError } = await supabaseClient
      .from('story_segments')
      .select('*')
      .eq('story_id', storyId)
      .order('created_at', { ascending: true });

    if (segmentsError || !segments || segments.length === 0) {
      console.error('Error fetching segments:', segmentsError);
      throw new Error('Failed to fetch story segments');
    }

    const latestSegment = segments[segments.length - 1];
    console.log('📖 Latest segment found:', latestSegment.id);

    // Create story context for ending generation
    const storyText = segments.map(seg => seg.segment_text).join('\n\n');
    
    const endingPrompt = `Based on the complete story so far, write a compelling conclusion that brings this ${story.story_mode || 'fantasy'} story to a satisfying close.

Story mode: ${story.story_mode || 'fantasy'}

Complete story so far:
${storyText}

Write a conclusion that:
1. Brings the story to a satisfying close
2. Resolves any conflicts or tensions from the story
3. Provides closure for the main character(s)
4. Matches the tone and style of the existing story
5. Is approximately 100-150 words
6. Includes a vivid final scene that can be visualized for illustration

Write only the ending segment - no choices needed as this concludes the story.`;

    console.log('🎯 Generating story ending using existing generate-story-segment function...');

    // Call our working generate-story-segment function instead of direct OpenAI
    const generateResponse = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/generate-story-segment`, {
      method: 'POST',
      headers: {
        'Authorization': req.headers.get('Authorization')!,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        storyId: storyId,
        parentSegmentId: latestSegment.id,
        prompt: endingPrompt,
        choiceText: 'Conclude the story',
        storyMode: story.story_mode || 'fantasy',
        skipImage: skipImage,
        skipAudio: true, // Skip audio for endings
        generateImage: !skipImage // Generate image unless skipped
      })
    });

    if (!generateResponse.ok) {
      const errorText = await generateResponse.text();
      console.error('❌ generate-story-segment failed:', errorText);
      throw new Error(`Story ending generation failed: ${generateResponse.status}`);
    }

    const generationResult = await generateResponse.json();
    console.log('📖 Generation result:', generationResult);

    if (!generationResult.success && !generationResult.id) {
      throw new Error('Story ending generation failed: Invalid response format');
    }

    // Extract segment data (handle both old and new response formats)
    const endingSegment = generationResult.success ? generationResult.data : generationResult;
    
    if (!endingSegment || !endingSegment.id) {
      throw new Error('Story ending generation failed: No segment data returned');
    }

    console.log('✅ Ending segment generated:', endingSegment.id);

    // Now mark this segment as the ending and update the story completion status
    const { error: updateSegmentError } = await supabaseClient
      .from('story_segments')
      .update({ 
        is_end: true,
        choices: [] // Remove any choices since this is the ending
      })
      .eq('id', endingSegment.id);

    if (updateSegmentError) {
      console.warn('Warning: Could not mark segment as ending:', updateSegmentError);
    }

    // Mark the story as completed
    const { error: storyUpdateError } = await supabaseClient
      .from('stories')
      .update({ is_completed: true })
      .eq('id', storyId);

    if (storyUpdateError) {
      console.warn('Warning: Could not mark story as completed:', storyUpdateError);
    }

    console.log('✅ Story finished successfully with generated ending');

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Story finished successfully with generated ending',
        endingSegment: { ...endingSegment, is_end: true, choices: [] }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )
  } catch (error) {
    console.error('💥 Error finishing story:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Failed to finish story'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
        status: 500 
      }
    )
  }
})