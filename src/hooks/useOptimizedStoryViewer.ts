
import { useStoryData } from '@/hooks/useStoryData';
import { useStoryRealtimeWithPolling } from '@/hooks/useStoryRealtimeWithPolling';
import { useStoryActions } from '@/hooks/useStoryActions';
import { secureConsole } from '@/utils/secureLogger';

export const useOptimizedStoryViewer = () => {
    const { story, isLoading, error, refetch, storyId } = useStoryData();
    const segments = story?.story_segments || [];
    
    secureConsole.debug('[OptimizedStoryViewer] Current story data:', {
        hasStory: !!story,
        segmentsCount: segments.length,
        segments: segments.map(s => ({
            id: s.id,
            hasImage: !!s.image_url,
            status: s.image_generation_status,
            imageUrl: s.image_url,
            isPlaceholder: s.image_url === '/placeholder.svg'
        }))
    });

    // Validate segment data integrity
    segments.forEach((segment, index) => {
        if (!segment.image_url || segment.image_url === '/placeholder.svg') {
            secureConsole.warn(`[OptimizedStoryViewer] Segment ${index} (${segment.id}) has no valid image:`, {
                image_url: segment.image_url,
                image_generation_status: segment.image_generation_status
            });
        }
    });
    
    const { realtimeStatus, isPolling } = useStoryRealtimeWithPolling({
        storyId: storyId!,
        segments
    });

    const {
        lastSegment,
        canContinue,
        handleSelectChoice,
        handlePublish,
        handleGoBack,
        handleManualRefresh,
        mutation,
        publishMutation,
        goBackMutation,
    } = useStoryActions(story, storyId);

    secureConsole.debug('[OptimizedStoryViewer] Story state analysis:', {
        hasStory: !!story,
        segmentsCount: segments.length,
        isCompleted: story?.is_completed,
        isPublic: story?.is_public,
        canContinue,
        realtimeStatus,
        isPolling
    });

    // Fix the connectionHealth type issue
    const getConnectionHealth = (): 'healthy' | 'degraded' | 'failed' => {
        if (realtimeStatus === 'SUBSCRIBED') {
            return 'healthy';
        } else if (realtimeStatus === 'CHANNEL_ERROR' || realtimeStatus === 'TIMED_OUT') {
            return 'failed';
        } else if (isPolling) {
            return 'degraded';
        }
        return 'healthy';
    };

    return {
        story,
        isLoading,
        error,
        segments,
        lastSegment,
        canContinue,
        handleSelectChoice,
        handlePublish,
        handleGoBack,
        handleManualRefresh,
        mutation,
        publishMutation,
        goBackMutation,
        realtimeStatus,
        connectionHealth: getConnectionHealth(),
        refetchStory: refetch,
    };
};
