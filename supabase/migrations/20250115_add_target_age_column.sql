-- Add target_age column to stories table
-- This column will store the age group (4-6, 7-9, 10-12) for age-appropriate content generation

ALTER TABLE stories 
ADD COLUMN target_age VARCHAR(10) CHECK (target_age IN ('4-6', '7-9', '10-12'));

-- Add a comment to document the column
COMMENT ON COLUMN stories.target_age IS 'Target age group for age-appropriate content generation: 4-6, 7-9, or 10-12';

-- Create an index for better query performance when filtering by age
CREATE INDEX idx_stories_target_age ON stories(target_age); 