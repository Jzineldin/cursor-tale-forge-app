
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { StorySegment } from './types';

interface UseStorySegmentRealtimeProps {
  storyId: string;
  currentStorySegment: StorySegment | null;
  setCurrentStorySegment: (segment: StorySegment | null) => void;
  setAllStorySegments: (segments: StorySegment[] | ((prev: StorySegment[]) => StorySegment[])) => void;
}

export const useStorySegmentRealtime = ({
  storyId,
  currentStorySegment,
  setCurrentStorySegment,
  setAllStorySegments
}: UseStorySegmentRealtimeProps) => {
  useEffect(() => {
    if (!storyId) return;

    console.log('🔔 Setting up story segment real-time subscription for story:', storyId);

    const channel = supabase
      .channel(`story-segments-${storyId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'story_segments',
          filter: `story_id=eq.${storyId}`
        },
        (payload) => {
          console.log('🔥 Real-time segment update received:', {
            segmentId: payload.new?.id,
            imageUrl: payload.new?.image_url ? 'Present' : 'Missing',
            imageStatus: payload.new?.image_generation_status,
            timestamp: new Date().toISOString()
          });

          if (payload.new && payload.new.id) {
            const updatedSegment: StorySegment = {
              id: payload.new.id,
              storyId: payload.new.story_id,
              text: payload.new.segment_text || '',
              imageUrl: payload.new.image_url || '',
              audioUrl: payload.new.audio_url || undefined,
              choices: payload.new.choices || [],
              isEnd: payload.new.is_end || false,
              story_id: payload.new.story_id,
              segment_text: payload.new.segment_text || '',
              image_url: payload.new.image_url,
              audio_url: payload.new.audio_url,
              is_end: payload.new.is_end || false,
              image_generation_status: payload.new.image_generation_status || 'not_started',
              audio_generation_status: payload.new.audio_generation_status || 'not_started',
              triggering_choice_text: payload.new.triggering_choice_text,
              created_at: payload.new.created_at,
              word_count: payload.new.word_count,
              audio_duration: payload.new.audio_duration
            };

            // Update current segment if it matches
            if (currentStorySegment?.id === payload.new.id) {
              console.log('🔄 Updating current segment with real-time data');
              setCurrentStorySegment(updatedSegment);
            }

            // Update all segments array
            setAllStorySegments(prev => 
              prev.map(segment => 
                segment.id === payload.new.id 
                  ? updatedSegment 
                  : segment
              )
            );

            // Force UI refresh for image updates
            if (payload.new.image_generation_status === 'completed' && payload.new.image_url) {
              console.log('🖼️ Image generation completed, forcing UI refresh');
              // Trigger a custom event to force image component refresh
              window.dispatchEvent(new CustomEvent('force-image-refresh', {
                detail: {
                  segmentId: payload.new.id,
                  imageUrl: payload.new.image_url,
                  timestamp: Date.now()
                }
              }));
            }
          }
        }
      )
      .subscribe((status) => {
        console.log('📡 Story segment subscription status:', status);
        
        if (status === 'SUBSCRIBED') {
          console.log('✅ Story segment real-time subscription active');
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          console.error('❌ Story segment subscription failed:', status);
          // Implement fallback polling here if needed
        }
      });

    return () => {
      console.log('🧹 Cleaning up story segment subscription');
      supabase.removeChannel(channel);
    };
  }, [storyId, currentStorySegment?.id, setCurrentStorySegment, setAllStorySegments]);
};
