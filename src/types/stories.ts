
// Represents a single segment of a story from the database
export interface StorySegmentRow {
  id: string;
  story_id: string;
  segment_text: string;
  image_url: string;
  image_generation_status: string;
  choices: string[];
  is_end: boolean;
  parent_segment_id: string | null;
  triggering_choice_text: string | null;
  created_at: string;
  audio_url: string | null;
  audio_duration: number | null;
}

// Base type for a story record from the database
export interface Story {
  id: string;
  title: string | null;
  created_at: string;
  is_public: boolean;
  is_completed: boolean;
  story_mode: string | null;
  thumbnail_url: string | null;
  segment_count: number;
  published_at?: string | null;
  full_story_audio_url: string | null;
  audio_generation_status: 'not_started' | 'in_progress' | 'completed' | 'failed';
  shotstack_render_id?: string | null;
  shotstack_video_url?: string | null;
  shotstack_status?: 'not_started' | 'submitted' | 'queued' | 'rendering' | 'saving' | 'done' | 'failed';
  user_id?: string;
  description?: string | null;
}

// Combines the Story with its segments, typically for detailed views
export interface StoryWithSegments extends Story {
    story_segments: StorySegmentRow[];
}

// A simplified version of a segment for display components like StoryPage
export interface StorySegment {
  storyId: string;
  text: string;
  imageUrl: string;
  choices: string[];
  isEnd: boolean;
}
