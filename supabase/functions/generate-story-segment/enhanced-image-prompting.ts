import { validateImagePrompt, createSafeNegativePrompt } from './content-safety.ts';

export function createEnhancedImagePrompt(prompt: string, visualContext?: any): string {
  // First, validate the base prompt for safety
  const safeBasePrompt = validateImagePrompt(prompt);
  
  let enhancedPrompt = safeBasePrompt;
  
  // Add genre-specific enhancements based on context
  const genre = visualContext?.genre || 'fantasy-magic';
  const genreEnhancements = getGenreImageEnhancements(genre);
  
  // Add character consistency
  if (visualContext?.characters && Array.isArray(visualContext.characters) && visualContext.characters.length > 0) {
    const characterDescriptions = visualContext.characters
      .map((char: any) => typeof char === 'string' ? char : `${char.name}: ${char.description}`)
      .join(', ');
    
    if (characterDescriptions) {
      enhancedPrompt = `${enhancedPrompt} - Characters: ${characterDescriptions}`;
    }
  }
  
  // Add setting and atmosphere
  if (visualContext?.setting) {
    enhancedPrompt = `${enhancedPrompt} - Setting: ${visualContext.setting}`;
  }
  
  if (visualContext?.atmosphere) {
    enhancedPrompt = `${enhancedPrompt} - Atmosphere: ${visualContext.atmosphere}`;
  }
  
  // Add style consistency with safety emphasis
  const safeStyle = visualContext?.style ? `${visualContext.style}, child-friendly` : 'children\'s book illustration';
  enhancedPrompt = `${enhancedPrompt} - Art style: ${safeStyle}`;
  
  // Add genre-specific enhancements
  enhancedPrompt = `${enhancedPrompt}, ${genreEnhancements}`;
  
  // Add comprehensive safety and quality descriptors
  const safetyDescriptors = [
    'child-friendly',
    'colorful',
    'bright',
    'cheerful',
    'cartoon style',
    'children\'s book illustration',
    'safe for kids',
    'positive atmosphere',
    'non-scary',
    'wholesome',
    'age-appropriate'
  ].join(', ');
  
  enhancedPrompt = `High quality digital illustration: ${enhancedPrompt}. ${safetyDescriptors}. Professional storybook art style with consistent character design.`;
  
  // Keep within limits (4000 chars for DALL-E, shorter for others)
  if (enhancedPrompt.length > 4000) {
    enhancedPrompt = enhancedPrompt.substring(0, 4000);
  }
  
  console.log('🎨 Enhanced safe image prompt:', enhancedPrompt.substring(0, 200) + '...');
  
  return enhancedPrompt;
}

/**
 * Gets genre-specific image enhancements for safe, child-appropriate imagery
 */
function getGenreImageEnhancements(genre: string): string {
  const enhancements = {
    'fantasy-magic': 'whimsical, magical, friendly dragons, cute unicorns, sparkles, bright colors, enchanted forest, fairy tale castle',
    'educational-stories': 'educational, clear diagrams, learning elements, bright classroom, friendly teacher, curious students, colorful books',
    'mystery-detective': 'cute detective theme, magnifying glass, friendly mystery, cozy library, detective hat, mystery clues, warm lighting',
    'silly-humor': 'funny, cartoon comedy, exaggerated expressions, bright colors, silly situations, laughing characters, playful atmosphere',
    'bedtime-stories': 'soft, dreamy, gentle lighting, cozy bedroom, peaceful night sky, sleeping animals, warm colors, calming atmosphere',
    'science-space': 'friendly space adventure, cute robots, colorful planets, smiling astronauts, bright stars, futuristic but friendly',
    'values-lessons': 'heartwarming, diverse children, positive interactions, friendship, helping others, emotional warmth, inclusive',
    'adventure-exploration': 'exciting but safe adventure, beautiful landscapes, friendly explorers, treasure maps, safe journeys, discovery'
  };

  return enhancements[genre as keyof typeof enhancements] || enhancements['fantasy-magic'];
}

/**
 * Creates comprehensive safe negative prompt for image generation
 */
export function getSafeNegativePrompt(): string {
  return createSafeNegativePrompt();
}
