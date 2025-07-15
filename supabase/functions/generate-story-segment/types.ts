
// Types for the generate-story-segment edge function
export interface GenerateStoryRequest {
  prompt?: string;
  storyId?: string;
  parentSegmentId?: string;
  choiceText?: string;
  storyMode?: string;
}

export interface GenerateStoryResponse {
  success: boolean;
  data?: {
    id: string;
    story_id: string;
    segment_text: string;
    choices: string[];
    is_end: boolean;
    image_url: string;
    parent_segment_id?: string;
    triggering_choice_text?: string; // Fixed: Updated to match database schema
    created_at: string;
    updated_at: string;
  };
  error?: string;
  code?: string;
}

export interface ValidationError {
  field: string;
  message: string;
}

export function validateRequest(request: any): { isValid: boolean; errors: ValidationError[] } {
  const errors: ValidationError[] = [];
  
  // Basic validation
  if (request.prompt && typeof request.prompt !== 'string') {
    errors.push({ field: 'prompt', message: 'Prompt must be a string' });
  }
  
  if (request.prompt && request.prompt.length > 2000) {
    errors.push({ field: 'prompt', message: 'Prompt cannot exceed 2000 characters' });
  }
  
  if (request.choiceText && typeof request.choiceText !== 'string') {
    errors.push({ field: 'choiceText', message: 'Choice text must be a string' });
  }
  
  if (request.choiceText && request.choiceText.length > 500) {
    errors.push({ field: 'choiceText', message: 'Choice text cannot exceed 500 characters' });
  }
  
  if (request.storyMode && typeof request.storyMode !== 'string') {
    errors.push({ field: 'storyMode', message: 'Story mode must be a string' });
  }
  
  return { isValid: errors.length === 0, errors };
}
