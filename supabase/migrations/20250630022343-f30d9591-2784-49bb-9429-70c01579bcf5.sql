
-- Add missing columns to story_segments table
ALTER TABLE public.story_segments 
ADD COLUMN IF NOT EXISTS word_count INTEGER,
ADD COLUMN IF NOT EXISTS audio_generation_status TEXT DEFAULT 'not_started';

-- Add a check constraint to ensure only valid audio generation statuses are used
-- First drop the constraint if it exists, then create it
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'story_segments_audio_generation_status_check') THEN
        ALTER TABLE public.story_segments DROP CONSTRAINT story_segments_audio_generation_status_check;
    END IF;
END $$;

ALTER TABLE public.story_segments 
ADD CONSTRAINT story_segments_audio_generation_status_check 
CHECK (audio_generation_status IN ('not_started', 'in_progress', 'completed', 'failed'));
