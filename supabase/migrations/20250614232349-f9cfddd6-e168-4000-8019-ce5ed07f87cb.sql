
-- Add a new column to store audio duration in seconds
ALTER TABLE public.story_segments
ADD COLUMN audio_duration REAL;

-- Add a comment for the new column
COMMENT ON COLUMN public.story_segments.audio_duration IS 'Duration of the audio file in seconds.';
