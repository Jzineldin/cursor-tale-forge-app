
-- This function will run when a scene is animated. It checks if all scenes for a story are done,
-- and if so, it marks the entire story's animation process as complete.
CREATE OR REPLACE FUNCTION public.check_all_segments_animated()
RETURNS TRIGGER AS $$
DECLARE
  v_story_id UUID;
  total_segments INT;
  completed_segments INT;
BEGIN
  -- We only care about updates where status becomes 'completed'
  IF (TG_OP = 'UPDATE' AND NEW.animated_video_status = 'completed' AND OLD.animated_video_status != 'completed') THEN
    v_story_id := NEW.story_id;

    -- Get total and completed segment counts
    SELECT
      COUNT(*),
      COUNT(*) FILTER (WHERE animated_video_status = 'completed')
    INTO
      total_segments,
      completed_segments
    FROM public.story_segments
    WHERE story_id = v_story_id;

    -- If all are complete, update the parent story
    IF total_segments > 0 AND total_segments = completed_segments THEN
      UPDATE public.stories
      SET animated_video_status = 'completed'
      WHERE id = v_story_id;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- This trigger will automatically run the function above whenever a story segment's animation status is updated.
-- We drop it first to ensure we're not creating duplicates.
DROP TRIGGER IF EXISTS on_segment_animated_update_story ON public.story_segments;

CREATE TRIGGER on_segment_animated_update_story
AFTER UPDATE OF animated_video_status ON public.story_segments
FOR EACH ROW
EXECUTE FUNCTION public.check_all_segments_animated();
