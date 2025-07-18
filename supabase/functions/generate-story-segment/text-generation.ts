
import { generateStoryWithOVH } from './ovh-text-service.ts';
import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";
import { validateContentSafety, applySafetyFilter } from './content-safety.ts';

/**
 * Get age-appropriate content guidelines for story generation
 */
function getAgeAppropriateGuidelines(targetAge: '4-6' | '7-9' | '10-12'): {
  guidelines: string;
  wordCount: string;
  vocabulary: string;
  themes: string;
  safety: string;
} {
  switch (targetAge) {
    case '4-6':
      return {
        guidelines: `AGE 4-6 GUIDELINES:
- Use simple, clear language with short sentences (5-8 words max)
- Focus on basic concepts: colors, numbers, shapes, animals, family
- Include gentle, positive themes: friendship, sharing, helping others
- Use repetitive patterns and familiar scenarios
- Keep stories under 100 words per segment
- Avoid complex emotions or abstract concepts
- Include simple moral lessons with clear right and wrong
- Use familiar settings: home, school, park, farm
- Gentle conflicts with quick, reassuring resolutions`,
        wordCount: '50-100',
        vocabulary: 'Simple words, basic concepts, familiar objects',
        themes: 'Friendship, sharing, helping, learning basic skills',
        safety: 'No violence, scary content, or complex emotions'
      };
    case '7-9':
      return {
        guidelines: `AGE 7-9 GUIDELINES:
- Use clear, engaging language with varied sentence structure
- Include educational elements: science, history, geography concepts
- Focus on problem-solving and critical thinking
- Include character development and emotional growth
- Keep stories 100-150 words per segment
- Introduce mild challenges that are resolved through cooperation
- Include positive role models and teamwork themes
- Use imaginative settings with some educational value
- Gentle adventure with learning opportunities`,
        wordCount: '100-150',
        vocabulary: 'Expanded vocabulary, educational terms, descriptive language',
        themes: 'Adventure, discovery, teamwork, learning, friendship',
        safety: 'Mild challenges only, no violence or scary content'
      };
    case '10-12':
      return {
        guidelines: `AGE 10-12 GUIDELINES:
- Use more sophisticated language and complex sentence structures
- Include deeper character development and emotional complexity
- Focus on themes of identity, responsibility, and personal growth
- Include educational content woven naturally into the story
- Keep stories 150-200 words per segment
- Include more complex problem-solving and decision-making
- Explore themes of justice, fairness, and social responsibility
- Use diverse settings and cultural elements
- Adventure with meaningful challenges and character growth`,
        wordCount: '150-200',
        vocabulary: 'Rich vocabulary, complex concepts, descriptive language',
        themes: 'Identity, responsibility, justice, personal growth, adventure',
        safety: 'Age-appropriate challenges, no graphic content or mature themes'
      };
  }
}

/**
 * Generates story content using OVH Qwen2.5 (primary) or OpenAI GPT-4o-mini (fallback).
 * 
 * This function is the core of TaleForge's AI-powered story generation system.
 * It maintains narrative consistency by incorporating:
 * - Previous story segments for context continuity
 * - Visual context (characters, settings, art style) for consistent image generation
 * - Narrative context (story summary, objectives) for coherent plot development
 * - User choices to drive branching narrative paths
 * - Educational elements and age-appropriate content (enhanced with Qwen2.5)
 * 
 * The function returns structured JSON with story text, choice options, and image prompts
 * that enable TaleForge's multi-modal storytelling experience.
 * 
 * @param initialPrompt - Starting prompt for new story (genre/theme selection)
 * @param choiceText - User's selected choice text for story continuation
 * @param visualContext - Character descriptions, settings, and art style for image consistency
 * @param narrativeContext - Story summary and current objectives for plot coherence
 * @param storyMode - Story genre/mode (Epic Fantasy, Sci-Fi Thriller, etc.)
 * @param supabaseClient - Supabase client for loading provider settings
 * 
 * @returns Promise<object> Structured response with:
 *   - segmentText: Generated story text for current segment
 *   - choices: Array of 2-4 choice options for branching narrative
 *   - isEnd: Boolean indicating if story has reached a conclusion
 *   - imagePrompt: Detailed prompt for AI image generation
 *   - educationalElements: Array of learning objectives (Qwen2.5 feature)
 *   - ageAppropriateness: Target age group classification
 * 
 * @throws Error if both OVH and OpenAI fail or no API keys available
 */
async function generateStoryContent(
  initialPrompt?: string,
  choiceText?: string,
  visualContext?: any,
  narrativeContext?: any,
  storyMode?: string,
  supabaseClient?: SupabaseClient,
  targetAge: '4-6' | '7-9' | '10-12' = '7-9'
) {
  console.log('🔧 Loading text provider settings...');
  
  // Try OVH Qwen2.5 first (primary provider for cost savings and educational features)
  try {
    console.log('🚀 Attempting OVH Qwen2.5 text generation...');
    const result = await generateStoryWithOVH(
      initialPrompt || choiceText || '',
      storyMode || 'fantasy',
      narrativeContext?.previousSegments || [],
      { visualContext, narrativeContext, targetAge }
    );
    
    console.log('✅ OVH Qwen2.5 generation successful');
    return result;
    
  } catch (ovhError) {
    console.error('❌ OVH Qwen2.5 failed:', ovhError);
    console.error('🔍 OVH Error Details:', {
      message: ovhError.message,
      name: ovhError.name,
      isNetworkError: ovhError.message.includes('Failed to fetch'),
      isAuthError: ovhError.message.includes('authentication'),
      isRateLimit: ovhError.message.includes('rate limit'),
      isServerError: ovhError.message.includes('server error')
    });
    
    console.log('🔄 Falling back to OpenAI GPT-4o-mini...');
    
    // Fallback to OpenAI with enhanced error context
    try {
      return await generateStoryWithOpenAI(
        initialPrompt,
        choiceText,
        visualContext,
        narrativeContext,
        storyMode,
        targetAge
      );
    } catch (openaiError) {
      console.error('❌ OpenAI fallback also failed:', openaiError);
      
      // Create a comprehensive error message
      const errorDetails = [
        'Both AI providers failed:',
        `- OVH Error: ${ovhError.message}`,
        `- OpenAI Error: ${openaiError.message}`
      ].join('\n');
      
      throw new Error(`Storytelling AI temporarily unavailable. ${errorDetails}`);
    }
  }
}

/**
 * Generate story content using OpenAI GPT-4o-mini (fallback provider)
 */
async function generateStoryWithOpenAI(
  initialPrompt?: string,
  choiceText?: string,
  visualContext?: any,
  narrativeContext?: any,
  storyMode?: string,
  targetAge: '4-6' | '7-9' | '10-12' = '7-9'
) {
  const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
  if (!openAIApiKey) {
    throw new Error('OpenAI API key not available - both OVH and OpenAI failed');
  }

  console.log('🤖 Generating story with OpenAI GPT-4o-mini (fallback)...');

  // Add visual context for consistency
  let visualContextPrompt = '';
  if (visualContext) {
    const characters = Object.entries(visualContext.characters || {})
      .map(([name, desc]) => `${name}: ${desc}`)
      .join(', ');
    
    visualContextPrompt = characters ? `\n\nCHARACTERS TO MAINTAIN: ${characters}` : '';
    
    if (visualContext.setting) {
      visualContextPrompt += `\nSETTING: ${visualContext.setting}`;
    }
    
    if (visualContext.genre) {
      visualContextPrompt += `\nGENRE: ${visualContext.genre}`;
    }
  }

  // Add narrative context
  let narrativeContextPrompt = '';
  if (narrativeContext) {
    const characters = narrativeContext.characters?.map(c => `${c.name}: ${c.description} (${c.role})`).join(', ') || 'No characters established yet';
    const worldRules = narrativeContext.worldRules?.map(r => r.rule).join(', ') || 'Standard story world rules';
    const plotThreads = narrativeContext.plotThreads?.map(t => t.description).join(', ') || 'Story development in progress';
    const consistencyWarnings = narrativeContext.consistencyWarnings?.join('\n') || '';
    
    narrativeContextPrompt = `\n\nCOMPREHENSIVE NARRATIVE CONTEXT:
- Story Summary: ${narrativeContext.summary || 'Story in progress'}
- Current Objective: ${narrativeContext.currentObjective || 'Continue the adventure'}
- Story Arc Stage: ${narrativeContext.arcStage || 'development'}
- Story Tone: ${narrativeContext.tone || 'adventurous'}
- Genre: ${narrativeContext.genre || 'fantasy'}

ESTABLISHED STORY ELEMENTS:
- Characters: ${characters}
- Current Setting: ${narrativeContext.setting?.location || 'Story location'}
- Setting Atmosphere: ${narrativeContext.setting?.atmosphere || 'neutral'}
- World Rules: ${worldRules}
- Active Plot Threads: ${plotThreads}

CRITICAL CONSISTENCY RULES:
- MAINTAIN the established setting and location throughout this segment
- CONTINUE with the same characters and their established traits
- FOLLOW the established world rules and genre conventions
- KEEP the story tone consistent with previous segments
- DO NOT suddenly change locations or introduce unrelated settings
- BUILD upon existing plot threads rather than starting new unrelated ones

${consistencyWarnings ? `CONSISTENCY WARNINGS:\n${consistencyWarnings}\n\nIMPORTANT: Address these warnings by maintaining narrative consistency.` : ''}`;
  }

  // Age-appropriate content guidelines
  const ageGuidelines = getAgeAppropriateGuidelines(targetAge);
  
  const systemPrompt = `You are a master storyteller AI specializing in age-appropriate content for children. Generate immersive story segments in JSON format.

TARGET AGE GROUP: ${targetAge} years old
${ageGuidelines}

CRITICAL NARRATIVE CONSISTENCY REQUIREMENTS:
- ALWAYS maintain the established setting and location throughout each segment
- NEVER suddenly change locations or introduce unrelated settings
- CONTINUE with the same characters and their established traits
- FOLLOW the established world rules and genre conventions
- KEEP the story tone consistent with previous segments
- BUILD upon existing plot threads rather than starting new unrelated ones
- If the story is set in pyramids, STAY in pyramids - don't jump to forests
- If the story is set in a magical forest, STAY in the forest - don't jump to space
- Maintain logical continuity with the previous story segments

REQUIREMENTS:
- Generate ${ageGuidelines.wordCount} words for age-appropriate storytelling
- Create exactly 3 meaningful choices that advance the plot
- DO NOT include image descriptions or references to images within the segmentText
- DO NOT include choice prompts, transitions, or references to choices within the segmentText
- The segmentText should end naturally as part of the story narrative
- Choices will be presented separately as interactive buttons
- MAINTAIN CONSISTENCY with previous story segments and established characters
- CONTINUE the narrative flow naturally from the previous context
- Generate a separate imagePrompt field for visual generation (not in story text)

Response format (EXACT JSON):
{
  "segmentText": "A 120-200 word story segment with vivid descriptions that ends naturally without any choice prompts",
  "choices": ["Choice 1", "Choice 2", "Choice 3"],
  "isEnd": false,
  "imagePrompt": "Detailed scene description for image generation consistent with established visual style",
  "visualContext": {"style": "established art style", "characters": {"name": "description"}, "setting": "current location"},
  "narrativeContext": {"summary": "updated story summary", "currentObjective": "next goal", "arcStage": "current stage"}
}`;

  // Build context from narrative context
  let contextPrompt = '';
  if (narrativeContext?.previousSegments) {
    contextPrompt = '\n\nPREVIOUS STORY CONTEXT:\n' + narrativeContext.previousSegments;
  }

  const userPrompt = initialPrompt 
    ? `Start a new ${storyMode || 'fantasy'} story: "${initialPrompt}"`
    : `Continue the story. User chose: "${choiceText}"${contextPrompt}${visualContextPrompt}${narrativeContextPrompt}`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 1500,
        response_format: { type: "json_object" }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenAI API failed: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const responseText = data.choices[0].message.content;
    
    if (!responseText) {
      throw new Error('OpenAI returned empty response');
    }
    
    const parsedResponse = JSON.parse(responseText);
    
    if (!parsedResponse.segmentText || !parsedResponse.choices) {
      throw new Error('OpenAI response missing required fields');
    }
    
    // Apply content safety filtering
    console.log('🛡️ Applying content safety filter...');
    const safeResponse = applySafetyFilter(parsedResponse);
    
    // Additional age-specific safety check
    if (targetAge === '4-6') {
      const emergencyCheck = validateContentSafety(safeResponse.segmentText);
      if (!emergencyCheck.isSafe) {
        console.warn('⚠️ Content not safe for ages 4-6, regenerating...');
        // For ages 4-6, we need to be extra careful
        safeResponse.segmentText = emergencyCheck.sanitizedText || 
          'The friendly dragon felt a little tired and decided to take a nice nap. It was a peaceful day in the forest.';
      }
    }
    
    console.log('✅ OpenAI fallback generation successful with safety filtering');
    return safeResponse;
    
  } catch (error) {
    console.error('❌ OpenAI fallback generation failed:', error);
    throw error;
  }
}

export { generateStoryContent };
