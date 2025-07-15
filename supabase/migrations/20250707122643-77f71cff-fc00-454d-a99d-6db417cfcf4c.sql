-- Drop the old, complex RLS policies for anonymous users
DROP POLICY IF EXISTS "Allow anonymous story creation" ON public.stories;
DROP POLICY IF EXISTS "Allow anonymous story reading" ON public.stories;
DROP POLICY IF EXISTS "Allow anonymous segment creation" ON public.story_segments;
DROP POLICY IF EXISTS "Allow anonymous segment reading" ON public.story_segments;

-- Create a new, simpler policy for anonymous stories
CREATE POLICY "Allow anonymous read and write for anonymous stories"
ON public.stories
FOR ALL
USING (user_id IS NULL)
WITH CHECK (user_id IS NULL);

-- Create a new, simpler policy for anonymous story segments
CREATE POLICY "Allow anonymous read and write for anonymous story segments"
ON public.story_segments
FOR ALL
USING (EXISTS (SELECT 1 FROM public.stories WHERE stories.id = story_segments.story_id AND stories.user_id IS NULL))
WITH CHECK (EXISTS (SELECT 1 FROM public.stories WHERE stories.id = story_segments.story_id AND stories.user_id IS NULL));