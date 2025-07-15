
import { useQueryClient } from '@tanstack/react-query';
import { useUnifiedStory } from '@/hooks/useUnifiedStory';
import { usePublishStory } from '@/hooks/usePublishStory';
import { useGoBack } from '@/hooks/useGoBack';
import { StoryWithSegments } from '@/types/stories';

export const useStoryActions = (story: StoryWithSegments | undefined, storyId: string | undefined) => {
    const queryClient = useQueryClient();
    const { mutation } = useUnifiedStory({});
    const publishMutation = usePublishStory();
    const goBackMutation = useGoBack({ storyId: storyId! });

    const segments = story?.story_segments || [];
    const lastSegment = segments.length > 0 ? segments[segments.length - 1] : null;
    const canContinue = story ? !story.is_public && !story.is_completed : false;

    const handleSelectChoice = (choice: string) => {
        if (!story || !lastSegment) {
            console.warn('Cannot select choice: missing story or last segment');
            return;
        }
        console.log('Selecting choice:', choice, 'for story:', story.id);
        mutation.mutate({
            storyId: story.id,
            parentSegmentId: lastSegment.id,
            choiceText: choice,
        });
    };

    const handlePublish = () => {
        if (story) {
            console.log('Publishing story:', story.id);
            publishMutation.mutate(story.id);
        }
    };

    const handleGoBack = (segmentId: string) => {
        if (window.confirm("Are you sure you want to go back to this point? The story from here on will be deleted.")) {
            console.log('Going back to segment:', segmentId);
            goBackMutation.mutate(segmentId);
        }
    };

    const handleManualRefresh = () => {
        console.log('🔄 Manual refresh triggered');
        // Optimistic update - invalidate and refetch immediately
        queryClient.invalidateQueries({ queryKey: ['story', storyId] });
        queryClient.refetchQueries({ queryKey: ['story', storyId] });
        
        // Also invalidate any segment-specific caches
        if (segments.length > 0) {
            segments.forEach(segment => {
                queryClient.invalidateQueries({ queryKey: ['segment', segment.id] });
            });
        }
    };

    return {
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
    };
};
