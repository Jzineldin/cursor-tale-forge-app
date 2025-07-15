
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface RealtimePayload {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
  new: Record<string, unknown>;
  old: Record<string, unknown>;
  table: string;
}

interface StorySegmentUpdate {
  id: string;
  image_url?: string;
  image_generation_status?: string;
  audio_url?: string;
  audio_generation_status?: string;
  [key: string]: unknown;
}

export const useStorySegmentRealtime = (segmentId: string | undefined) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    // Don't set up subscription for fallback or invalid segment IDs
    if (!segmentId || segmentId === 'fallback') {
      return;
    }

    console.log(`[Realtime] Setting up subscription for segment: ${segmentId}`);

    const channel = supabase
      .channel(`story_segment_${segmentId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'story_segments',
          filter: `id=eq.${segmentId}`,
        },
        (payload: RealtimePayload) => {
          console.log(`[Realtime] Segment ${segmentId} updated:`, payload.new);
          
          const updatedSegment = payload.new as StorySegmentUpdate;
          
          // Invalidate and refetch queries that depend on this segment
          queryClient.invalidateQueries({ 
            queryKey: ['story_segment', segmentId] 
          });
          
          // Also invalidate the parent story query
          if (updatedSegment.story_id) {
            queryClient.invalidateQueries({ 
              queryKey: ['story', updatedSegment.story_id] 
            });
          }
        }
      )
      .subscribe();

    return () => {
      console.log(`[Realtime] Cleaning up subscription for segment: ${segmentId}`);
      supabase.removeChannel(channel);
    };
  }, [segmentId, queryClient]);
};
