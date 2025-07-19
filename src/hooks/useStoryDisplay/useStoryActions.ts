
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { StorySegment } from './types';
import { autosaveStoryProgress } from '@/utils/autosaveUtils';
import { useNavigate } from 'react-router-dom';

interface StoryGenerationParams {
  genre: string;
  skipImage: boolean;
  skipAudio: boolean;
  prompt?: string;
  storyId?: string;
  parentSegmentId?: string;
  choiceText?: string;
}

interface PendingParams {
  choice?: string;
}

type PendingAction = 'start' | 'choice' | null;

interface StoryGeneration {
  generateSegment: (params: StoryGenerationParams) => Promise<StorySegment>;
}

export const useStoryActions = (
  storyGeneration: StoryGeneration,
  addToHistory: (segment: StorySegment) => void,
  incrementApiUsage: () => void
) => {
  const navigate = useNavigate();

  const confirmGeneration = useCallback(async (
    pendingAction: 'start' | 'choice' | null,
    pendingParams: PendingParams,
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
    setPendingAction: (action: PendingAction, params: PendingParams | null) => void
  ) => {
    setError(null);
    
    const params: StoryGenerationParams = {
      genre,
      skipImage,
      skipAudio
    };

    if (pendingAction === 'start') {
      // Ensure we have a valid prompt
      const basePrompt = prompt?.trim() || 'Create an exciting story';
      params.prompt = `${basePrompt}${characterName ? ` featuring ${characterName}` : ''}`;
      console.log('🔍 Final prompt being used:', params.prompt);
    } else {
      if (currentStorySegment?.story_id) params.storyId = currentStorySegment.story_id;
      if (currentStorySegment?.id) params.parentSegmentId = currentStorySegment.id;
      if (pendingParams?.choice) params.choiceText = pendingParams.choice;
      // For choice-based generation, use the choice as the prompt
      params.prompt = pendingParams?.choice || 'Continue the story';
    }

    try {
      if (pendingAction === 'start') {
        const { data: story, error: storyError } = await supabase
          .from('stories')
          .insert({
            title: (prompt || 'Untitled Story').substring(0, 100),
            description: prompt || 'A magical story',
            story_mode: genre
          })
          .select()
          .single();

        if (storyError) throw storyError;
        params.storyId = story.id;
        
        // Navigate to the new story URL so real-time subscription connects to correct story
        navigate(`/story/${story.id}?genre=${genre}&prompt=${encodeURIComponent(prompt)}${characterName ? `&characterName=${encodeURIComponent(characterName)}` : ''}`, { replace: true });
      }

      console.log('🚀 About to call storyGeneration.generateSegment with params:', params);
      console.log('🔍 Prompt being sent:', params.prompt);
      const segment = await storyGeneration.generateSegment(params);
      console.log('✅ Story generation successful, received segment:', segment);
      
      const completeSegment: StorySegment = {
        ...segment,
        created_at: segment.created_at || new Date().toISOString(),
        word_count: segment.word_count || segment.segment_text?.split(/\s+/).length || 0,
        audio_generation_status: segment.audio_generation_status || 'not_started',
        storyId: segment.story_id || segment.storyId || '',
        text: segment.segment_text || segment.text || '',
        imageUrl: segment.image_url || segment.imageUrl || '/placeholder.svg',
        audioUrl: segment.audio_url || segment.audioUrl || '',
        isEnd: segment.is_end || segment.isEnd || false
      };
      
      setCurrentStorySegment(completeSegment);
      setAllStorySegments(prev => [...prev, completeSegment]);
      addToHistory(completeSegment);
      incrementApiUsage();
      
      // Autosave after each segment
      try {
        if (params.storyId && segment.story_id && segment.id) {
          await autosaveStoryProgress({
            storyId: segment.story_id,
            segmentId: segment.id,
            storyTitle: segment.segment_text?.substring(0, 100) + '...',
            segmentCount: (await getCurrentSegmentCount(params.storyId)) + 1,
            isEnd: segment.is_end || false
          });
        }
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
  }, [storyGeneration, addToHistory, incrementApiUsage, navigate]);

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
