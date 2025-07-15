
import { useEffect, useRef } from 'react';
import { useStoryLoader } from './useStoryLoader';
import { StorySegment } from './types';
import { isValidUUID } from './utils';

interface UseStoryInitializationLogicProps {
  id: string;
  prompt: string;
  currentStorySegment: StorySegment | null;
  isInitialLoad: boolean;
  setIsInitialLoad: (value: boolean) => void;
  storyLoaded: boolean;
  setStoryLoaded: (value: boolean) => void;
  setAllStorySegments: (segments: StorySegment[]) => void;
  setCurrentStorySegment: (segment: StorySegment | null) => void;
  setSegmentCount: (count: number) => void;
  setViewMode: (mode: 'create' | 'player') => void;
  fetchStoryData: (id: string) => Promise<void>;
  showConfirmation: (action: 'start' | 'choice', choice?: string) => void;
}

export const useStoryInitializationLogic = ({
  id,
  prompt,
  currentStorySegment,
  isInitialLoad,
  setIsInitialLoad,
  storyLoaded,
  setStoryLoaded,
  setAllStorySegments,
  setCurrentStorySegment,
  setSegmentCount,
  setViewMode,
  fetchStoryData,
  showConfirmation,
}: UseStoryInitializationLogicProps) => {
  const { loadExistingStory } = useStoryLoader();
  const initializationAttempted = useRef(false);

  // Enhanced story loader with callback
  const loadExistingStoryWithCallback = async (storyId: string) => {
    console.log('📖 Attempting to load existing story:', storyId);
    
    const success = await loadExistingStory(
      storyId, 
      setAllStorySegments, 
      setCurrentStorySegment, 
      setSegmentCount, 
      setViewMode
    );
    
    setStoryLoaded(success);
    console.log('📖 Story load result:', { storyId, success });
    return success;
  };

  // Load existing story segments if available, or start new story generation
  useEffect(() => {
    // Prevent multiple initialization attempts
    if (initializationAttempted.current) {
      console.log('🔍 Initialization already attempted, skipping...');
      return;
    }

    console.log('🔍 useEffect for story loading:', { 
      id, 
      isValidId: isValidUUID(id), 
      isInitialLoad, 
      prompt, 
      hasCurrentSegment: !!currentStorySegment,
      storyLoaded,
      initializationAttempted: initializationAttempted.current
    });

    const handleStoryFlow = async () => {
      initializationAttempted.current = true;
      
      if (id && isValidUUID(id)) {
        // Try to load existing story first
        const loaded = await loadExistingStoryWithCallback(id);
        if (id) await fetchStoryData(id);
        
        // If no existing story was loaded but we have a prompt, start generation
        if (!loaded && isInitialLoad && prompt && !currentStorySegment) {
          console.log('🚀 No existing story found, starting initial generation for prompt:', prompt);
          showConfirmation('start');
        }
        
        // Mark initial load as complete
        if (isInitialLoad) {
          setIsInitialLoad(false);
        }
      } else if (isInitialLoad && prompt && !currentStorySegment) {
        // Fallback for invalid IDs with prompts
        console.log('🚀 Starting initial story generation for prompt:', prompt);
        showConfirmation('start');
        setIsInitialLoad(false);
      }
    };

    handleStoryFlow();
  }, [id, isInitialLoad, prompt, currentStorySegment, storyLoaded, setIsInitialLoad, loadExistingStoryWithCallback, fetchStoryData, showConfirmation]); // Empty dependency array to run only once

  // Separate effect to handle story data fetching when ID changes
  useEffect(() => {
    if (id && isValidUUID(id) && !initializationAttempted.current) {
      console.log('📚 ID changed, fetching story data:', id);
      fetchStoryData(id);
    }
  }, [id, fetchStoryData]);
};
