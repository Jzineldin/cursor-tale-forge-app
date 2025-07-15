
-- Add columns to the stories table for full story audio
ALTER TABLE public.stories
ADD COLUMN IF NOT EXISTS full_story_audio_url TEXT,
ADD COLUMN IF NOT EXISTS audio_generation_status TEXT NOT NULL DEFAULT 'not_started'; -- Values can be: 'not_started', 'in_progress', 'completed', 'failed'

-- Add comments for the new columns
COMMENT ON COLUMN public.stories.full_story_audio_url IS 'URL for the full, combined audio narration of the story.';
COMMENT ON COLUMN public.stories.audio_generation_status IS 'Tracks the status of the full story audio generation.';

-- Create a storage bucket for full story audio files
INSERT INTO storage.buckets (id, name, public)
VALUES ('full-story-audio', 'full-story-audio', true)
ON CONFLICT (id) DO NOTHING;

-- Drop the policy if it exists to ensure the script is re-runnable.
DROP POLICY IF EXISTS "Allow public reads on full_story_audio" ON storage.objects;

-- Create a policy to allow anyone (anonymous and authenticated users) to view audio
CREATE POLICY "Allow public reads on full_story_audio"
ON storage.objects FOR SELECT
TO anon, authenticated
USING ( bucket_id = 'full-story-audio' );
