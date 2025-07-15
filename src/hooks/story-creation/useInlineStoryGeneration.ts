
import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useStoryState } from './useStoryState';
import { useStoryActions } from './useStoryActions';
import { useStoryConfirmation } from './useStoryConfirmation';
import { useInlineStoryRealtime } from './useInlineStoryRealtime';

export const useInlineStoryGeneration = () => {
  const [searchParams] = useSearchParams();
  const storyState = useStoryState();
  const confirmation = useStoryConfirmation();

  const storyActions = useStoryActions({
    setError: storyState.setError,
    setIsGeneratingStartup: storyState.setIsGeneratingStartup,
    setIsGeneratingChoice: storyState.setIsGeneratingChoice,
    setIsGeneratingEnding: storyState.setIsGeneratingEnding,
    setCurrentSegment: storyState.setCurrentSegment,
    setStoryHistory: storyState.setStoryHistory,
    setApiCallsCount: storyState.setApiCallsCount,
    setFullStoryAudioUrl: storyState.setFullStoryAudioUrl,
    setShowImageSettings: storyState.setShowImageSettings,
    generationStartedRef: storyState.generationStartedRef,
    skipImage: storyState.skipImage,
    selectedVoice: storyState.selectedVoice,
    currentSegment: storyState.currentSegment,
  });

  // Get parameters from URL
  const prompt = searchParams.get('prompt') || '';
  const mode = searchParams.get('mode') || searchParams.get('genre') || 'fantasy';
  

  // Auto-start story generation with robust duplicate prevention
  useEffect(() => {
    // Only auto-start if we have a fresh session and haven't already generated content
    const shouldStart = prompt && 
                       !storyState.generationStartedRef.current && 
                       !storyState.currentSegment && 
                       !storyState.error && 
                       !storyState.isGeneratingStartup && 
                       !storyState.initializedRef.current &&
                       storyState.storyHistory.length === 0; // Ensure no existing story

    if (shouldStart) {
      console.log('🚀 Auto-starting story generation (effect triggered)');
      storyState.initializedRef.current = true;
      storyState.generationStartedRef.current = true;
      storyActions.handleStartStory(prompt, mode);
    }
  }, [prompt, mode, storyState.currentSegment, storyState.storyHistory.length, storyState.generationStartedRef, storyState.initializedRef, storyState.error, storyState.isGeneratingStartup, storyActions]);

  // Setup realtime subscription for current segment updates
  const { isSubscribed } = useInlineStoryRealtime({
    currentSegment: storyState.currentSegment,
    setCurrentSegment: storyState.setCurrentSegment,
    setStoryHistory: storyState.setStoryHistory
  });

  const confirmGeneration = async () => {
    confirmation.setShowCostDialog(false);
    
    if (confirmation.pendingAction === 'choice' && confirmation.pendingChoice) {
      await storyActions.handleSelectChoice(confirmation.pendingChoice);
    } else if (confirmation.pendingAction === 'audio') {
      await storyActions.handleGenerateAudio();
    }
    
    confirmation.resetConfirmation();
  };

  return {
    // State
    currentSegment: storyState.currentSegment,
    storyHistory: storyState.storyHistory,
    showCostDialog: confirmation.showCostDialog,
    pendingAction: confirmation.pendingAction,
    skipImage: storyState.skipImage,
    apiCallsCount: storyState.apiCallsCount,
    error: storyState.error,
    selectedVoice: storyState.selectedVoice,
    fullStoryAudioUrl: storyState.fullStoryAudioUrl,
    isCurrentlyGenerating: storyState.isCurrentlyGenerating,
    generateAudioMutation: storyActions.generateAudioMutation,
    showImageSettings: storyState.showImageSettings,
    
    // Setters
    setShowCostDialog: confirmation.setShowCostDialog,
    setSkipImage: storyState.setSkipImage,
    setSelectedVoice: storyState.setSelectedVoice,
    
    // Actions
    handleSelectChoice: storyActions.handleSelectChoice,
    handleFinishStory: storyActions.handleFinishStory,
    showConfirmation: confirmation.showConfirmation,
    confirmGeneration,
    resetStory: storyState.resetStory,
    
    // URL parameters for redirection
    prompt,
    mode,
    
    // Realtime status for debugging
    isSubscribed,
  };
};
