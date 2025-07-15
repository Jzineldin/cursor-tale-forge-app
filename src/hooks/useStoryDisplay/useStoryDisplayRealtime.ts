
import { useStorySegmentRealtime } from './useStorySegmentRealtime';
import { StorySegment } from './types';

interface UseStoryDisplayRealtimeProps {
  storyId: string;
  currentStorySegment: StorySegment | null;
  setCurrentStorySegment: (segment: StorySegment | null) => void;
  setAllStorySegments: (segments: StorySegment[] | ((prev: StorySegment[]) => StorySegment[])) => void;
}

export const useStoryDisplayRealtime = (props: UseStoryDisplayRealtimeProps) => {
  // Set up real-time subscription for story segments
  useStorySegmentRealtime(props);
  
  // Additional real-time subscriptions can be added here
  // For example, story-level updates, user presence, etc.
};
