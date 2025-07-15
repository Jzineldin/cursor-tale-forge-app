import { supabase } from '@/integrations/supabase/client';

export interface AutosaveData {
  storyId: string;
  segmentId: string;
  storyTitle?: string;
  segmentCount: number;
  isEnd?: boolean;
}

/**
 * Autosave utility for saving story progress after each segment
 * Handles both authenticated and anonymous users
 */
export const autosaveStoryProgress = async (data: AutosaveData): Promise<void> => {
  try {
    console.log('💾 Autosaving story progress:', data);
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      // Authenticated user - ensure story is saved to database
      await autosaveForAuthenticatedUser(data, user.id);
    } else {
      // Anonymous user - save to localStorage
      await autosaveForAnonymousUser(data);
    }
    
    console.log('✅ Autosave completed successfully');
  } catch (error) {
    console.error('❌ Autosave failed:', error);
    // Don't show error toast to user - autosave should be silent
  }
};

/**
 * Autosave for authenticated users - ensure story is in database
 */
const autosaveForAuthenticatedUser = async (data: AutosaveData, userId: string): Promise<void> => {
  try {
    // Check if story exists in database
    const { data: existingStory, error: checkError } = await supabase
      .from('stories')
      .select('id, user_id, is_completed')
      .eq('id', data.storyId)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      throw checkError;
    }

    if (existingStory) {
      // Story exists - update if needed
      const updates: any = {};
      
      // Update user ownership if not set
      if (!existingStory.user_id) {
        updates.user_id = userId;
      }
      
      // Update completion status if story ended
      if (data.isEnd && !existingStory.is_completed) {
        updates.is_completed = true;
      }
      
      // Update segment count
      updates.segment_count = data.segmentCount;
      
      if (Object.keys(updates).length > 0) {
        const { error: updateError } = await supabase
          .from('stories')
          .update(updates)
          .eq('id', data.storyId);
        
        if (updateError) throw updateError;
      }
    } else {
      // Story doesn't exist - create it
      const { error: createError } = await supabase
        .from('stories')
        .insert({
          id: data.storyId,
          title: data.storyTitle || 'Untitled Story',
          user_id: userId,
          is_completed: data.isEnd || false,
          segment_count: data.segmentCount,
          story_mode: 'fantasy' // Default, can be updated later
        });
      
      if (createError) throw createError;
    }
  } catch (error) {
    console.error('Error autosaving for authenticated user:', error);
    throw error;
  }
};

/**
 * Autosave for anonymous users - track story ID in localStorage
 */
const autosaveForAnonymousUser = async (data: AutosaveData): Promise<void> => {
  try {
    // Get existing anonymous story IDs
    const existingIds = JSON.parse(localStorage.getItem('anonymous_story_ids') || '[]');
    
    // Add story ID if not already present
    if (!existingIds.includes(data.storyId)) {
      existingIds.push(data.storyId);
      localStorage.setItem('anonymous_story_ids', JSON.stringify(existingIds));
      
      // Also save story metadata for better UX
      const storyMetadata = JSON.parse(localStorage.getItem('anonymous_story_metadata') || '{}');
      storyMetadata[data.storyId] = {
        title: data.storyTitle || 'Untitled Story',
        segmentCount: data.segmentCount,
        isCompleted: data.isEnd || false,
        lastUpdated: new Date().toISOString()
      };
      localStorage.setItem('anonymous_story_metadata', JSON.stringify(storyMetadata));
    } else {
      // Update existing story metadata
      const storyMetadata = JSON.parse(localStorage.getItem('anonymous_story_metadata') || '{}');
      if (storyMetadata[data.storyId]) {
        storyMetadata[data.storyId] = {
          ...storyMetadata[data.storyId],
          segmentCount: data.segmentCount,
          isCompleted: data.isEnd || false,
          lastUpdated: new Date().toISOString()
        };
        localStorage.setItem('anonymous_story_metadata', JSON.stringify(storyMetadata));
      }
    }
  } catch (error) {
    console.error('Error autosaving for anonymous user:', error);
    throw error;
  }
};

/**
 * Hook for using autosave functionality
 */
export const useAutosave = () => {
  
  const autosave = async (data: AutosaveData) => {
    await autosaveStoryProgress(data);
  };
  
  return { autosave };
}; 