
-- Add a policy to allow authenticated users to insert segments into their own stories.
CREATE POLICY "Allow users to insert segments for their own stories"
ON public.story_segments FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.stories
    WHERE stories.id = story_segments.story_id AND stories.user_id = auth.uid()
  )
);
