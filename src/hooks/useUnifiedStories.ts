import { useAuth } from '@/context/AuthProvider';
import { useMyStories } from './useMyStories';
import { useAnonymousStories } from './useAnonymousStories';
import { Story } from '@/types/stories';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useUnifiedStories = () => {
  const { user, loading: authLoading } = useAuth();
  
  // Get user stories if authenticated
  const {
    stories: userStories = [],
    isLoading: userStoriesLoading,
    error: userStoriesError,
    handleRefresh: refreshUserStories,
    isRealtimeConnected
  } = useMyStories();

  // Get anonymous stories if not authenticated
  const {
    stories: anonymousStories = [],
    isLoading: anonymousStoriesLoading,
    error: anonymousStoriesError,
    handleRefresh: refreshAnonymousStories,
    removeAnonymousStory
  } = useAnonymousStories(authLoading, user);

  // Combine stories and loading states
  const stories: Story[] = user ? userStories : anonymousStories;
  const isLoading = authLoading || (user ? userStoriesLoading : anonymousStoriesLoading);
  const error = user ? userStoriesError : anonymousStoriesError;

  const handleRefresh = () => {
    if (user) {
      refreshUserStories();
    } else {
      refreshAnonymousStories();
    }
  };

  const deleteStory = async (storyId: string) => {
    try {
      if (user) {
        // Delete from database for authenticated users
        const { error } = await supabase
          .from('stories')
          .delete()
          .eq('id', storyId);

        if (error) throw error;
        
        toast.success('Story deleted successfully');
        refreshUserStories();
      } else {
        // Remove from local storage for anonymous users
        removeAnonymousStory(storyId);
        toast.success('Story removed from your local collection');
      }
    } catch (error) {
      console.error('Error deleting story:', error);
      toast.error('Failed to delete story');
    }
  };

  return {
    stories,
    isLoading,
    error,
    authLoading,
    isRealtimeConnected: user ? isRealtimeConnected : true,
    handleRefresh,
    deleteStory,
    user
  };
};