
CREATE OR REPLACE FUNCTION public.delete_story_branch(p_segment_id uuid)
RETURNS void AS $$
DECLARE
  v_story_id uuid;
  v_user_id uuid;
  segments_to_delete uuid[];
  current_user_id uuid := auth.uid();
BEGIN
  -- Check permission and get story_id
  SELECT s.id, s.user_id INTO v_story_id, v_user_id
  FROM public.story_segments ss
  JOIN public.stories s ON ss.story_id = s.id
  WHERE ss.id = p_segment_id;

  -- Ensure the story and user exist, and the user is the owner
  IF v_story_id IS NULL THEN
    RAISE EXCEPTION 'Story segment not found.';
  END IF;

  IF v_user_id IS NULL OR v_user_id != current_user_id THEN
    RAISE EXCEPTION 'You do not have permission to modify this story.';
  END IF;

  -- Find all segments in the branch starting from the *next* segment
  -- because we want to go back TO this point, not eliminate it.
  WITH RECURSIVE branch AS (
    SELECT id FROM public.story_segments WHERE parent_segment_id = p_segment_id
    UNION ALL
    SELECT ss.id FROM public.story_segments ss JOIN branch b ON ss.parent_segment_id = b.id
  )
  SELECT array_agg(id) INTO segments_to_delete FROM branch;

  -- The segment to go back to might not have children, which is fine.
  -- But if it does, we delete them.
  IF array_length(segments_to_delete, 1) > 0 THEN
    DELETE FROM public.story_segments WHERE id = ANY(segments_to_delete);
  END IF;

  -- Update story metadata
  UPDATE public.stories
  SET
    segment_count = (SELECT count(*) FROM public.story_segments WHERE story_id = v_story_id),
    is_completed = (SELECT EXISTS (SELECT 1 FROM public.story_segments WHERE story_id = v_story_id AND is_end = true))
  WHERE id = v_story_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
