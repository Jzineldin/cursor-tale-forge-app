
-- Enable Row Level Security for the stories table
ALTER TABLE public.stories ENABLE ROW LEVEL SECURITY;

-- Allow all users to read public stories
CREATE POLICY "Allow public read access to stories"
ON public.stories FOR SELECT USING (is_public = true);

-- Allow users to read their own stories
CREATE POLICY "Allow individual read access to own stories"
ON public.stories FOR SELECT USING (auth.uid() = user_id);

-- Allow authenticated users to create stories for themselves
CREATE POLICY "Allow authenticated users to create stories"
ON public.stories FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own stories
CREATE POLICY "Allow users to update their own stories"
ON public.stories FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Allow users to delete their own stories
CREATE POLICY "Allow users to delete their own stories"
ON public.stories FOR DELETE USING (auth.uid() = user_id);

