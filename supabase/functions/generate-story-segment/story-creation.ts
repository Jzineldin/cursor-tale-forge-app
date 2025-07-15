
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

export async function createStoryIfNeeded(
  supabaseClient: any,
  storyId: string | undefined,
  prompt: string | undefined,
  genre: string | undefined,
  storyMode: string | undefined
): Promise<string> {
  let finalStoryId = storyId;
  
  if (!finalStoryId && prompt) {
    console.log('📝 Creating new story record...');
    const { data: newStory, error: storyError } = await supabaseClient
      .from('stories')
      .insert({
        title: prompt.substring(0, 100) + (prompt.length > 100 ? '...' : ''),
        description: prompt,
        story_mode: genre || storyMode || 'fantasy',
        user_id: null
      })
      .select()
      .single();

    if (storyError) {
      console.error('❌ Story creation error:', storyError);
      throw new Error(`Failed to create story: ${storyError.message}`);
    }

    finalStoryId = newStory.id;
    console.log('✅ New story created with ID:', finalStoryId);
  }

  if (!finalStoryId) {
    throw new Error('No story ID available');
  }

  return finalStoryId;
}

export async function fetchPreviousSegments(
  supabaseClient: any,
  storyId: string
): Promise<any[]> {
  const { data: segments } = await supabaseClient
    .from('story_segments')
    .select('*')
    .eq('story_id', storyId)
    .order('created_at', { ascending: true });
  
  return segments || [];
}
