
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { StorySegment } from './types';
import { autosaveStoryProgress } from '@/utils/autosaveUtils';

export const useStoryActions = (
  storyGeneration: any,
  addToHistory: (segment: StorySegment) => void,
  incrementApiUsage: () => void
) => {
  const confirmGeneration = useCallback(async (
    pendingAction: 'start' | 'choice' | null,
    pendingParams: any,
    genre: string,
    prompt: string,
    characterName: string,
    skipImage: boolean,
    skipAudio: boolean,
    currentStorySegment: StorySegment | null,
    setError: (error: string | null) => void,
    setCurrentStorySegment: (segment: StorySegment) => void,
    setAllStorySegments: (updater: (prev: StorySegment[]) => StorySegment[]) => void,
    setSegmentCount: (updater: (prev: number) => number) => void,
    setPendingAction: (action: 'start' | 'choice' | null, params: any) => void
  ) => {
    setError(null);
    
    let params: any = {
      genre,
      skipImage,
      skipAudio
    };

    if (pendingAction === 'start') {
      params.prompt = `${prompt}${characterName ? ` featuring ${characterName}` : ''}`;
    } else {
      params.storyId = currentStorySegment?.story_id;
      params.parentSegmentId = currentStorySegment?.id;
      params.choiceText = pendingParams?.choice;
    }

    try {
      if (pendingAction === 'start') {
        const { data: story, error: storyError } = await supabase
          .from('stories')
          .insert({
            title: prompt.substring(0, 100),
            description: prompt,
            story_mode: genre
          })
          .select()
          .single();

        if (storyError) throw storyError;
        params.storyId = story.id;
      }

      const segment = await storyGeneration.generateSegment(params);
      
      const completeSegment: StorySegment = {
        ...segment,
        created_at: segment.created_at || new Date().toISOString(),
        word_count: segment.word_count || segment.segment_text?.split(/\s+/).length || 0,
        audio_generation_status: segment.audio_generation_status || 'not_started'
      };
      
      setCurrentStorySegment(completeSegment);
      setAllStorySegments(prev => [...prev, completeSegment]);
      addToHistory(completeSegment);
      incrementApiUsage();
      
      // Autosave after each segment
      try {
        await autosaveStoryProgress({
          storyId: segment.story_id,
          segmentId: segment.id,
          storyTitle: segment.segment_text?.substring(0, 100) + '...',
          segmentCount: (await getCurrentSegmentCount(params.storyId)) + 1,
          isEnd: segment.is_end || false
        });
      } catch (error) {
        console.error('Autosave failed:', error);
        // Continue with story flow even if autosave fails
      }
      
      if (!completeSegment.is_end) {
        // Increment segment count properly - first segment should be Chapter 1
        setSegmentCount(prev => prev + 1);
      }
      
    } catch (error) {
      console.error('Generation failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Story generation failed';
      setError(errorMessage);
      toast.error(errorMessage);
    }
    
    setPendingAction(null, null);
  }, [storyGeneration, addToHistory, incrementApiUsage]);

  const handleFinishStory = useCallback(async (
    currentStorySegment: StorySegment | null,
    setCurrentStorySegment: (segment: StorySegment) => void,
    setAllStorySegments: (updater: (prev: StorySegment[]) => StorySegment[]) => void
  ) => {
    if (!currentStorySegment) {
      toast.error('No story to finish');
      return;
    }

    console.log('🏁 Starting story finish process with ending generation...');
    
    try {
      toast.info('Generating story ending...', { duration: 3000 });
      
      // Call the updated finish story edge function which will generate an ending
      const { data, error } = await supabase.functions.invoke('finish-story', {
        body: { storyId: currentStorySegment.story_id }
      });

      if (error) {
        console.error('Error finishing story:', error);
        throw new Error(error.message || 'Failed to finish story');
      }

      if (data && data.endingSegment) {
        const endingSegment: StorySegment = {
          ...data.endingSegment,
          created_at: data.endingSegment.created_at || new Date().toISOString(),
          word_count: data.endingSegment.word_count || data.endingSegment.segment_text?.split(/\s+/).length || 0,
          audio_generation_status: data.endingSegment.audio_generation_status || 'not_started'
        };
        
        console.log('✅ Ending segment received:', endingSegment);
        
        // Update current segment and add to all segments
        setCurrentStorySegment(endingSegment);
        setAllStorySegments(prev => [...prev, endingSegment]);
        
        toast.success('Story completed with a generated ending! 🎉');
      } else {
        // Fallback: just mark the current segment as ended
        const updatedSegment = { ...currentStorySegment, is_end: true, choices: [] as string[] };
        setCurrentStorySegment(updatedSegment);
        setAllStorySegments(prev => prev.map(seg => 
          seg.id === currentStorySegment.id ? updatedSegment : seg
        ));
        toast.success('Story completed!');
      }
      
    } catch (error) {
      console.error('Error finishing story:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to finish story';
      toast.error(errorMessage);
    }
  }, []);

  // Helper function to get current segment count
  const getCurrentSegmentCount = async (storyId: string): Promise<number> => {
    try {
      const { data: segments, error } = await supabase
        .from('story_segments')
        .select('id')
        .eq('story_id', storyId);
      
      if (error) throw error;
      return segments?.length || 0;
    } catch (error) {
      console.error('Error getting segment count:', error);
      return 0;
    }
  };

  return { confirmGeneration, handleFinishStory };
};
