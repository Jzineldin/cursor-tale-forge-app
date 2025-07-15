
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { StoryWithSegments } from '@/types/stories';

const fetchStoryWithSegments = async (storyId: string): Promise<StoryWithSegments> => {
    console.log('[useStoryData] Fetching story with segments for ID:', storyId);
    
    const { data, error } = await supabase
        .from('stories')
        .select(`
            *,
            story_segments (
                id,
                story_id,
                segment_text,
                image_url,
                image_generation_status,
                choices,
                is_end,
                parent_segment_id,
                triggering_choice_text,
                created_at,
                audio_url,
                audio_duration
            )
        `)
        .eq('id', storyId)
        .order('created_at', { foreignTable: 'story_segments', ascending: true })
        .single();
    
    if (error) {
        console.error('[useStoryData] Error fetching story:', error);
        throw new Error(error.message);
    }

    console.log('[useStoryData] Successfully fetched story:', {
        id: data.id,
        title: data.title,
        segmentsCount: data.story_segments?.length || 0,
        segments: data.story_segments?.map(s => ({
            id: s.id,
            image_url: s.image_url,
            image_generation_status: s.image_generation_status,
            hasImageUrl: !!s.image_url,
            imageUrlPreview: s.image_url?.substring(0, 50) + '...'
        })) || []
    });

    return data as StoryWithSegments;
};

export const useStoryData = () => {
    const { storyId } = useParams<{ storyId: string }>();

    console.log('[useStoryData] Current storyId from params:', storyId);

    const { data: story, isLoading, error, refetch } = useQuery({
        queryKey: ['story', storyId],
        queryFn: () => fetchStoryWithSegments(storyId!),
        enabled: !!storyId,
        staleTime: 0, // Always consider data stale to ensure fresh fetches
    });
    
    console.log('[useStoryData] Query result:', { 
        story: story ? { 
            id: story.id, 
            title: story.title, 
            is_completed: story.is_completed,
            segmentsCount: story.story_segments?.length || 0,
            segmentData: story.story_segments?.map(s => ({
                id: s.id,
                image_url: s.image_url,
                image_generation_status: s.image_generation_status
            })) || []
        } : null, 
        isLoading, 
        error: error?.message,
        storyId 
    });

    return {
        story,
        isLoading,
        error,
        refetch,
        storyId
    };
};
