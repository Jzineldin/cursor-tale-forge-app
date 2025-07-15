
-- Add new columns to the stories table for enhanced metadata
ALTER TABLE public.stories
ADD COLUMN is_completed BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN thumbnail_url TEXT,
ADD COLUMN segment_count INTEGER NOT NULL DEFAULT 0;

-- Create a function to update story metadata when a segment is added
CREATE OR REPLACE FUNCTION public.update_story_metadata()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  -- Update segment_count
  UPDATE public.stories
  SET segment_count = segment_count + 1
  WHERE id = NEW.story_id;

  -- Check if this segment marks the end of the story
  IF NEW.is_end = true THEN
    UPDATE public.stories
    SET is_completed = true
    WHERE id = NEW.story_id;
  END IF;

  -- If this is the first segment, update the thumbnail_url
  IF NEW.parent_segment_id IS NULL THEN
    UPDATE public.stories
    SET thumbnail_url = NEW.image_url
    WHERE id = NEW.story_id;
  END IF;

  RETURN NEW;
END;
$$;

-- Create a trigger that fires the function after a new segment is inserted
CREATE TRIGGER on_story_segment_insert
  AFTER INSERT ON public.story_segments
  FOR EACH ROW
  EXECUTE PROCEDURE public.update_story_metadata();
