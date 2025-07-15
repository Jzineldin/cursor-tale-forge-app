
export interface StoryGenerationRequest {
  prompt?: string;
  genre?: string;
  storyId?: string;
  parentSegmentId?: string;
  choiceText?: string;
  skipImage?: boolean;
  skipAudio?: boolean;
  storyMode?: string;
  voice?: string;
}

export function validateRequest(body: any): StoryGenerationRequest {
  const { prompt, genre, storyId, parentSegmentId, choiceText, skipImage, skipAudio, storyMode, voice } = body;
  
  console.log('🚀 Story generation request:', { 
    hasPrompt: !!prompt, 
    genre: genre || storyMode, 
    storyId, 
    parentSegmentId, 
    choiceText,
    skipImage,
    skipAudio,
    voice
  });

  return {
    prompt,
    genre,
    storyId,
    parentSegmentId,
    choiceText,
    skipImage,
    skipAudio,
    storyMode,
    voice
  };
}
