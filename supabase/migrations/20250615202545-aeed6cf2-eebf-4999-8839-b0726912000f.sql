
CREATE OR REPLACE FUNCTION public.delete_story_and_segments(p_story_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
  current_user_id uuid := auth.uid();
BEGIN
  -- Check permission and get story's user_id
  SELECT user_id INTO v_user_id FROM stories WHERE id = p_story_id;

  -- Ensure the story exists and user is owner
  IF v_user_id IS NULL THEN
    RAISE WARNING 'Story not found: %', p_story_id;
    RETURN;
  END IF;
  
  -- Allow deletion only by the story owner.
  IF v_user_id != current_user_id THEN
    RAISE EXCEPTION 'You do not have permission to delete this story.';
  END IF;

  -- With SECURITY DEFINER, we bypass RLS, so the manual check above is crucial.
  -- Now, delete the segments and the story.
  DELETE FROM story_segments WHERE story_id = p_story_id;
  DELETE FROM stories WHERE id = p_story_id;
END;
$$;
