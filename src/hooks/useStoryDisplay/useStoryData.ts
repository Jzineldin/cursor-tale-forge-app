import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { isProperUUID, isValidUUID } from './utils';

export interface StoryData {
  id: string;
  title?: string;
  full_story_audio_url?: string | null;
  audio_generation_status?: string;
  is_public?: boolean;
  is_completed?: boolean;
}

export const useStoryData = (storyId?: string) => {
  const [storyData, setStoryData] = useState<StoryData | null>(null);

  // Fetch story data including full audio URL
  const fetchStoryData = async (id: string) => {
    // Only query database for proper UUIDs
    if (!isProperUUID(id)) {
      console.log('Skipping database query for custom story ID:', id);
      return;
    }
    
    try {
      console.log('📚 Fetching story data for:', id);
      const { data: story, error } = await supabase
        .from('stories')
        .select('id, title, full_story_audio_url, audio_generation_status, is_public, is_completed')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching story data:', error);
        return;
      }

      if (story) {
        console.log('📚 Story data loaded:', { 
          id: story.id, 
          hasAudio: !!story.full_story_audio_url,
          audioStatus: story.audio_generation_status 
        });
        setStoryData({
          id: story.id,
          title: story.title || '',
          full_story_audio_url: story.full_story_audio_url,
          audio_generation_status: story.audio_generation_status || 'not_started',
          is_public: story.is_public || false,
          is_completed: story.is_completed || false
        });
      }
    } catch (error) {
      console.error('Error fetching story data:', error);
    }
  };

  // Add refresh function for audio generation callbacks
  const refreshStoryData = async () => {
    if (!storyId || !isValidUUID(storyId)) return;
    
    console.log('🔄 Refreshing story data after audio generation...');
    await fetchStoryData(storyId);
  };

  // Set up real-time subscription for story updates
  useEffect(() => {
    // Only set up subscription for proper UUIDs
    if (!storyId || !isProperUUID(storyId)) return;

    console.log('🔔 Setting up real-time subscription for story:', storyId);
    
    const subscription = supabase
      .channel(`story-updates-${storyId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'stories',
          filter: `id=eq.${storyId}`
        },
        (payload) => {
          console.log('🔔 Real-time story update received:', {
            storyId: storyId,
            audioStatus: payload.new?.audio_generation_status,
            audioUrl: payload.new?.full_story_audio_url ? 'Present' : 'Missing',
            timestamp: new Date().toISOString()
          });
          
          // Update story data with new audio information
          if (payload.new) {
            setStoryData(prev => ({
              ...prev,
              ...payload.new,
              id: payload.new.id,
              title: payload.new.title,
              full_story_audio_url: payload.new.full_story_audio_url,
              audio_generation_status: payload.new.audio_generation_status
            }));
          }
        }
      )
      .subscribe();

    return () => {
      console.log('🧹 Cleaning up real-time subscription for story:', storyId);
      supabase.removeChannel(subscription);
    };
  }, [storyId]);

  return {
    storyData,
    setStoryData,
    fetchStoryData,
    refreshStoryData,
  };
};