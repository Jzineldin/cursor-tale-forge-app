
-- Enable Row Level Security for the story_segments table
ALTER TABLE public.story_segments ENABLE ROW LEVEL SECURITY;

-- Allow all users to read segments of public stories
CREATE POLICY "Allow public read access to story segments"
ON public.story_segments FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.stories
    WHERE stories.id = story_segments.story_id AND stories.is_public = true
  )
);

-- Allow users to read segments of their own stories
CREATE POLICY "Allow individual read access to own story segments"
ON public.story_segments FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.stories
    WHERE stories.id = story_segments.story_id AND stories.user_id = auth.uid()
  )
);

