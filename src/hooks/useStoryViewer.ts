
import { useStoryData } from '@/hooks/useStoryData';
import { useStoryRealtime } from '@/hooks/useStoryRealtime';
import { useStoryActions } from '@/hooks/useStoryActions';

export const useStoryViewer = () => {
    const { story, isLoading, error, refetch, storyId } = useStoryData();
    const { realtimeStatus, connectionHealth } = useStoryRealtime(storyId);
    const {
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
    } = useStoryActions(story, storyId);

    console.log('useStoryViewer: Story state analysis:', {
        hasStory: !!story,
        segmentsCount: segments.length,
        isCompleted: story?.is_completed,
        isPublic: story?.is_public,
        canContinue,
        realtimeStatus,
        connectionHealth
    });

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
        connectionHealth,
        refetchStory: refetch,
    };
};
