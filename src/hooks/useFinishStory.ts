
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const finishStoryWithEnding = async (storyId: string) => {
  // First, get all story segments to understand the full narrative
  const { data: segments, error: segmentsError } = await supabase
    .from('story_segments')
    .select('*')
    .eq('story_id', storyId)
    .order('created_at', { ascending: true });

  if (segmentsError || !segments || segments.length === 0) {
    throw new Error('Failed to fetch story segments');
  }

  // Get the story details
  const { data: story, error: storyError } = await supabase
    .from('stories')
    .select('story_mode')
    .eq('id', storyId)
    .single();

  if (storyError) {
    throw new Error('Failed to fetch story details');
  }

  // Find the last segment
  const lastSegment = segments[segments.length - 1];
  
  // Combine all segments into story context
  const storyText = segments.map(seg => seg.segment_text).join('\n\n');
  
  // Create a comprehensive ending prompt that will generate an image
  const endingPrompt = `Based on the story so far, write a compelling conclusion that wraps up all the narrative threads. This should be a proper ending that resolves the story satisfyingly.

Story mode: ${story.story_mode || 'fantasy'}

Complete story so far:
${storyText}

Write a conclusion that:
1. Brings the story to a satisfying close
2. Resolves any conflicts or tensions
3. Provides closure for the main character(s)
4. Matches the tone of the story
5. Is approximately 100-150 words
6. Includes a vivid final scene that can be visualized

Write only the ending segment - no choices needed as this concludes the story.`;

  console.log('🏁 Generating story ending with image generation enabled');

  // Generate the ending segment using the story generation function WITH image generation
  const { data: endingSegment, error: generationError } = await supabase.functions.invoke('generate-story-segment', {
    body: {
      storyId: storyId,
      prompt: endingPrompt,
      parentSegmentId: lastSegment.id,
      choiceText: 'Conclude the story',
      storyMode: story.story_mode || 'fantasy',
      generateImage: true // Explicitly request image generation for the ending
    }
  });

  if (generationError) {
    console.error('Story ending generation error:', generationError);
    throw new Error(`Failed to generate story ending: ${generationError.message}`);
  }

  if (!endingSegment || !endingSegment.id) {
    throw new Error('Invalid response from story generation');
  }

  console.log('✅ Story ending generated successfully:', endingSegment.id);

  // Mark the story as completed and the new segment as the ending
  const { error: updateError } = await supabase
    .from('story_segments')
    .update({ is_end: true })
    .eq('id', endingSegment.id);

  if (updateError) {
    console.error('Error marking segment as end:', updateError);
    throw new Error('Failed to mark story as completed');
  }

  // Update the story status
  const { error: storyUpdateError } = await supabase
    .from('stories')
    .update({ 
      is_completed: true,
    })
    .eq('id', storyId);

  if (storyUpdateError) {
    console.error('Error updating story status:', storyUpdateError);
    throw new Error('Failed to update story status');
  }

  return { endingSegment, storyId };
};

export const useFinishStory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: finishStoryWithEnding,
    onSuccess: (data) => {
      toast.success("Story completed! The ending image is being generated. You can now create audio narration below. 🎉");
      
      // Force multiple refreshes to ensure we get the latest data
      queryClient.invalidateQueries({ queryKey: ['story', data.storyId] });
      queryClient.refetchQueries({ queryKey: ['story', data.storyId] });
      
      // Additional refresh after a short delay to catch any async updates
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['story', data.storyId] });
        queryClient.refetchQueries({ queryKey: ['story', data.storyId] });
      }, 1000);
    },
    onError: (error: Error) => {
      console.error('Finish story error:', error);
      toast.error(`Failed to finish story: ${error.message}`);
    },
  });
};
