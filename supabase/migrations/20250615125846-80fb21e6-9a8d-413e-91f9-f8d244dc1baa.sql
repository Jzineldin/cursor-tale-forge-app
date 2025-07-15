
-- First, modify the metadata update function to correctly handle both INSERT and UPDATE operations.
-- It will now only increment segment_count on INSERTs.
CREATE OR REPLACE FUNCTION public.update_story_metadata()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  -- On INSERT, increment segment count and set thumbnail if it's the first segment.
  IF (TG_OP = 'INSERT') THEN
    UPDATE public.stories
    SET segment_count = segment_count + 1
    WHERE id = NEW.story_id;

    IF NEW.parent_segment_id IS NULL THEN
      UPDATE public.stories
      SET thumbnail_url = NEW.image_url
      WHERE id = NEW.story_id;
    END IF;
  END IF;

  -- On both INSERT and UPDATE, if a segment is marked as the end,
  -- update the parent story to be completed.
  IF NEW.is_end = true THEN
    UPDATE public.stories
    SET is_completed = true
    WHERE id = NEW.story_id;
  END IF;

  RETURN NEW;
END;
$$;

-- Second, create a new trigger that fires the function when a segment is updated.
-- This is crucial for when we use the "Finish Story" button.
CREATE TRIGGER on_story_segment_update
  AFTER UPDATE ON public.story_segments
  FOR EACH ROW
  WHEN (OLD.is_end IS DISTINCT FROM NEW.is_end)
  EXECUTE PROCEDURE public.update_story_metadata();

-- Finally, let's fix the story you just finished by manually setting its 'is_completed' status.
-- The new trigger will handle this for all future stories.
UPDATE public.stories
SET is_completed = true
WHERE id = 'ce17b508-b72c-44e5-bfbb-1e972471630e';
