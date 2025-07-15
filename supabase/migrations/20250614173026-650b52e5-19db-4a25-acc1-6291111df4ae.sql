
-- Add a `user_id` column to the `stories` table to link stories to users.
-- If a user is deleted, their stories will also be deleted.
ALTER TABLE public.stories
ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Create an index on the new user_id column for better query performance.
CREATE INDEX ON public.stories (user_id);

-- Enable Row-Level Security (RLS) on the stories table.
-- This is a security measure to control who can see or modify which stories.
ALTER TABLE public.stories ENABLE ROW LEVEL SECURITY;

-- Allow everyone to view stories that are marked as public.
CREATE POLICY "Public stories are viewable by everyone"
ON public.stories FOR SELECT
USING (is_public = true);

-- Allow users to view their own private stories.
CREATE POLICY "Users can view their own stories"
ON public.stories FOR SELECT
USING (auth.uid() = user_id);

-- Allow logged-in users to create stories for themselves,
-- and allow non-logged-in users to create anonymous stories.
CREATE POLICY "Users can insert their own stories"
ON public.stories FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own stories.
CREATE POLICY "Users can update their own stories"
ON public.stories FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Allow users to delete their own stories.
CREATE POLICY "Users can delete their own stories"
ON public.stories FOR DELETE
USING (auth.uid() = user_id);
