
-- Add columns to track animated video generation status
ALTER TABLE public.stories
ADD COLUMN IF NOT EXISTS animated_video_status TEXT NOT NULL DEFAULT 'not_started';

ALTER TABLE public.story_segments
ADD COLUMN IF NOT EXISTS animated_video_url TEXT,
ADD COLUMN IF NOT EXISTS animated_video_status TEXT NOT NULL DEFAULT 'not_started';

COMMENT ON COLUMN public.stories.animated_video_status IS 'Tracks the status of the premium animated video generation. Values: not_started, in_progress, completed, failed';
COMMENT ON COLUMN public.story_segments.animated_video_url IS 'URL of the short animated video clip for this segment.';
COMMENT ON COLUMN public.story_segments.animated_video_status IS 'Tracks the animation status for an individual segment. Values: not_started, in_progress, completed, failed';

-- Create a storage bucket for the animated video segments
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('animated-story-segments', 'animated-story-segments', true, 52428800, ARRAY['video/mp4']) -- 50MB limit per clip
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies if they exist to ensure idempotency
DROP POLICY IF EXISTS "Public read access for animated segments" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload animated segments" ON storage.objects;

-- RLS for public read access
CREATE POLICY "Public read access for animated segments"
ON storage.objects FOR SELECT
USING ( bucket_id = 'animated-story-segments' );

-- RLS for authenticated uploads (for our edge function)
CREATE POLICY "Authenticated users can upload animated segments"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'animated-story-segments' );

-- Add audio duration tracking to segments, which will be needed for video sync
ALTER TABLE public.story_segments
ADD COLUMN IF NOT EXISTS audio_duration NUMERIC;

COMMENT ON COLUMN public.story_segments.audio_duration IS 'Duration of the segment''s audio in seconds.';
