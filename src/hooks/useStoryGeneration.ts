
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';


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
      console.log('🚀 Generating story with params:', params);

      const { data, error } = await supabase.functions.invoke('generate-story-segment', {
        body: params
      });

      console.log('📡 Raw response from edge function:', { data, error });

      if (error) {
        console.error('❌ Supabase function error:', error);
        throw new Error(error.message || 'Failed to generate story');
      }

      if (!data) {
        console.error('❌ No data returned from function');
        throw new Error('No data returned from story generation');
      }

      // Handle both old and new response formats
      if (data.success === false) {
        console.error('❌ Story generation failed:', data.error);
        throw new Error(data.error || 'Story generation failed');
      }

      // Extract the actual story data
      const storyData = data.success ? data.data : data;
      
      if (!storyData) {
        console.error('❌ No story data in response');
        throw new Error('No story data returned');
      }

      console.log('✅ Story generation successful:', storyData);
      return storyData;
    },
    onSuccess: (segment) => {
      console.log('🎉 Story segment generated successfully:', segment);
      
      // Invalidate and refetch story data
      if (segment.story_id) {
        queryClient.invalidateQueries({ queryKey: ['story', segment.story_id] });
      }
      queryClient.invalidateQueries({ queryKey: ['stories'] });
    },
    onError: (error) => {
      console.error('💥 Story generation failed:', error);
      const errorMessage = error.message || 'Failed to generate story';
      console.error('Error details:', errorMessage);
    }
  });

  return {
    generateSegment: mutation.mutateAsync,
    isGenerating: mutation.isPending,
    error: mutation.error?.message || null
  };
};
