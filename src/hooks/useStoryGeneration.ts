
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
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
}

export const useStoryGeneration = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (params: GenerateStoryParams) => {
      secureConsole.debug('🚀 Generating story with params:', params);

      const { data, error } = await supabase.functions.invoke('generate-story-segment', {
        body: params
      });

      secureConsole.debug('📡 Raw response from edge function:', { data, error });

      if (error) {
        secureConsole.error('❌ Supabase function error:', error);
        throw new Error(error.message || 'Failed to generate story');
      }

      if (!data) {
        secureConsole.error('❌ No data returned from function');
        throw new Error('No data returned from story generation');
      }

      // Handle both old and new response formats
      if (data.success === false) {
        secureConsole.error('❌ Story generation failed:', data.error);
        throw new Error(data.error || 'Story generation failed');
      }

      // Extract the actual story data
      const storyData = data.success ? data.data : data;
      
      if (!storyData) {
        secureConsole.error('❌ No story data in response');
        throw new Error('No story data returned');
      }

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
