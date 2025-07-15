
import { useEffect, useState, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthProvider';
import { Story } from '@/types/stories';
import { useToast } from '@/hooks/use-toast';

const fetchUserStories = async (userId: string) => {
  const { data, error } = await supabase
    .from('stories')
    .select('id, title, created_at, is_public, is_completed, thumbnail_url, segment_count, story_mode, full_story_audio_url, audio_generation_status, shotstack_status, shotstack_video_url')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }
  return data as Story[];
};

export const useMyStories = () => {
  const { user, loading: authLoading } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isRealtimeConnected, setIsRealtimeConnected] = useState(true);
  const pollingInterval = useRef<number | null>(null);

  const { data: stories, isLoading, error, refetch } = useQuery({
    queryKey: ['stories', user?.id || ''],
    queryFn: () => {
      if (user) {
        return fetchUserStories(user.id);
      }
      return Promise.resolve([]);
    },
    enabled: !authLoading && !!user,
  });

  const handleRefresh = () => {
    if (user) {
      refetch();
    }
  };

  useEffect(() => {
    if (!user) return;

    const startPolling = () => {
        if (pollingInterval.current) return;
        pollingInterval.current = window.setInterval(() => {
            console.log('Polling for stories list updates...');
            queryClient.invalidateQueries({ queryKey: ['stories', user.id] });
        }, 15000);
    };

    const stopPolling = () => {
        if (pollingInterval.current) {
            clearInterval(pollingInterval.current);
            pollingInterval.current = null;
        }
    };

    const channel = supabase
      .channel(`my-stories-changes-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'stories',
          filter: `user_id=eq.${user.id}`,
        },
        (_payload) => {
          queryClient.invalidateQueries({ queryKey: ['stories', user.id] });
        }
      )
      .subscribe((status) => {
        const isConnected = status === 'SUBSCRIBED';
        setIsRealtimeConnected(isConnected);

        if (isConnected) {
            stopPolling();
        } else if (status !== 'CLOSED') {
            if (!pollingInterval.current) {
                toast({
                    title: "Live updates paused",
                    description: "Connection issue detected. Checking for updates periodically.",
                    variant: "default",
                    duration: 5000,
                });
            }
            startPolling();
        }
      });

    return () => {
      stopPolling();
      supabase.removeChannel(channel);
    };
  }, [user, queryClient, toast]);

  return {
    stories,
    isLoading,
    error,
    authLoading,
    isRealtimeConnected,
    handleRefresh,
  };
};
