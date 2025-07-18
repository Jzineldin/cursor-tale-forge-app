/**
 * OVH Public Cloud AI text generation using Qwen2.5-Coder-32B-Instruct
 * 
 * This service provides enhanced reasoning capabilities for educational storytelling
 * with improved context understanding, content safety, and educational content integration.
 */

import { generateEnhancedPromptWithContinuity, validateStoryContinuity } from './enhanced-prompts.ts';
import { applySafetyFilter, validateUserInput, validateImagePrompt } from './content-safety.ts';

/**
 * Get age-appropriate content guidelines for story generation
 */
function getAgeAppropriateGuidelines(targetAge: '4-6' | '7-9' | '10-12'): string {
  switch (targetAge) {
    case '4-6':
      return `AGE 4-6 GUIDELINES:
- Use simple, clear language with short sentences (5-8 words max)
- Focus on basic concepts: colors, numbers, shapes, animals, family
- Include gentle, positive themes: friendship, sharing, helping others
- Use repetitive patterns and familiar scenarios
- Keep stories under 100 words per segment
- Avoid complex emotions or abstract concepts
- Include simple moral lessons with clear right and wrong
- Use familiar settings: home, school, park, farm
- Gentle conflicts with quick, reassuring resolutions
- NO violence, scary content, or complex emotions`;
    case '7-9':
      return `AGE 7-9 GUIDELINES:
- Use clear, engaging language with varied sentence structure
- Include educational elements: science, history, geography concepts
- Focus on problem-solving and critical thinking
- Include character development and emotional growth
- Keep stories 100-150 words per segment
- Introduce mild challenges that are resolved through cooperation
- Include positive role models and teamwork themes
- Use imaginative settings with some educational value
- Gentle adventure with learning opportunities
- Mild challenges only, no violence or scary content`;
    case '10-12':
      return `AGE 10-12 GUIDELINES:
- Use more sophisticated language and complex sentence structures
- Include deeper character development and emotional complexity
- Focus on themes of identity, responsibility, and personal growth
- Include educational content woven naturally into the story
- Keep stories 150-200 words per segment
- Include more complex problem-solving and decision-making
- Explore themes of justice, fairness, and social responsibility
- Use diverse settings and cultural elements
- Adventure with meaningful challenges and character growth
- Age-appropriate challenges, no graphic content or mature themes`;
  }
}

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
  segmentText: string;
  choices: string[];
  isEnd: boolean;
  imagePrompt: string;
  continuityValidation?: {
    isValid: boolean;
    issues: string[];
    suggestions: string[];
  };
}> {
  try {
    console.log(`[OVH Text Service] Generating story for genre: ${genre}`);
    
    // Get age-appropriate guidelines
    const targetAge = storyContext?.targetAge || '7-9';
    const ageGuidelines = getAgeAppropriateGuidelines(targetAge);
    
    // Generate enhanced prompt with narrative continuity and age guidelines
    const enhancedPrompt = generateEnhancedPromptWithContinuity(
      genre,
      prompt,
      storyContext,
      previousSegments
    ) + `\n\n${ageGuidelines}`;

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
    
    // Parse the generated text to extract story elements
    const storyElements = parseStoryResponse(generatedText);
    
    if (safetyResult.segmentText !== generatedText) {
      console.log('[OVH Text Service] Content was sanitized by safety filter');
      return {
        segmentText: safetyResult.segmentText,
        choices: storyElements.choices,
        isEnd: storyElements.isEnd,
        imagePrompt: storyElements.imagePrompt,
        continuityValidation
      };
    }

    console.log(`[OVH Text Service] Story generation completed successfully`);
    
    return {
      segmentText: generatedText,
      choices: storyElements.choices,
      isEnd: storyElements.isEnd,
      imagePrompt: storyElements.imagePrompt,
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

/**
 * Parse story response to extract structured elements
 */
function parseStoryResponse(text: string): {
  segmentText: string;
  choices: string[];
  isEnd: boolean;
  imagePrompt: string;
} {
  // Try to parse as JSON first
  try {
    const parsed = JSON.parse(text);
    return {
      segmentText: parsed.segmentText || text,
      choices: parsed.choices || ['Continue the story', 'Explore more', 'Help the characters'],
      isEnd: parsed.isEnd || false,
      imagePrompt: parsed.imagePrompt || 'A colorful, child-friendly scene from the story'
    };
  } catch {
    // If not JSON, treat as plain text
    return {
      segmentText: text,
      choices: ['Continue the story', 'Explore more', 'Help the characters'],
      isEnd: false,
      imagePrompt: 'A colorful, child-friendly scene from the story'
    };
  }
}

// Fallback basic generation without continuity features
async function generateBasicStoryWithOVH(
  prompt: string,
  genre: string
): Promise<{
  segmentText: string;
  choices: string[];
  isEnd: boolean;
  imagePrompt: string;
}> {
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
  const generatedText = data.choices[0].message.content.trim();
  return parseStoryResponse(generatedText);
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