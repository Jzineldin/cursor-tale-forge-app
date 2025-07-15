
import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { StorySegmentRealtimePayload, StoryRealtimePayload } from '@/types/ai';
import { realtime } from '@/utils/secureLogger';

export const useRealtimeHandlers = (
    storyId: string,
    forceRefresh: () => void,
    updateLastUpdateTime: () => void
) => {
    const queryClient = useQueryClient();

    const handleRealtimeUpdate = useCallback((payload: StorySegmentRealtimePayload) => {
        realtime('WebSocket payload received', { segmentId: payload.new?.id, hasImageUrl: !!payload.new?.image_url });
        
        // Guard against empty image URLs
        if (!payload.new?.image_url) return;
        
        const segmentId = payload.new?.id;
        if (!segmentId) return;
        
        // Get current cached data to compare URLs
        const currentData = queryClient.getQueryData(['segment', segmentId]);
        const currentImageUrl = currentData ? (currentData as any)?.image_url : undefined;
        
        // Only proceed if the image URL has actually changed
        if (payload.new.image_url !== currentImageUrl) {
            realtime('Image URL changed, updating cache directly', {
                segmentId,
                oldUrl: currentImageUrl,
                newUrl: payload.new.image_url
            });
            
            // Overwrite React-Query cache directly rather than invalidate
            queryClient.setQueryData(['segment', segmentId], payload.new);
            
            // Also update the story cache to ensure consistency
            queryClient.setQueryData(['story', storyId], (oldStoryData: any) => {
                if (!oldStoryData) return oldStoryData;
                
                return {
                    ...oldStoryData,
                    story_segments: oldStoryData.story_segments?.map((segment: any) => 
                        segment.id === segmentId ? { ...segment, ...payload.new } : segment
                    )
                };
            });
            
            updateLastUpdateTime();
            forceRefresh();
        }
        
        // ENHANCED: Multiple refresh strategy for critical updates
        if (payload.new?.image_generation_status === 'completed') {
            realtime('Image generation completed - aggressive refresh strategy');
            
            // Immediate refresh
            forceRefresh();
            
            // Staggered refreshes to ensure UI updates
            setTimeout(() => {
                realtime('Secondary refresh (200ms)');
                queryClient.invalidateQueries({ queryKey: ['story', storyId] });
                forceRefresh();
            }, 200);
            
            setTimeout(() => {
                realtime('Tertiary refresh (500ms)');
                queryClient.refetchQueries({ queryKey: ['story', storyId] });
                forceRefresh();
            }, 500);
            
            setTimeout(() => {
                realtime('Final refresh (1000ms)');
                queryClient.invalidateQueries({ queryKey: ['story', storyId] });
                queryClient.refetchQueries({ queryKey: ['story', storyId] });
            }, 1000);
        }
    }, [queryClient, storyId, forceRefresh, updateLastUpdateTime]);

    const handleStoryUpdate = useCallback((payload: StoryRealtimePayload) => {
        realtime('Processing story table update', {
            storyId,
            audioStatus: payload.new?.audio_generation_status,
            audioUrl: payload.new?.full_story_audio_url ? 'Present' : 'Missing',
            isCompleted: payload.new?.is_completed
        });
        
        updateLastUpdateTime();
        
        // Force immediate refresh for story updates
        forceRefresh();
        
        // Additional refresh for audio completion
        if (payload.new?.audio_generation_status === 'completed') {
            realtime('Audio generation completed - forcing multiple refreshes');
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
