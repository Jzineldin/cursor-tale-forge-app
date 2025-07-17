

import { Skeleton } from '@/components/ui/skeleton';
import { useOptimizedStoryViewer } from '@/hooks/useOptimizedStoryViewer';
import StoryHeader from '@/components/story-viewer/StoryHeader';
import StorySegmentList from '@/components/story-viewer/StorySegmentList';
import StoryContinuation from '@/components/story-viewer/StoryContinuation';
import StoryRealtimeStatus from '@/components/story-viewer/StoryRealtimeStatus';
import StoryFullAudioPlayer from '@/components/story-viewer/StoryFullAudioPlayer';
import UnifiedStoryCompletion from '@/components/story-viewer/UnifiedStoryCompletion';

const StoryViewer = () => {
    const {
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
        refetchStory,
    } = useOptimizedStoryViewer();

    console.log('StoryViewer Debug:', {
        storyId: story?.id,
        isCompleted: story?.is_completed,
        isPublic: story?.is_public,
        audioStatus: story?.audio_generation_status,
        segmentsCount: segments?.length,
        realtimeStatus,
        connectionHealth,
    });

    if (isLoading) {
        return (
            <div className="container mx-auto p-4 md:p-6 space-y-4">
                <Skeleton className="h-8 w-1/2" />
                <Skeleton className="h-6 w-1/3" />
                <Skeleton className="h-96 w-full" />
            </div>
        )
    }

    if (error) {
        return (
            <div className="text-destructive text-center p-8">
                <h2 className="text-xl font-semibold mb-2">Unable to Load Story</h2>
                <p className="text-gray-300">Something went wrong while loading your story. Please try refreshing the page.</p>
            </div>
        );
    }
    
    if (!story) {
        return <div className="text-center p-8">Story not found.</div>;
    }
    
    return (
        <div className="container mx-auto p-4 md:p-6">
            <StoryRealtimeStatus 
                realtimeStatus={realtimeStatus}
                connectionHealth={connectionHealth}
                refetchStory={refetchStory}
                onManualRefresh={handleManualRefresh}
                isLoading={isLoading}
            />

            <StoryHeader 
                story={story}
                onPublish={handlePublish}
                isPublishing={publishMutation.isPending}
            />
            
            <StoryFullAudioPlayer story={story} />

            <StorySegmentList 
                segments={segments}
                canContinue={canContinue}
                onGoBack={handleGoBack}
                isGoBackPending={goBackMutation.isPending}
            />

            {/* Show continuation only if story is not completed */}
            {!story.is_completed && (
                <StoryContinuation
                    lastSegment={lastSegment}
                    canContinue={canContinue}
                    onSelectChoice={handleSelectChoice}
                    isLoading={mutation.isPending}
                />
            )}

            {/* Show unified completion section when story is completed */}
            {story.is_completed && (
                <UnifiedStoryCompletion
                    storyId={story.id}
                    segments={segments}
                    fullStoryAudioUrl={story.full_story_audio_url || ''}
                    audioGenerationStatus={story.audio_generation_status || 'not_started'}
                    storyTitle={story.title || 'Untitled Story'}
                    story={story}
                />
            )}
        </div>
    );
};

export default StoryViewer;
