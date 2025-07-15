
-- Create a function to mark a story segment as the end of the story.
CREATE OR REPLACE FUNCTION public.end_story_at_segment(p_segment_id uuid)
RETURNS SETOF story_segments
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  v_story_id uuid;
  v_user_id uuid;
  current_user_id uuid := auth.uid();
BEGIN
  -- Get story_id and owner user_id
  SELECT ss.story_id, s.user_id INTO v_story_id, v_user_id
  FROM public.story_segments ss
  JOIN public.stories s ON ss.story_id = s.id
  WHERE ss.id = p_segment_id;

  -- Ensure the story segment exists
  IF v_story_id IS NULL THEN
    RAISE EXCEPTION 'Story segment not found.';
  END IF;

  -- If the story has an owner, check for permission
  IF v_user_id IS NOT NULL AND v_user_id != current_user_id THEN
    RAISE EXCEPTION 'You do not have permission to modify this story.';
  END IF;

  -- Update the segment to be the end, and clear choices.
  -- The existing `update_story_metadata` trigger will automatically update the
  -- parent story's `is_completed` status.
  RETURN QUERY
  UPDATE public.story_segments
  SET is_end = true, choices = '{}'::text[]
  WHERE id = p_segment_id
  RETURNING *;
END;
$function$
