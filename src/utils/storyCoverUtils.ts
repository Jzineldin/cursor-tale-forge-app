import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

/**
 * Updates story thumbnail_url from the first segment's image_url
 * This utility fixes stories that don't have thumbnails set
 */
export const updateStoryThumbnailFromFirstSegment = async (storyId: string): Promise<boolean> => {
  try {
    console.log('🖼️ Updating story thumbnail for:', storyId);
    
    // Get the first segment (parent_segment_id is null) that has an image
    const { data: firstSegment, error: segmentError } = await supabase
      .from('story_segments')
      .select('image_url, image_generation_status')
      .eq('story_id', storyId)
      .is('parent_segment_id', null)
      .single();

    if (segmentError) {
      console.error('Error fetching first segment:', segmentError);
      return false;
    }

    if (!firstSegment?.image_url || firstSegment.image_url === '/placeholder.svg') {
      console.log('No valid image found in first segment');
      return false;
    }

    // Update the story's thumbnail_url
    const { error: updateError } = await supabase
      .from('stories')
      .update({ thumbnail_url: firstSegment.image_url })
      .eq('id', storyId);

    if (updateError) {
      console.error('Error updating story thumbnail:', updateError);
      return false;
    }

    console.log('✅ Story thumbnail updated successfully');
    return true;
  } catch (error) {
    console.error('Failed to update story thumbnail:', error);
    return false;
  }
};

/**
 * Batch update thumbnails for multiple stories
 */
export const batchUpdateStoryThumbnails = async (): Promise<void> => {
  try {
    console.log('🔄 Starting batch thumbnail update...');
    
    // Get all stories that don't have thumbnails or have placeholder thumbnails
    const { data: stories, error: storiesError } = await supabase
      .from('stories')
      .select('id, title, thumbnail_url')
      .or('thumbnail_url.is.null,thumbnail_url.eq./placeholder.svg')
      .limit(50); // Process in batches to avoid overwhelming the system

    if (storiesError) {
      console.error('Error fetching stories:', storiesError);
      toast.error('Failed to fetch stories for thumbnail update');
      return;
    }

    if (!stories || stories.length === 0) {
      console.log('No stories need thumbnail updates');
      toast.info('All stories already have thumbnails');
      return;
    }

    console.log(`Found ${stories.length} stories that need thumbnail updates`);
    let successCount = 0;
    let failureCount = 0;

    for (const story of stories) {
      const success = await updateStoryThumbnailFromFirstSegment(story.id);
      if (success) {
        successCount++;
      } else {
        failureCount++;
      }
      
      // Small delay to avoid overwhelming the API
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log(`✅ Batch update complete: ${successCount} success, ${failureCount} failures`);
    toast.success(`Updated ${successCount} story thumbnails successfully`);
    
    if (failureCount > 0) {
      toast.warning(`${failureCount} stories could not be updated (likely no images generated yet)`);
    }
    
  } catch (error) {
    console.error('Batch thumbnail update failed:', error);
    toast.error('Failed to update story thumbnails');
  }
};

/**
 * Get story cover image URL with fallback logic
 */
export const getStoryCoverImage = (story: { thumbnail_url?: string | null; story_mode?: string }): string => {
  // First priority: Use actual story thumbnail if available
  if (story.thumbnail_url && story.thumbnail_url !== '/placeholder.svg') {
    return story.thumbnail_url;
  }
  
  // Fallback: Use story mode generic images
  const imageMap: { [key: string]: string } = {
    'Epic Fantasy': '/images/epic-fantasy.png',
    'Sci-Fi Thriller': '/images/sci-fi-thriller.png',
    'Mystery Detective': '/images/mystery-detective.png',
    'Horror Story': '/images/horror-story.png',
    'Adventure Quest': '/images/adventure-quest.png',
    'Romantic Drama': '/images/romantic-drama.png',
    'Comedy Adventure': '/images/comedy-adventure.png',
    'Historical Journey': '/images/historical-journey.png',
    'Child-Adapted Story': '/images/child-adapted-story.png',
    'Educational Adventure': '/images/educational-adventure.png',
  };
  
  return imageMap[story.story_mode || 'Epic Fantasy'] || '/images/epic-fantasy.png';
};
