// Enhanced Text Generation with Contextual Choice Generation
// This service implements two-step generation: story text first, then contextual choices

import { generateContextualChoices, ContextualChoiceRequest } from './simple-contextual-choices.ts';
import { generateEnhancedPromptWithContinuity } from './enhanced-prompts.ts';
import { applySafetyFilter } from './content-safety.ts';

export interface EnhancedStoryGenerationRequest {
  prompt: string;
  genre: string;
  previousSegments?: string[];
  storyContext?: any;
  choiceText?: string;
  characterNames?: string[];
  currentLocation?: string;
}

export interface EnhancedStoryGenerationResponse {
  segmentText: string;
  choices: string[];
  isEnd: boolean;
  imagePrompt: string;
  continuityValidation?: {
    isValid: boolean;
    issues: string[];
    suggestions: string[];
  };
  choiceGeneration?: {
    reasoning: string[];
    choiceTypes: string[];
  };
}

export async function generateEnhancedStoryWithContextualChoices(
  request: EnhancedStoryGenerationRequest
): Promise<EnhancedStoryGenerationResponse> {
  const {
    prompt,
    genre,
    previousSegments = [],
    storyContext,
    choiceText,
    characterNames = [],
    currentLocation
  } = request;

  console.log('[Enhanced Text Generation] Starting two-step generation process');

  // Step 1: Generate story text without choices
  const storyTextResponse = await generateStoryTextOnly(
    prompt,
    genre,
    previousSegments,
    storyContext,
    choiceText
  );

  console.log('[Enhanced Text Generation] Story text generated, now generating contextual choices');

  // Step 2: Generate contextual choices based on the actual story content
  const choiceRequest: ContextualChoiceRequest = {
    storyText: storyTextResponse.segmentText,
    genre,
    previousChoices: extractPreviousChoices(previousSegments),
    storyContext,
    characterNames,
    currentLocation,
    activeElements: extractActiveElements(storyTextResponse.segmentText)
  };

  const choiceResponse = await generateContextualChoices(choiceRequest);

  console.log('[Enhanced Text Generation] Contextual choices generated successfully');

  return {
    segmentText: storyTextResponse.segmentText,
    choices: choiceResponse.choices,
    isEnd: determineIfStoryEnd(storyTextResponse.segmentText, previousSegments.length),
    imagePrompt: storyTextResponse.imagePrompt,
    continuityValidation: storyTextResponse.continuityValidation,
    choiceGeneration: {
      reasoning: choiceResponse.reasoning,
      choiceTypes: choiceResponse.choiceTypes
    }
  };
}

// Step 1: Generate only story text with enhanced prompts
async function generateStoryTextOnly(
  prompt: string,
  genre: string,
  previousSegments: string[],
  storyContext?: any,
  choiceText?: string
): Promise<{
  segmentText: string;
  imagePrompt: string;
  continuityValidation?: any;
}> {
  // Build enhanced prompt for story text generation only
  const textOnlyPrompt = buildStoryTextOnlyPrompt(
    prompt,
    genre,
    previousSegments,
    storyContext,
    choiceText
  );

  // Call OVH API for story text generation
  const response = await fetch(process.env.OVH_API_URL!, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.OVH_AI_ENDPOINTS_ACCESS_TOKEN}`,
    },
    body: JSON.stringify({
      model: 'llama-3.1-70b-instruct',
      messages: [
        {
          role: 'system',
          content: textOnlyPrompt
        },
        {
          role: 'user',
          content: choiceText 
            ? `Continue the story based on this choice: "${choiceText}"`
            : `Start a new ${genre} story: "${prompt}"`
        }
      ],
      max_tokens: 600,
      temperature: 0.8,
      top_p: 0.9,
      response_format: { type: "json_object" }
    }),
  });

  if (!response.ok) {
    throw new Error(`Story text generation failed: ${response.status}`);
  }

  const data = await response.json();
  const parsedResponse = JSON.parse(data.choices[0].message.content);

  // Apply safety filters
  const safetyResult = applySafetyFilter({ segmentText: parsedResponse.segmentText });

  return {
    segmentText: safetyResult.segmentText,
    imagePrompt: parsedResponse.imagePrompt || '',
    continuityValidation: parsedResponse.continuityValidation
  };
}

function buildStoryTextOnlyPrompt(
  prompt: string,
  genre: string,
  previousSegments: string[],
  storyContext?: any,
  choiceText?: string
): string {
  // Get base enhanced prompt for continuity
  const basePrompt = generateEnhancedPromptWithContinuity(
    genre,
    prompt,
    storyContext,
    previousSegments
  );

  // Modify the prompt to generate ONLY story text, no choices
  const textOnlyPrompt = `${basePrompt}

CRITICAL: Generate ONLY story text, NO CHOICES. Choices will be generated separately.

RESPONSE FORMAT (EXACT JSON):
{
  "segmentText": "A 120-200 word story segment that ends naturally without choice prompts",
  "imagePrompt": "Detailed scene description for image generation",
  "isComplete": false
}

IMPORTANT REQUIREMENTS:
- Generate rich, engaging story text (120-200 words)
- Do NOT include any choice options in the response
- Do NOT include phrases like "What happens next?" or "Choose your path"
- End the story segment naturally as part of the narrative flow
- Focus on vivid descriptions, character development, and plot advancement
- The story should feel complete as a chapter while leaving room for continuation

The story text should stand alone as an engaging narrative segment. Choices will be generated based on the story content in a separate step.`;

  return textOnlyPrompt;
}

// Helper functions
function extractPreviousChoices(previousSegments: string[]): string[] {
  // Extract choices from previous segments
  // This would be implemented based on how choices are stored
  return [];
}

function extractActiveElements(storyText: string): string[] {
  // Extract active story elements like characters, objects, locations
  const elements: string[] = [];
  
  // Simple extraction - could be enhanced
  const words = storyText.split(/\s+/);
  words.forEach(word => {
    if (word.length > 3 && word[0] === word[0].toUpperCase()) {
      elements.push(word);
    }
  });

  return [...new Set(elements)].slice(0, 5);
}

function determineIfStoryEnd(storyText: string, segmentCount: number): boolean {
  // Simple heuristics to determine if story should end
  const endingKeywords = [
    'the end', 'finally', 'at last', 'concluded', 'finished',
    'lived happily', 'home safe', 'mission complete', 'adventure over'
  ];

  const hasEndingKeyword = endingKeywords.some(keyword =>
    storyText.toLowerCase().includes(keyword)
  );

  // End after 8-10 segments or if ending keywords detected
  return hasEndingKeyword || segmentCount >= 8;
}

// Fallback generation if enhanced system fails
export async function generateStoryWithBasicChoices(
  request: EnhancedStoryGenerationRequest
): Promise<EnhancedStoryGenerationResponse> {
  console.log('[Enhanced Text Generation] Using fallback basic generation');
  
  // Simple fallback that generates text and basic choices
  const { prompt, genre, choiceText } = request;
  
  const fallbackPrompt = `Generate a ${genre} story segment with 3 choices in JSON format:
{
  "segmentText": "A story segment (120-200 words)",
  "choices": ["Choice 1", "Choice 2", "Choice 3"],
  "isEnd": false,
  "imagePrompt": "Image description"
}`;

  const response = await fetch(process.env.OVH_API_URL!, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.OVH_AI_ENDPOINTS_ACCESS_TOKEN}`,
    },
    body: JSON.stringify({
      model: 'llama-3.1-70b-instruct',
      messages: [
        { role: 'system', content: fallbackPrompt },
        { 
          role: 'user', 
          content: choiceText 
            ? `Continue: ${choiceText}` 
            : `Start: ${prompt}`
        }
      ],
      max_tokens: 800,
      temperature: 0.8,
      response_format: { type: "json_object" }
    }),
  });

  if (!response.ok) {
    throw new Error(`Fallback generation failed: ${response.status}`);
  }

  const data = await response.json();
  const parsed = JSON.parse(data.choices[0].message.content);

  return {
    segmentText: parsed.segmentText || '',
    choices: parsed.choices || ['Continue the adventure', 'Try something different', 'Explore further'],
    isEnd: parsed.isEnd || false,
    imagePrompt: parsed.imagePrompt || '',
    choiceGeneration: {
      reasoning: ['Fallback choice generation'],
      choiceTypes: ['plot', 'character', 'exploration']
    }
  };
} 