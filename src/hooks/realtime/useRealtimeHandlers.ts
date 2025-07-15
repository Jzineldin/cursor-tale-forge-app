import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';

interface RealtimePayload {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
  new: Record<string, unknown>;
  old: Record<string, unknown>;
  table: string;
  schema: string;
}

interface StorySegmentData {
  id: string;
  story_id: string;
  segment_text?: string;
  image_url?: string;
  image_generation_status?: string;
  audio_url?: string;
  audio_generation_status?: string;
  [key: string]: unknown;
}

interface StoryData {
  id: string;
  title?: string;
  is_completed?: boolean;
  story_segments?: StorySegmentData[];
  [key: string]: unknown;
}

export const useRealtimeHandlers = (
    storyId: string,
    forceRefresh: () => void,
    updateLastUpdateTime: () => void
) => {
    const queryClient = useQueryClient();

    const handleRealtimeUpdate = useCallback((payload: RealtimePayload) => {
        console.log('🔥 payload', payload.new?.id, payload.new?.image_url);
        
        // Guard against empty image URLs
        if (!payload.new?.image_url) return;
        
        const segmentId = payload.new?.id;
        if (!segmentId) return;
        
        // Get current cached data to compare URLs
        const currentData = queryClient.getQueryData(['segment', segmentId]);
        const currentImageUrl = (currentData as StorySegmentData)?.image_url;
        
        // Only proceed if the image URL has actually changed
        if ((payload.new as StorySegmentData).image_url !== currentImageUrl) {
            console.log('🔄 Image URL changed, updating cache directly:', {
                segmentId,
                oldUrl: currentImageUrl,
                newUrl: (payload.new as StorySegmentData).image_url
            });
            
            // Overwrite React-Query cache directly rather than invalidate
            queryClient.setQueryData(['segment', segmentId], payload.new);
            
            // Also update the story cache to ensure consistency
            queryClient.setQueryData(['story', storyId], (oldStoryData: StoryData) => {
                if (!oldStoryData) return oldStoryData;
                
                return {
                    ...oldStoryData,
                    story_segments: oldStoryData.story_segments?.map((segment: StorySegmentData) => 
                        segment.id === segmentId ? { ...segment, ...payload.new } : segment
                    )
                };
            });
            
            updateLastUpdateTime();
            forceRefresh();
        }
        
        // ENHANCED: Multiple refresh strategy for critical updates
        if ((payload.new as StorySegmentData)?.image_generation_status === 'completed') {
            console.log('🖼️ Image generation completed - aggressive refresh strategy');
            
            // Immediate refresh
            forceRefresh();
            
            // Staggered refreshes to ensure UI updates
            setTimeout(() => {
                console.log('🔄 Secondary refresh (200ms)');
                queryClient.invalidateQueries({ queryKey: ['story', storyId] });
                forceRefresh();
            }, 200);
            
            setTimeout(() => {
                console.log('🔄 Tertiary refresh (500ms)');
                queryClient.refetchQueries({ queryKey: ['story', storyId] });
                forceRefresh();
            }, 500);
            
            setTimeout(() => {
                console.log('🔄 Final refresh (1000ms)');
                queryClient.invalidateQueries({ queryKey: ['story', storyId] });
                queryClient.refetchQueries({ queryKey: ['story', storyId] });
            }, 1000);
        }
    }, [queryClient, storyId, forceRefresh, updateLastUpdateTime]);

    const handleStoryUpdate = useCallback((payload: RealtimePayload) => {
        console.log('🔥 REALTIME HANDLER - Processing story table update:', {
            storyId,
            audioStatus: (payload.new as StoryData)?.audio_generation_status,
            audioUrl: (payload.new as StoryData)?.full_story_audio_url ? 'Present' : 'Missing',
            isCompleted: (payload.new as StoryData)?.is_completed,
            timestamp: new Date().toISOString()
        });
        
        updateLastUpdateTime();
        
        // Force immediate refresh for story updates
        forceRefresh();
        
        // Additional refresh for audio completion
        if ((payload.new as StoryData)?.audio_generation_status === 'completed') {
            console.log('🎵 Audio generation completed - forcing multiple refreshes');
            setTimeout(() => forceRefresh(), 200);
            setTimeout(() => forceRefresh(), 500);
            setTimeout(() => forceRefresh(), 1000);
        }
    }, [storyId, forceRefresh, updateLastUpdateTime]);

    return {
        handleRealtimeUpdate,
        handleStoryUpdate
    };
};
