
-- Add a new column to the 'stories' table to store visual context
ALTER TABLE public.stories
ADD COLUMN visual_context JSONB;
