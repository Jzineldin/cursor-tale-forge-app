
-- Add columns to track public status and publication date
ALTER TABLE public.stories
ADD COLUMN is_public BOOLEAN NOT NULL DEFAULT FALSE,
ADD COLUMN published_at TIMESTAMPTZ;
