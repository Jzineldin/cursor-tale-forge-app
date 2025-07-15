export function createEnhancedImagePrompt(prompt: string, visualContext?: any): string {
  let enhancedPrompt = prompt;
  
  // Add character consistency
  if (visualContext?.characters && Array.isArray(visualContext.characters) && visualContext.characters.length > 0) {
    const characterDescriptions = visualContext.characters
      .map((char: any) => typeof char === 'string' ? char : `${char.name}: ${char.description}`)
      .join(', ');
    
    if (characterDescriptions) {
      enhancedPrompt = `${enhancedPrompt} - Characters: ${characterDescriptions}`;
    }
  }
  
  // Add style consistency
  if (visualContext?.style) {
    enhancedPrompt = `${enhancedPrompt} - Art style: ${visualContext.style}`;
  }
  
  // Add quality descriptors
  enhancedPrompt = `High quality digital illustration, detailed and vibrant: ${enhancedPrompt}. Professional storybook art style, consistent character design.`;
  
  // Keep within limits (4000 chars for DALL-E, shorter for others)
  if (enhancedPrompt.length > 4000) {
    enhancedPrompt = enhancedPrompt.substring(0, 4000);
  }
  
  return enhancedPrompt;
}
