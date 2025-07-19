import { supabase } from "@/integrations/supabase/client";

export async function generateStorySegment(p: {
  prompt: string;
  age: string;
  genre: string;
  storyId?: string;
  parentSegmentId?: string;
  choiceText?: string;
  skipImage?: boolean;
}) {
  const { data, error } = await supabase.functions.invoke(
    "generate-story-segment",
    { body: p }
  );

  if (error || !data?.text) {
    // Don't return mock - let React handle the error state
    throw new Error('AI generation failed');
  }

  // Check if we got a mock story (should never happen now)
  if (data.text?.startsWith('Once upon a time, in a magical forest, there lived a friendly little fox named Luna')) {
    console.warn('Received mock story - retrying...');
    throw new Error('mock-response');
  }

  // Validate choices structure
  if (!data.choices || !Array.isArray(data.choices) || data.choices.length !== 3) {
    console.warn('Invalid choices structure, using fallback');
    data.choices = ['Continue the adventure', 'Explore a new path', 'Learn something new'];
  }
  
  return data; // { text: "generated story", image_url: "...", choices: [...], is_end: false }
} 