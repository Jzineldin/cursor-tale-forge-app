
-- Add image_generation_status column to story_segments table
ALTER TABLE public.story_segments 
ADD COLUMN image_generation_status text NOT NULL DEFAULT 'pending';

-- Add a check constraint to ensure only valid statuses are used
ALTER TABLE public.story_segments 
ADD CONSTRAINT story_segments_image_generation_status_check 
CHECK (image_generation_status IN ('pending', 'in_progress', 'completed', 'failed'));
