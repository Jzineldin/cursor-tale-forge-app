
-- Create a new storage bucket for audio files if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('story-audio', 'story-audio', true, 5242880, ARRAY['audio/mpeg'])
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies if they exist, to ensure idempotency
DROP POLICY IF EXISTS "Public read access for story audio" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload audio" ON storage.objects;

-- Create RLS policies for the new bucket
CREATE POLICY "Public read access for story audio"
ON storage.objects FOR SELECT
USING ( bucket_id = 'story-audio' );

CREATE POLICY "Authenticated users can upload audio"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'story-audio' );

-- Add audio_url to story_segments table if it doesn't exist
ALTER TABLE public.story_segments
ADD COLUMN IF NOT EXISTS audio_url TEXT;
