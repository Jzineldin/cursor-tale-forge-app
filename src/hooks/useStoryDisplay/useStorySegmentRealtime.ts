
import { useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { StorySegment } from './types';

interface UseStorySegmentRealtimeProps {
  storyId: string;
  currentStorySegment: StorySegment | null;
  setCurrentStorySegment: (segment: StorySegment) => void;
  setAllStorySegments: React.Dispatch<React.SetStateAction<StorySegment[]>>;
}

export const useStorySegmentRealtime = ({
  storyId,
  currentStorySegment,
  setCurrentStorySegment,
  setAllStorySegments
}: UseStorySegmentRealtimeProps) => {
  const channelRef = useRef<any>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;

  const handleRealtimeUpdate = useCallback((payload: any) => {
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
  }, [currentStorySegment?.id, setCurrentStorySegment, setAllStorySegments]);

  const setupSubscription = useCallback(() => {
    if (!storyId) return;

    console.log('🔔 Setting up story segment real-time subscription for story:', storyId);

    // Clean up existing channel if any
    if (channelRef.current) {
      console.log('🧹 Cleaning up existing channel before creating new one');
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }

    const channel = supabase
      .channel(`story-segments-${storyId}-${Date.now()}`) // Add timestamp to avoid conflicts
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'story_segments',
          filter: `story_id=eq.${storyId}`
        },
        handleRealtimeUpdate
      )
      .subscribe((status, err) => {
        console.log('📡 Story segment subscription status:', status);
        
        if (status === 'SUBSCRIBED') {
          console.log('✅ Story segment real-time subscription active');
          reconnectAttemptsRef.current = 0; // Reset reconnect attempts on success
        } else if (status === 'CHANNEL_ERROR') {
          console.error('❌ Story segment subscription failed with CHANNEL_ERROR:', err);
          console.error('❌ Error details:', JSON.stringify(err, null, 2));
          
          // Attempt reconnection with exponential backoff
          if (reconnectAttemptsRef.current < maxReconnectAttempts) {
            const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 30000); // Max 30 seconds
            console.log(`🔄 Attempting to reconnect story segment subscription in ${delay}ms (attempt ${reconnectAttemptsRef.current + 1}/${maxReconnectAttempts})`);
            
            reconnectTimeoutRef.current = setTimeout(() => {
              reconnectAttemptsRef.current++;
              setupSubscription();
            }, delay);
          } else {
            console.error('❌ Max reconnect attempts reached, falling back to polling');
            // Fallback to polling could be implemented here
          }
        } else if (status === 'TIMED_OUT') {
          console.error('⏰ Story segment subscription timed out');
          // Similar reconnection logic for timeout
          if (reconnectAttemptsRef.current < maxReconnectAttempts) {
            const delay = 5000; // 5 second delay for timeouts
            console.log(`🔄 Attempting to reconnect after timeout in ${delay}ms`);
            
            reconnectTimeoutRef.current = setTimeout(() => {
              reconnectAttemptsRef.current++;
              setupSubscription();
            }, delay);
          }
        } else if (status === 'CLOSED') {
          console.log('📪 Story segment subscription closed');
        } else if (status === 'CONNECTING') {
          console.log('🔄 Connecting to story segment subscription...');
        }
      });

    channelRef.current = channel;
  }, [storyId, handleRealtimeUpdate]);

  useEffect(() => {
    setupSubscription();

    return () => {
      console.log('🧹 Cleaning up story segment subscription');
      
      // Clear any pending reconnection attempts
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
      
      // Remove the channel
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
      
      // Reset reconnect attempts
      reconnectAttemptsRef.current = 0;
    };
  }, [setupSubscription]);

  // Return subscription status for debugging
  return {
    isSubscribed: channelRef.current !== null,
    reconnectAttempts: reconnectAttemptsRef.current,
    maxReconnectAttempts
  };
};
