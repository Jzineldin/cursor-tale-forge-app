
-- Only create profiles table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'profiles') THEN
        CREATE TABLE public.profiles (
          id UUID REFERENCES auth.users(id) PRIMARY KEY,
          email TEXT UNIQUE NOT NULL,
          full_name TEXT,
          username TEXT UNIQUE,
          avatar_url TEXT,
          bio TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY "Users can view own profile" ON public.profiles
          FOR SELECT USING (auth.uid() = id);
        CREATE POLICY "Users can update own profile" ON public.profiles
          FOR UPDATE USING (auth.uid() = id);
        CREATE POLICY "Users can insert own profile" ON public.profiles
          FOR INSERT WITH CHECK (auth.uid() = id);
    END IF;
END $$;

-- Only create story_likes table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'story_likes') THEN
        CREATE TABLE public.story_likes (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          story_id UUID REFERENCES public.stories(id) ON DELETE CASCADE,
          user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          UNIQUE(story_id, user_id)
        );
        
        ALTER TABLE public.story_likes ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY "Users can view all likes" ON public.story_likes
          FOR SELECT USING (true);
        CREATE POLICY "Users can like stories" ON public.story_likes
          FOR INSERT WITH CHECK (auth.uid() = user_id);
        CREATE POLICY "Users can unlike stories" ON public.story_likes
          FOR DELETE USING (auth.uid() = user_id);
    END IF;
END $$;

-- Only create story_comments table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'story_comments') THEN
        CREATE TABLE public.story_comments (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          story_id UUID REFERENCES public.stories(id) ON DELETE CASCADE,
          user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
          content TEXT NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        ALTER TABLE public.story_comments ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY "Users can view comments on public stories" ON public.story_comments
          FOR SELECT USING (
            EXISTS (
              SELECT 1 FROM public.stories 
              WHERE stories.id = story_comments.story_id 
              AND stories.is_public = true
            )
          );
        CREATE POLICY "Users can insert comments" ON public.story_comments
          FOR INSERT WITH CHECK (auth.uid() = user_id);
        CREATE POLICY "Users can update own comments" ON public.story_comments
          FOR UPDATE USING (auth.uid() = user_id);
        CREATE POLICY "Users can delete own comments" ON public.story_comments
          FOR DELETE USING (auth.uid() = user_id);
    END IF;
END $$;

-- Add RLS policies to existing stories table if they don't exist
DO $$
BEGIN
    -- Check if RLS is enabled on stories table, if not enable it
    IF NOT EXISTS (
        SELECT 1 FROM pg_class c
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE n.nspname = 'public' AND c.relname = 'stories' AND c.relrowsecurity = true
    ) THEN
        ALTER TABLE public.stories ENABLE ROW LEVEL SECURITY;
    END IF;

    -- Add policies only if they don't exist
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'stories' AND policyname = 'Users can view own stories') THEN
        CREATE POLICY "Users can view own stories" ON public.stories
          FOR SELECT USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'stories' AND policyname = 'Users can view public stories') THEN
        CREATE POLICY "Users can view public stories" ON public.stories
          FOR SELECT USING (is_public = true);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'stories' AND policyname = 'Users can insert own stories') THEN
        CREATE POLICY "Users can insert own stories" ON public.stories
          FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'stories' AND policyname = 'Users can update own stories') THEN
        CREATE POLICY "Users can update own stories" ON public.stories
          FOR UPDATE USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'stories' AND policyname = 'Users can delete own stories') THEN
        CREATE POLICY "Users can delete own stories" ON public.stories
          FOR DELETE USING (auth.uid() = user_id);
    END IF;
END $$;

-- Add RLS policies to existing story_segments table if they don't exist
DO $$
BEGIN
    -- Check if RLS is enabled on story_segments table, if not enable it
    IF NOT EXISTS (
        SELECT 1 FROM pg_class c
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE n.nspname = 'public' AND c.relname = 'story_segments' AND c.relrowsecurity = true
    ) THEN
        ALTER TABLE public.story_segments ENABLE ROW LEVEL SECURITY;
    END IF;

    -- Add policies only if they don't exist
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'story_segments' AND policyname = 'Users can view segments of their stories') THEN
        CREATE POLICY "Users can view segments of their stories" ON public.story_segments
          FOR SELECT USING (
            EXISTS (
              SELECT 1 FROM public.stories 
              WHERE stories.id = story_segments.story_id 
              AND stories.user_id = auth.uid()
            )
          );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'story_segments' AND policyname = 'Users can view segments of public stories') THEN
        CREATE POLICY "Users can view segments of public stories" ON public.story_segments
          FOR SELECT USING (
            EXISTS (
              SELECT 1 FROM public.stories 
              WHERE stories.id = story_segments.story_id 
              AND stories.is_public = true
            )
          );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'story_segments' AND policyname = 'Users can insert segments for their stories') THEN
        CREATE POLICY "Users can insert segments for their stories" ON public.story_segments
          FOR INSERT WITH CHECK (
            EXISTS (
              SELECT 1 FROM public.stories 
              WHERE stories.id = story_segments.story_id 
              AND stories.user_id = auth.uid()
            )
          );
    END IF;
END $$;
