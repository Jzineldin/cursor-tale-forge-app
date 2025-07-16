/**
 * OVH Public Cloud AI text generation using Qwen2.5-Coder-32B-Instruct
 * 
 * This service provides enhanced reasoning capabilities for educational storytelling
 * with improved context understanding, content safety, and educational content integration.
 */

import { generateEnhancedPromptWithContinuity, validateStoryContinuity } from './enhanced-prompts.ts';
import { applySafetyFilter, validateUserInput, validateImagePrompt } from './content-safety.ts';

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
export async function generateStoryWithOVH(
  prompt: string,
  genre: string = 'fantasy-magic',
  previousSegments: string[] = [],
  storyContext?: any
): Promise<{
  text: string;
  continuityValidation?: {
    isValid: boolean;
    issues: string[];
    suggestions: string[];
  };
}> {
  try {
    console.log(`[OVH Text Service] Generating story for genre: ${genre}`);
    
    // Generate enhanced prompt with narrative continuity
    const enhancedPrompt = generateEnhancedPromptWithContinuity(
      genre,
      prompt,
      storyContext,
      previousSegments
    );

    console.log(`[OVH Text Service] Enhanced prompt generated with continuity checks`);

    const response = await fetch(process.env.OVH_API_URL!, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OVH_API_KEY}`,
      },
      body: JSON.stringify({
        model: process.env.OVH_MODEL_NAME || 'llama-3.1-70b-instruct',
        messages: [
          {
            role: 'system',
            content: enhancedPrompt
          },
          {
            role: 'user',
            content: `Generate the next chapter of this ${genre} story: ${prompt}`
          }
        ],
        max_tokens: 800,
        temperature: 0.8,
        top_p: 0.9,
        stream: false,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[OVH Text Service] API Error: ${response.status} - ${errorText}`);
      throw new Error(`OVH API request failed: ${response.status}`);
    }

    const data = await response.json();
    console.log(`[OVH Text Service] Response received successfully`);

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error('[OVH Text Service] Invalid response structure:', data);
      throw new Error('Invalid response from OVH API');
    }

    const generatedText = data.choices[0].message.content.trim();

    // Validate story continuity if we have previous segments
    let continuityValidation;
    if (previousSegments.length > 0) {
      continuityValidation = validateStoryContinuity(
        genre,
        previousSegments,
        generatedText
      );

      console.log(`[OVH Text Service] Continuity validation:`, continuityValidation);

      // If continuity issues are found, log them for monitoring
      if (!continuityValidation.isValid) {
        console.warn(`[OVH Text Service] Continuity issues detected:`, continuityValidation.issues);
      }
    }

    // Apply content safety validation using existing safety filter
    const safetyResult = applySafetyFilter({ segmentText: generatedText });
    
    if (safetyResult.segmentText !== generatedText) {
      console.log('[OVH Text Service] Content was sanitized by safety filter');
      return {
        text: safetyResult.segmentText,
        continuityValidation
      };
    }

    console.log(`[OVH Text Service] Story generation completed successfully`);
    
    return {
      text: generatedText,
      continuityValidation
    };

  } catch (error) {
    console.error('[OVH Text Service] Error:', error);
    
    // Fallback to basic generation if enhanced system fails
    if (error instanceof Error && error.message.includes('continuity')) {
      console.log('[OVH Text Service] Falling back to basic generation due to continuity error');
      return generateBasicStoryWithOVH(prompt, genre);
    }
    
    throw error;
  }
}

// Fallback basic generation without continuity features
async function generateBasicStoryWithOVH(
  prompt: string,
  genre: string
): Promise<{ text: string }> {
  // Original generation logic as fallback
  const basePrompt = getGenrePrompt(genre);
  
  const response = await fetch(process.env.OVH_API_URL!, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.OVH_API_KEY}`,
    },
    body: JSON.stringify({
      model: process.env.OVH_MODEL_NAME || 'llama-3.1-70b-instruct',
      messages: [
        {
          role: 'system',
          content: basePrompt
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 800,
      temperature: 0.8,
      top_p: 0.9,
      stream: false,
    }),
  });

  if (!response.ok) {
    throw new Error(`OVH API request failed: ${response.status}`);
  }

  const data = await response.json();
  return { text: data.choices[0].message.content.trim() };
}

// Enhanced genre-specific prompts for continuity (keeping existing ones as fallback)
function getGenrePrompt(genre: string): string {
  // Existing genre prompt logic for fallback
  const genrePrompts = {
    'fantasy-magic': `Create a whimsical, child-friendly fantasy story segment...`,
    'educational-adventure': `Create an educational adventure story segment...`,
    'mystery-detective': `Create a kid-friendly mystery story segment...`,
    'bedtime-stories': `Create a calming bedtime story segment...`,
    'science-space': `Create an exciting but safe space adventure...`,
    'humor-comedy': `Create a funny, lighthearted story segment...`,
    'values-lessons': `Create a story that teaches important values...`
  };

  return genrePrompts[genre as keyof typeof genrePrompts] || genrePrompts['fantasy-magic'];
}