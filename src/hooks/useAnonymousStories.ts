
import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Story } from '@/types/stories';

const fetchAnonymousStories = async (storyIds: string[]) => {
  if (!storyIds || storyIds.length === 0) {
    return [];
  }
  const { data, error } = await supabase
    .from('stories')
    .select('id, title, created_at, is_public, is_completed, thumbnail_url, segment_count, story_mode, full_story_audio_url, audio_generation_status, shotstack_status, shotstack_video_url')
    .in('id', storyIds)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }
  return data as Story[];
};

export const useAnonymousStories = (authLoading: boolean, user: any) => {
  const queryClient = useQueryClient();
  const [anonymousStoryIds, setAnonymousStoryIds] = useState<string[]>([]);

  useEffect(() => {
    if (!authLoading && !user) {
      try {
        const storedIds = JSON.parse(localStorage.getItem('anonymous_story_ids') || '[]');
        setAnonymousStoryIds(storedIds);
      } catch (e) {
        console.error("Failed to load anonymous stories from local storage", e);
        setAnonymousStoryIds([]);
      }
    }
  }, [user, authLoading]);

  const { data: stories, isLoading, error } = useQuery({
    queryKey: ['stories', anonymousStoryIds.join(',')],
    queryFn: () => fetchAnonymousStories(anonymousStoryIds),
    enabled: !authLoading && !user && anonymousStoryIds.length > 0,
  });

  const handleRefresh = () => {
    try {
      const storedIds = JSON.parse(localStorage.getItem('anonymous_story_ids') || '[]');
      setAnonymousStoryIds(storedIds);
      queryClient.invalidateQueries({ queryKey: ['stories', storedIds.join(',')] });
    } catch (e) {
      console.error("Failed to refresh anonymous stories", e);
    }
  };

  const removeAnonymousStory = (storyId: string) => {
    const newIds = anonymousStoryIds.filter(id => id !== storyId);
    localStorage.setItem('anonymous_story_ids', JSON.stringify(newIds));
    setAnonymousStoryIds(newIds);
  };

  return {
    stories: stories || [],
    isLoading,
    error,
    anonymousStoryIds,
    handleRefresh,
    removeAnonymousStory,
  };
};
