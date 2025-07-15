/**
 * OVH Public Cloud AI text generation using Qwen2.5-Coder-32B-Instruct
 * 
 * This service provides enhanced reasoning capabilities for educational storytelling
 * with improved context understanding and educational content integration.
 */

export interface OVHTextRequest {
  model: string;
  messages: Array<{role: string; content: string}>;
  max_tokens: number;
  temperature: number;
  response_format?: { type: string };
}

export interface OVHTextResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

/**
 * Generate story content using OVH's Qwen2.5 model with enhanced educational features
 */
export async function generateStoryWithQwen(
  initialPrompt?: string,
  choiceText?: string,
  visualContext?: any,
  narrativeContext?: any,
  storyMode?: string,
  supabaseClient?: any
): Promise<any> {
  const OVH_API_TOKEN = Deno.env.get('OVH_AI_ENDPOINTS_ACCESS_TOKEN');
  
  console.log('🔍 OVH API Diagnostics:');
  console.log(`- Token available: ${OVH_API_TOKEN ? 'Yes' : 'No'}`);
  console.log(`- Token length: ${OVH_API_TOKEN ? OVH_API_TOKEN.length : 0} chars`);
  console.log(`- Token prefix: ${OVH_API_TOKEN ? OVH_API_TOKEN.substring(0, 8) + '...' : 'N/A'}`);
  
  if (!OVH_API_TOKEN) {
    console.error('❌ OVH_AI_ENDPOINTS_ACCESS_TOKEN not found in environment variables');
    throw new Error('OVH_AI_ENDPOINTS_ACCESS_TOKEN not available - check Supabase secrets configuration');
  }

  console.log('🤖 Generating story with OVH Qwen2.5-Coder-32B-Instruct...');

  // Enhanced visual context for consistency
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

  // Enhanced narrative context with comprehensive story tracking
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

  const systemPrompt = `You are TaleForge's advanced AI storyteller powered by Qwen2.5. Create engaging, educational, age-appropriate stories for children ages 4-14.

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

STORY REQUIREMENTS:
- Generate exactly 120-200 words for rich, detailed storytelling
- Create exactly 3 meaningful choices that advance both plot and learning
- Naturally weave educational content into the narrative
- Use age-appropriate language and themes
- Include detailed image descriptions for visual consistency
- DO NOT include choice prompts or transitions within the segmentText
- The segmentText should end naturally as part of the story narrative
- MAINTAIN CONSISTENCY with previous story segments and established characters
- CONTINUE the narrative flow naturally from the previous context

EDUCATIONAL INTEGRATION:
- Incorporate learning opportunities naturally into the story
- Include problem-solving scenarios appropriate for the age group
- Promote critical thinking through meaningful choices
- Foster creativity and imagination
- Ensure content is safe, positive, and inspiring

Response format (EXACT JSON):
{
  "segmentText": "A 120-200 word story segment with educational elements woven naturally into engaging narrative",
  "choices": ["Educational choice 1", "Learning-focused choice 2", "Character development choice 3"],
  "isEnd": false,
  "imagePrompt": "Detailed scene description for child-friendly, colorful, safe image generation",
  "visualContext": {"style": "children's book illustration", "characters": {"name": "description"}, "setting": "current location"},
  "narrativeContext": {"summary": "updated story summary", "currentObjective": "next learning goal", "arcStage": "current stage"},
  "educationalElements": ["learning objective 1", "skill developed", "concept explored"],
  "ageAppropriateness": "4-6|7-9|10-14",
  "readingLevel": "beginner|intermediate|advanced"
}`;

  // Build context from narrative context
  let contextPrompt = '';
  if (narrativeContext?.previousSegments) {
    contextPrompt = '\n\nPREVIOUS STORY CONTEXT:\n' + narrativeContext.previousSegments;
  }

  const userPrompt = initialPrompt 
    ? `Start a new educational ${storyMode || 'fantasy'} story: "${initialPrompt}"`
    : `Continue the educational story. User chose: "${choiceText}"${contextPrompt}${visualContextPrompt}${narrativeContextPrompt}`;

  try {
    console.log('📡 OVH API Request Details:');
    console.log(`- URL: https://oai.endpoints.kepler.ai.cloud.ovh.net/v1/chat/completions`);
    console.log(`- Method: POST`);
    console.log(`- Auth header length: ${OVH_API_TOKEN.length + 7} chars (Bearer + token)`);
    console.log(`- User prompt length: ${userPrompt.length} chars`);
    
    // Use OVHcloud AI Endpoints with OpenAI-compatible format
    const response = await fetch('https://oai.endpoints.kepler.ai.cloud.ovh.net/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OVH_API_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'Qwen2.5-Coder-32B-Instruct',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: 1000,
        temperature: 0.7,
        response_format: { type: "json_object" }
      })
    });

    console.log(`📊 OVH API Response Status: ${response.status} ${response.statusText}`);
    console.log(`📊 Response Headers:`, Object.fromEntries(response.headers.entries()));
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ OVH Qwen2.5 API failed: ${response.status} - ${errorText}`);
      console.error(`📄 Full error response: ${errorText}`);
      
      // Handle specific error codes
      if (response.status === 401) {
        console.error('🔐 Authentication failed - check OVH_AI_ENDPOINTS_ACCESS_TOKEN validity');
        throw new Error('OVH authentication failed - invalid OVH_AI_ENDPOINTS_ACCESS_TOKEN');
      } else if (response.status === 429) {
        console.error('⚠️ OVH Rate Limit Exceeded: You have exceeded the rate limit for OVHcloud AI Endpoints.');
        console.error('📊 Rate limits: Anonymous (2 req/min), Authenticated (400 req/min per project)');
        console.error('💡 Please wait before making another request or check your authentication.');
        throw new Error('OVH rate limit exceeded - please try again later');
      } else if (response.status >= 500) {
        console.error('🔥 OVH server error - their service may be temporarily unavailable');
        throw new Error('OVH server error - service temporarily unavailable');
      }
      
      throw new Error(`OVH Qwen2.5 API failed: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('🔍 OVH Qwen2.5 raw response structure:', {
      hasChoices: !!data.choices,
      choicesLength: data.choices?.length || 0,
      hasContent: !!(data.choices && data.choices[0]?.message?.content),
      keys: Object.keys(data || {})
    });
    console.log('📄 OVH Qwen2.5 raw response (first 500 chars):', JSON.stringify(data).substring(0, 500) + '...');
    
    // Extract generated text from OpenAI-compatible response format
    let generatedText: string;
    if (data.choices && data.choices[0]?.message?.content) {
      generatedText = data.choices[0].message.content;
    } else {
      console.error('❌ No generated text found in OVH response');
      console.error('📄 Full response structure:', JSON.stringify(data, null, 2));
      throw new Error('OVH Qwen2.5 returned unexpected response format - expected OpenAI-compatible format');
    }
    
    console.log(`📝 Generated text length: ${generatedText.length} chars`);
    console.log(`📝 Generated text preview: ${generatedText.substring(0, 200)}...`);
    
    // Parse JSON from the generated text
    let parsedResponse;
    try {
      parsedResponse = JSON.parse(generatedText);
    } catch (parseError) {
      console.error('❌ Failed to parse JSON from OVH response:', parseError);
      console.error('📄 Raw response:', generatedText);
      
      // Try to extract JSON from the response if it's wrapped in other text
      const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          parsedResponse = JSON.parse(jsonMatch[0]);
        } catch (extractError) {
          throw new Error('Failed to parse OVH response as JSON even after extraction');
        }
      } else {
        throw new Error('No JSON found in OVH response');
      }
    }
    
    // Validate required fields
    if (!parsedResponse.segmentText || !parsedResponse.choices) {
      throw new Error('OVH response missing required fields (segmentText, choices)');
    }
    
    console.log('✅ OVH Qwen2.5 story generation successful');
    console.log('📚 Educational elements:', parsedResponse.educationalElements);
    console.log('🎯 Age appropriateness:', parsedResponse.ageAppropriateness);
    
    return parsedResponse;
    
  } catch (error) {
    console.error('❌ OVH Qwen2.5 generation failed:', error);
    console.error('🔍 Error type:', error.constructor.name);
    console.error('📄 Error message:', error.message);
    console.error('📄 Error stack:', error.stack);
    
    // Provide more specific error context
    if (error.message.includes('Failed to fetch')) {
      console.error('🌐 Network error - check if OVH endpoint is accessible');
    } else if (error.message.includes('JSON')) {
      console.error('📊 JSON parsing error - OVH response format may have changed');
    }
    
    throw error;
  }
}