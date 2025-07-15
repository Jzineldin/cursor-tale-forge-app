
import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

// Function to get story context for continuation
export async function getStoryContext(storyId: string, supabaseClient: SupabaseClient) {
  console.log('Fetching story context for story:', storyId);
  
  const { data: story, error } = await supabaseClient
    .from('stories')
    .select('visual_context, narrative_context, story_mode')
    .eq('id', storyId)
    .single();

  if (error) {
    console.error('Error fetching story context:', error);
    throw new Error(`Failed to fetch story context: ${error.message}`);
  }

  return {
    visualContext: story?.visual_context || null,
    narrativeContext: story?.narrative_context || null,
    storyMode: story?.story_mode || null,
  };
}

// Function to update story context after generating new segment
export async function updateStoryContext(
  storyId: string, 
  visualContext: any, 
  narrativeContext: any, 
  supabaseClient: SupabaseClient
) {
  console.log('Updating story context for story:', storyId);
  
  const updateData: any = {};
  
  if (visualContext) {
    updateData.visual_context = visualContext;
  }
  
  if (narrativeContext) {
    updateData.narrative_context = narrativeContext;
  }
  
  if (Object.keys(updateData).length === 0) {
    console.log('No context updates needed');
    return;
  }

  const { error } = await supabaseClient
    .from('stories')
    .update(updateData)
    .eq('id', storyId);

  if (error) {
    console.error('Error updating story context:', error);
    throw new Error(`Failed to update story context: ${error.message}`);
  }

  console.log('Story context updated successfully');
}
