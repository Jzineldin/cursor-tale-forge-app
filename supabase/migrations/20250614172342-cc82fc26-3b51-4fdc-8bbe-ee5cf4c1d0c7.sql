
-- Add a new column to the 'stories' table for narrative context
ALTER TABLE public.stories
ADD COLUMN narrative_context JSONB;
