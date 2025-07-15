
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const generateFullStoryAudio = async ({ storyId, voiceId }: { storyId: string, voiceId: string }) => {
  const { data, error } = await supabase.functions.invoke('generate-full-story-audio', {
    body: { storyId, voiceId },
  });

  if (error) {
    const errorBody = await (error as any).context.json();
    throw new Error(errorBody.error || error.message);
  }
  return data;
};

export const useGenerateFullStoryAudio = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: generateFullStoryAudio,
    onSuccess: (_, { storyId }) => {
      toast.success("Audio generation started!", {
        description: "This may take a few minutes. The audio will appear below when ready.",
      });
      queryClient.invalidateQueries({ queryKey: ['story', storyId] });
      queryClient.invalidateQueries({ queryKey: ['stories'] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to start audio generation: ${error.message}`);
    },
  });
};
