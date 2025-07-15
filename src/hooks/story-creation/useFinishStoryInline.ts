
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface FinishStoryParams {
  storyId: string;
  skipImage?: boolean;
}

const finishStoryInline = async ({ storyId, skipImage = false }: FinishStoryParams) => {
  console.log('🏁 Finishing story with generated ending:', storyId);
  console.log('📸 Skip image for ending:', skipImage);
  
  const { data, error } = await supabase.functions.invoke('finish-story', {
    body: { storyId, skipImage }
  });

  if (error) {
    console.error('❌ Error finishing story:', error);
    throw new Error(error.message || 'Failed to finish story');
  }

  if (!data?.success) {
    throw new Error(data?.error || 'Failed to generate story ending');
  }

  console.log('✅ Story finished successfully with generated ending');
  return data;
};

export const useFinishStoryInline = () => {
  return useMutation({
    mutationFn: finishStoryInline,
    onSuccess: () => {
      toast.success('Story ending generated successfully! 🎉');
    },
    onError: (error: Error) => {
      console.error('🚨 Story finishing failed:', error);
      toast.error(`Failed to generate story ending: ${error.message}`);
    },
  });
};
