
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { generateStorySegment } from '@/lib/ai-api';
import { secureConsole } from '@/utils/secureLogger';


interface GenerateStoryParams {
  prompt?: string;
  genre?: string;
  storyId?: string;
  parentSegmentId?: string;
  choiceText?: string;
  skipImage?: boolean;
  skipAudio?: boolean;
  voice?: string;
  targetAge?: '4-6' | '7-9' | '10-12';
}

export const useStoryGeneration = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (params: GenerateStoryParams) => {
      secureConsole.debug('🚀 Generating story with params:', params);

      // Use centralized AI API with context window capping
      const result = await generateStorySegment({
        prompt: params.prompt || '',
        age: params.targetAge || '7-9',
        genre: params.genre || 'fantasy',
        ...(params.storyId && { storyId: params.storyId }),
        ...(params.parentSegmentId && { parentSegmentId: params.parentSegmentId }),
        ...(params.choiceText && { choiceText: params.choiceText }),
        ...(params.skipImage !== undefined && { skipImage: params.skipImage }),
      });

      // Create a segment object from the enhanced response
      const storyData = {
        id: result.id || `temp-${Date.now()}`,
        story_id: result.story_id || params.storyId || `story-${Date.now()}`,
        parent_segment_id: params.parentSegmentId || null,
        segment_text: result.text,
        choice_text: params.choiceText || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        audio_url: null,
        audio_status: 'not_started',
        image_url: result.image_url || '/placeholder.svg',
        image_status: result.image_url && result.image_url !== '/placeholder.svg' ? 'completed' : 'not_started',
        image_prompt: null,
        choices: result.choices || [],
        is_end: result.is_end || false
      };

      secureConsole.info('✅ Story generation successful:', storyData);
      return storyData;
    },
    onSuccess: (segment) => {
      secureConsole.info('🎉 Story segment generated successfully:', segment);
      
      // Invalidate and refetch story data
      if (segment.story_id) {
        queryClient.invalidateQueries({ queryKey: ['story', segment.story_id] });
      }
      queryClient.invalidateQueries({ queryKey: ['stories'] });
    },
    onError: (error) => {
      secureConsole.error('💥 Story generation failed:', error);
      const errorMessage = error.message || 'Failed to generate story';
      secureConsole.error('Error details:', errorMessage);
    }
  });

  return {
    generateSegment: mutation.mutateAsync,
    isGenerating: mutation.isPending,
    error: mutation.error?.message || null
  };
};
