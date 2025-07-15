
import { useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { StorySegmentRow } from '@/types/stories';

interface UseStoryRealtimeWithPollingProps {
    storyId: string;
    segments: StorySegmentRow[];
}

export const useStoryRealtimeWithPolling = ({ 
    storyId, 
    segments 
}: UseStoryRealtimeWithPollingProps) => {
    const queryClient = useQueryClient();
    const [realtimeStatus, setRealtimeStatus] = useState<string>('disconnected');
    const pollingIntervalRef = useRef<number | null>(null);
    const channelRef = useRef<any>(null);

    // Check if any segments are still generating
    const hasGeneratingSegments = segments.some(segment => {
        const isGenerating = !segment.image_url || 
            segment.image_generation_status === 'pending' || 
            segment.image_generation_status === 'in_progress';
        
        if (isGenerating) {
            console.log('[Realtime] Segment still generating:', {
                id: segment.id,
                image_url: segment.image_url ? 'present' : 'missing',
                status: segment.image_generation_status
            });
        }
        
        return isGenerating;
    });

    console.log('[Realtime] Generation status check:', {
        totalSegments: segments.length,
        hasGeneratingSegments,
        segmentStatuses: segments.map(s => ({
            id: s.id,
            hasImage: !!s.image_url,
            status: s.image_generation_status
        }))
    });

    const startPolling = () => {
        if (pollingIntervalRef.current || !hasGeneratingSegments) return;
        
        console.log('[Realtime] Starting polling fallback for story:', storyId);
        pollingIntervalRef.current = window.setInterval(() => {
            console.log('[Realtime] Polling for updates...');
            queryClient.invalidateQueries({ queryKey: ['story', storyId] });
        }, 3000);
    };

    const stopPolling = () => {
        if (pollingIntervalRef.current) {
            console.log('[Realtime] Stopping polling');
            clearInterval(pollingIntervalRef.current);
            pollingIntervalRef.current = null;
        }
    };

    const handleRealtimeUpdate = (payload: any) => {
        console.log('[Realtime] Received update payload:', payload);
        
        const updatedSegment = payload.new as StorySegmentRow;
        if (!updatedSegment || updatedSegment.story_id !== storyId) {
            console.log('[Realtime] Ignoring update - wrong story or no segment data');
            return;
        }

        console.log('[Realtime] Processing segment update:', {
            segmentId: updatedSegment.id,
            imageUrl: updatedSegment.image_url ? 'present' : 'missing',
            status: updatedSegment.image_generation_status,
            imageUrlPreview: updatedSegment.image_url?.substring(0, 50) + '...'
        });

        // Update React Query cache with new segment data
        queryClient.setQueryData(['story', storyId], (oldData: any) => {
            if (!oldData) {
                console.log('[Realtime] No old data to update');
                return oldData;
            }
            
            const updatedData = {
                ...oldData,
                story_segments: oldData.story_segments?.map((segment: StorySegmentRow) =>
                    segment.id === updatedSegment.id 
                        ? { 
                            ...segment, 
                            image_url: updatedSegment.image_url,
                            image_generation_status: updatedSegment.image_generation_status
                          }
                        : segment
                ) || []
            };
            
            console.log('[Realtime] Updated cache data for segment:', {
                segmentId: updatedSegment.id,
                newImageUrl: updatedSegment.image_url,
                newStatus: updatedSegment.image_generation_status
            });
            return updatedData;
        });

        // Force invalidation to ensure all components re-render with fresh data
        console.log('[Realtime] Forcing query invalidation for story:', storyId);
        queryClient.invalidateQueries({ queryKey: ['story', storyId] });
    };

    // Setup realtime subscription
    useEffect(() => {
        if (!storyId) return;

        console.log('[Realtime] Setting up subscription for story:', storyId);

        const channel = supabase
            .channel(`story-${storyId}`)
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'story_segments',
                    filter: `story_id=eq.${storyId}`
                },
                handleRealtimeUpdate
            )
            .subscribe((status) => {
                console.log('[Realtime] Subscription status changed:', status);
                setRealtimeStatus(status);

                if (status === 'SUBSCRIBED') {
                    console.log('[Realtime] Successfully connected, stopping polling');
                    stopPolling();
                } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
                    console.log('[Realtime] Connection failed, starting polling fallback');
                    startPolling();
                }
            });

        channelRef.current = channel;

        return () => {
            console.log('[Realtime] Cleaning up subscription');
            if (channelRef.current) {
                supabase.removeChannel(channelRef.current);
            }
            stopPolling();
        };
    }, [storyId]);

    // Manage polling based on generating segments
    useEffect(() => {
        if (hasGeneratingSegments && realtimeStatus !== 'SUBSCRIBED') {
            console.log('[Realtime] Starting polling - has generating segments and not subscribed');
            startPolling();
        } else if (!hasGeneratingSegments) {
            console.log('[Realtime] Stopping polling - no generating segments');
            stopPolling();
        }

        return () => stopPolling();
    }, [hasGeneratingSegments, realtimeStatus]);

    return {
        realtimeStatus,
        isPolling: pollingIntervalRef.current !== null
    };
};
