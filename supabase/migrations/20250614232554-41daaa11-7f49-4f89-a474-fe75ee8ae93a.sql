
-- Add columns for video compilation to the stories table
ALTER TABLE public.stories
ADD COLUMN video_compilation_status TEXT NOT NULL DEFAULT 'not_started',
ADD COLUMN video_url TEXT;

-- Add comments for the new columns
COMMENT ON COLUMN public.stories.video_compilation_status IS 'Tracks the status of the final video compilation.';
COMMENT ON COLUMN public.stories.video_url IS 'URL of the compiled story video.';

-- Create a new storage bucket for the final compiled videos
-- We set a generous file size limit and allow only mp4 files.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('story-videos', 'story-videos', true, 1073741824, ARRAY['video/mp4'])
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies if they exist, to ensure idempotency
DROP POLICY IF EXISTS "Public read access for story videos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload videos" ON storage.objects;

-- Create RLS policy to make videos in this bucket publicly readable
CREATE POLICY "Public read access for story videos"
ON storage.objects FOR SELECT
USING ( bucket_id = 'story-videos' );

-- Create RLS policy to allow authenticated sessions (like our edge function) to upload videos
CREATE POLICY "Authenticated users can upload videos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'story-videos' );
