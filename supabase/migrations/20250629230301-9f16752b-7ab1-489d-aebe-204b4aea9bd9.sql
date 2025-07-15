
-- Enable RLS on stories table if not already enabled
ALTER TABLE public.stories ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anonymous users to create stories
CREATE POLICY "Allow anonymous story creation" 
  ON public.stories 
  FOR INSERT 
  WITH CHECK (true);

-- Create policy to allow users to read their own stories and anonymous stories
CREATE POLICY "Allow users to read stories" 
  ON public.stories 
  FOR SELECT 
  USING (
    user_id IS NULL OR 
    user_id = auth.uid()
  );

-- Create policy to allow users to update their own stories
CREATE POLICY "Allow users to update their stories" 
  ON public.stories 
  FOR UPDATE 
  USING (
    user_id IS NULL OR 
    user_id = auth.uid()
  );

-- Enable RLS on story_segments table if not already enabled
ALTER TABLE public.story_segments ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anonymous users to create story segments
CREATE POLICY "Allow anonymous segment creation" 
  ON public.story_segments 
  FOR INSERT 
  WITH CHECK (true);

-- Create policy to allow users to read story segments
CREATE POLICY "Allow users to read segments" 
  ON public.story_segments 
  FOR SELECT 
  USING (true);

-- Create policy to allow users to update story segments
CREATE POLICY "Allow users to update segments" 
  ON public.story_segments 
  FOR UPDATE 
  USING (true);
