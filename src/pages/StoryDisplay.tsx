import { useMemo } from 'react';
import { toast } from 'sonner';
import { CostConfirmationDialog } from '@/components/CostConfirmationDialog';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthProvider';

// Import refactored components
import StoryHeader from '@/components/story-display/StoryHeader';
import ErrorDisplay from '@/components/story-display/ErrorDisplay';
import StoryDisplayLayout from '@/components/story-display/StoryDisplayLayout';
import StoryDisplayLoadingState from '@/components/story-display/StoryDisplayLoadingState';
import StoryCompletionHandler from '@/components/story-display/StoryCompletionHandler';
import StoryMainContent from '@/components/story-display/StoryMainContent';

// Import custom hooks
import { useStoryDisplay } from '@/hooks/useStoryDisplay';
import { useStoryChapterNavigation } from '@/hooks/useStoryDisplay/useStoryChapterNavigation';

// Import performance optimizations
import { 
  useMemoizedCallback
} from '@/utils/performanceOptimizations';

// Import enhanced error handling
import { useErrorHandler } from '@/utils/enhancedErrorHandler';

const StoryDisplay: React.FC = () => {
  const { user } = useAuth();
  
  // Enhanced error handling
  const { withErrorHandling } = useErrorHandler('StoryDisplay');
  
  const {
    // State
    currentStorySegment,
    allStorySegments,
    segmentCount,
    maxSegments,
    skipImage,
    skipAudio,
    audioPlaying,
    error,
    showHistory,
    viewMode,
    
    // Story generation state
    storyGeneration,
    apiUsageCount,
    showCostDialog,
    pendingAction,
    
    // Story data
    storyData,
    
    // URL params
    genre,
    prompt,
    characterName,
    id, // Story ID from URL params
    
    // Actions
    setSkipImage,
    setSkipAudio,
    setAudioPlaying,
    setError,
    setShowHistory,
    setViewMode,
    setShowCostDialog,
    confirmGeneration,
    handleChoiceSelect,
    handleFinishStory,
    refreshStoryData,
    
    // Navigation - we'll modify this to avoid URL changes
    navigate
  } = useStoryDisplay();

  // Use the chapter navigation hook
  const { currentChapterIndex, handleChapterChange } = useStoryChapterNavigation(allStorySegments);

  // Memoized values for performance
  const storyTitle = useMemo(() => {
    return allStorySegments.length > 0 
      ? allStorySegments[0].segment_text.substring(0, 50) + '...' 
      : prompt.substring(0, 50) + '...';
  }, [allStorySegments, prompt]);

  const isStoryCompleted = useMemo(() => {
    return storyData?.is_completed || currentStorySegment?.is_end || allStorySegments.some(segment => segment.is_end);
  }, [storyData?.is_completed, currentStorySegment?.is_end, allStorySegments]);

  const shouldShowFullLoadingState = useMemo(() => {
    return storyGeneration.isGenerating && allStorySegments.length === 0 && !currentStorySegment;
  }, [storyGeneration.isGenerating, allStorySegments.length, currentStorySegment]);

  // Debug logging removed to prevent infinite re-renders

  // Optimized callbacks with performance monitoring
  const handleSwitchToPlayer = useMemoizedCallback(async () => {
    console.log('🎬 Switching to player mode...');
    setViewMode('player');
  }, [setViewMode]);

  const handleSwitchToCreate = useMemoizedCallback(async () => {
    console.log('✏️ Switching to create mode...');
    setViewMode('create');
  }, [setViewMode]);

  const handleChapterNavigate = useMemoizedCallback((index: number) => {
    console.log('Chapter navigated to:', index);
  }, []);

  const handleAudioGenerated = useMemoizedCallback(async (_newAudioUrl: string) => {
    console.log('🎵 Audio generation completed, refreshing story data...');
    await refreshStoryData();
  }, [refreshStoryData]);

  // Handle save story functionality with error handling
  const handleSaveStory = useMemoizedCallback(async () => {
    if (!id || !allStorySegments.length) {
      toast.error('No story to save');
      return;
    }

    await withErrorHandling(async () => {
      // For authenticated users, check if story already exists in database
      if (user) {
        console.log('🔐 Authenticated user saving story:', id);
        
        // Check if story exists in database
        const { data: existingStory, error: checkError } = await supabase
          .from('stories')
          .select('id, user_id')
          .eq('id', id)
          .single();

        if (checkError && checkError.code !== 'PGRST116') {
          throw checkError;
        }

        if (existingStory) {
          // Story exists - update user ownership if needed
          if (!existingStory.user_id) {
            const { error: updateError } = await supabase
              .from('stories')
              .update({ user_id: user.id })
              .eq('id', id);
            
            if (updateError) throw updateError;
            toast.success('Story saved to your account! 📖');
          } else {
            toast.success('Story is already in your library! 📚');
          }
        } else {
          // Story doesn't exist in database - create it
          const storyTitle = allStorySegments[0]?.segment_text?.substring(0, 100) + '...' || 'Untitled Story';
          
          const { error: createError } = await supabase
            .from('stories')
            .insert({
              id: id,
              title: storyTitle,
              user_id: user.id,
              is_completed: allStorySegments.some(s => s.is_end),
              segment_count: allStorySegments.length
            });
          
          if (createError) throw createError;
          toast.success('Story saved to your account! 📖');
        }
      } else {
        // For anonymous users, save to local storage
        console.log('👤 Anonymous user saving story locally:', id);
        
        const existingIds = JSON.parse(localStorage.getItem('anonymous_story_ids') || '[]');
        if (!existingIds.includes(id)) {
          existingIds.push(id);
          localStorage.setItem('anonymous_story_ids', JSON.stringify(existingIds));
          toast.success('Story saved locally! Sign up to save permanently. 💾');
        } else {
          toast.success('Story already saved locally! 📚');
        }
      }
    }, { action: 'saveStory' });
  }, [id, allStorySegments, user, withErrorHandling]);

  // Handle exit without creating new URLs - go to home instead
  const handleExit = useMemoizedCallback(() => {
    console.log('🚪 Exiting story, navigating to home');
    // Clear any story state and go to home
    navigate('/', { replace: true });
  }, [navigate]);

  // Show error state
  if (error && !storyGeneration.isGenerating) {
    return (
      <ErrorDisplay 
        error={error}
        onRetry={() => setError(null)}
        onExit={handleExit}
      />
    );
  }

  if (shouldShowFullLoadingState) {
    return (
      <StoryDisplayLoadingState
        apiUsageCount={apiUsageCount}
        skipImage={skipImage}
        onExit={handleExit}
      />
    );
  }

  return (
    <StoryDisplayLayout>        <StoryHeader 
          onExit={handleExit}
          onSave={handleSaveStory}
          apiUsageCount={apiUsageCount}
        />

      {/* Show unified completion interface if story is completed */}
      {storyData?.id && (
        <StoryCompletionHandler
          isStoryCompleted={isStoryCompleted}
          storyId={storyData.id}
          allStorySegments={allStorySegments}
          fullStoryAudioUrl={storyData?.full_story_audio_url || null}
          audioGenerationStatus={storyData?.audio_generation_status || 'not_started'}
          isPublic={storyData?.is_public || false}
          onExit={handleExit}
        />
      )}

      {/* Show main content if story is not completed */}
      {!isStoryCompleted && storyData?.id && (
        <StoryMainContent
          viewMode={viewMode}
          allStorySegments={allStorySegments}
          currentStorySegment={currentStorySegment}
          currentChapterIndex={currentChapterIndex}
          segmentCount={segmentCount}
          maxSegments={maxSegments}
          showHistory={showHistory}
          audioPlaying={audioPlaying}
          isGenerating={storyGeneration.isGenerating}
          prompt={prompt}
          storyId={storyData.id}
          storyTitle={storyTitle}
          narrationAudioUrl={storyData?.full_story_audio_url || null}
          isStoryCompleted={isStoryCompleted}
          onSwitchToCreate={handleSwitchToCreate}
          onSwitchToPlayer={handleSwitchToPlayer}
          onChapterChange={handleChapterChange}
          onToggleHistory={() => setShowHistory(!showHistory)}
          onToggleAudio={() => setAudioPlaying(!audioPlaying)}
          onChoiceSelect={handleChoiceSelect}
          onFinishStory={handleFinishStory}
          onChapterNavigate={handleChapterNavigate}
          onAudioGenerated={handleAudioGenerated}
        />
      )}

      <CostConfirmationDialog
        open={showCostDialog}
        onOpenChange={setShowCostDialog}
        onConfirm={confirmGeneration}
        pendingAction={pendingAction}
        skipImage={skipImage}
        skipAudio={skipAudio}
        onSkipImageChange={setSkipImage}
        onSkipAudioChange={setSkipAudio}
        apiUsageCount={apiUsageCount}
        showAudioOption={false}
      />
    </StoryDisplayLayout>
  );
};

export default StoryDisplay;
