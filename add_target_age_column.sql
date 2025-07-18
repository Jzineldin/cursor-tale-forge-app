-- Add target_age column to stories table for age-appropriate content generation
ALTER TABLE public.stories 
ADD COLUMN IF NOT EXISTS target_age TEXT CHECK (target_age IN ('4-6', '7-9', '10-12'));

-- Add comment to explain the column
COMMENT ON COLUMN public.stories.target_age IS 'Target age group for the story (4-6, 7-9, or 10-12 years old)';

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_stories_target_age ON public.stories (target_age);

-- Update existing stories to have a default age group (7-9 as middle ground)
UPDATE public.stories 
SET target_age = '7-9' 
WHERE target_age IS NULL; 