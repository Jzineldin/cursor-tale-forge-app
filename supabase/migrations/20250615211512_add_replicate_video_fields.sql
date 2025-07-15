
ALTER TABLE public.stories
ADD COLUMN replicate_prediction_id TEXT,
ADD COLUMN replicate_video_url TEXT,
ADD COLUMN replicate_video_status TEXT NOT NULL DEFAULT 'not_started';

-- Add an index for faster lookups on prediction ID
CREATE INDEX idx_stories_replicate_prediction_id ON public.stories (replicate_prediction_id);
