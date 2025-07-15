-- Create core tables for TaleForge story generation app

-- Stories table - main story records
CREATE TABLE public.stories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  story_mode TEXT NOT NULL DEFAULT 'fantasy',
  is_public BOOLEAN NOT NULL DEFAULT FALSE,
  is_completed BOOLEAN NOT NULL DEFAULT FALSE,
  segment_count INTEGER NOT NULL DEFAULT 0,
  thumbnail_url TEXT,
  visual_context JSONB,
  narrative_context JSONB,
  published_at TIMESTAMPTZ,
  full_story_audio_url TEXT,
  audio_generation_status TEXT NOT NULL DEFAULT 'not_started',
  shotstack_render_id TEXT,
  shotstack_video_url TEXT,
  shotstack_status TEXT NOT NULL DEFAULT 'not_started',
  animated_video_status TEXT NOT NULL DEFAULT 'not_started',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Story segments table - individual story parts
CREATE TABLE public.story_segments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID NOT NULL REFERENCES public.stories(id) ON DELETE CASCADE,
  parent_segment_id UUID REFERENCES public.story_segments(id) ON DELETE SET NULL,
  triggering_choice_text TEXT,
  segment_text TEXT NOT NULL,
  image_url TEXT,
  audio_url TEXT,
  choices TEXT[] NOT NULL DEFAULT '{}',
  is_end BOOLEAN NOT NULL DEFAULT FALSE,
  image_generation_status TEXT NOT NULL DEFAULT 'not_started',
  audio_generation_status TEXT NOT NULL DEFAULT 'not_started',
  audio_duration REAL,
  animated_video_url TEXT,
  animated_video_status TEXT NOT NULL DEFAULT 'not_started',
  word_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Admin settings table for configuration
CREATE TABLE public.admin_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Waitlist entries table
CREATE TABLE public.waitlist_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  marketing_consent BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- User profiles table (optional for enhanced user data)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX idx_stories_user_id ON public.stories (user_id);
CREATE INDEX idx_stories_is_public ON public.stories (is_public);
CREATE INDEX idx_stories_created_at ON public.stories (created_at DESC);
CREATE INDEX idx_story_segments_story_id ON public.story_segments (story_id);
CREATE INDEX idx_story_segments_parent_id ON public.story_segments (parent_segment_id);
CREATE INDEX idx_story_segments_created_at ON public.story_segments (created_at);
CREATE INDEX idx_waitlist_email ON public.waitlist_entries (email);

-- Enable Row Level Security
ALTER TABLE public.stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.story_segments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.waitlist_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for stories
CREATE POLICY "Allow public read access to stories"
ON public.stories FOR SELECT USING (is_public = true);

CREATE POLICY "Allow individual read access to own stories"
ON public.stories FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Allow anonymous story creation"
ON public.stories FOR INSERT WITH CHECK (user_id IS NULL);

CREATE POLICY "Allow anonymous story reading"
ON public.stories FOR SELECT USING (user_id IS NULL);

CREATE POLICY "Allow authenticated users to create stories"
ON public.stories FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow users to update their own stories"
ON public.stories FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow users to delete their own stories"
ON public.stories FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for story segments
CREATE POLICY "Allow public read access to story segments"
ON public.story_segments FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.stories
    WHERE stories.id = story_segments.story_id AND stories.is_public = true
  )
);

CREATE POLICY "Allow individual read access to own story segments"
ON public.story_segments FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.stories
    WHERE stories.id = story_segments.story_id AND stories.user_id = auth.uid()
  )
);

CREATE POLICY "Allow anonymous segment creation"
ON public.story_segments FOR INSERT WITH CHECK (
    (SELECT user_id FROM public.stories WHERE id = story_id) IS NULL
);

CREATE POLICY "Allow anonymous segment reading"
ON public.story_segments FOR SELECT USING (
    (SELECT user_id FROM public.stories WHERE id = story_id) IS NULL
);

CREATE POLICY "Allow users to insert segments for their own stories"
ON public.story_segments FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.stories
    WHERE stories.id = story_segments.story_id AND stories.user_id = auth.uid()
  )
);

-- RLS Policies for profiles
CREATE POLICY "Profiles are viewable by everyone" 
ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for waitlist (public access for signups)
CREATE POLICY "Allow public waitlist signup"
ON public.waitlist_entries FOR INSERT WITH CHECK (true);

-- RLS Policies for admin settings (admin only - will be enhanced later)
CREATE POLICY "Allow authenticated read access to admin settings"
ON public.admin_settings FOR SELECT TO authenticated USING (true);

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('story_images', 'story_images', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('story-audio', 'story-audio', true, 52428800, ARRAY['audio/mpeg', 'audio/wav']),
  ('full-story-audio', 'full-story-audio', true, 104857600, ARRAY['audio/mpeg', 'audio/wav'])
ON CONFLICT (id) DO NOTHING;

-- Storage policies for images
CREATE POLICY "Allow public read access to story images"
ON storage.objects FOR SELECT TO anon, authenticated
USING (bucket_id = 'story_images');

CREATE POLICY "Allow authenticated and anonymous uploads to story_images"
ON storage.objects FOR INSERT TO anon, authenticated
WITH CHECK (bucket_id = 'story_images');

-- Storage policies for audio
CREATE POLICY "Allow public read access to story audio"
ON storage.objects FOR SELECT TO anon, authenticated
USING (bucket_id = 'story-audio');

CREATE POLICY "Allow authenticated uploads to story audio"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'story-audio');

-- Storage policies for full story audio
CREATE POLICY "Allow public reads on full_story_audio"
ON storage.objects FOR SELECT TO anon, authenticated
USING (bucket_id = 'full-story-audio');

CREATE POLICY "Allow authenticated uploads to full story audio"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'full-story-audio');

-- Create function to update story metadata when segments are added
CREATE OR REPLACE FUNCTION public.update_story_metadata()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  -- On INSERT, increment segment count and set thumbnail if it's the first segment
  IF (TG_OP = 'INSERT') THEN
    UPDATE public.stories
    SET segment_count = segment_count + 1
    WHERE id = NEW.story_id;

    IF NEW.parent_segment_id IS NULL THEN
      UPDATE public.stories
      SET thumbnail_url = NEW.image_url
      WHERE id = NEW.story_id;
    END IF;
  END IF;

  -- On both INSERT and UPDATE, if a segment is marked as the end,
  -- update the parent story to be completed
  IF NEW.is_end = true THEN
    UPDATE public.stories
    SET is_completed = true
    WHERE id = NEW.story_id;
  END IF;

  RETURN NEW;
END;
$$;

-- Create triggers for automatic metadata updates
CREATE TRIGGER on_story_segment_insert
  AFTER INSERT ON public.story_segments
  FOR EACH ROW
  EXECUTE PROCEDURE public.update_story_metadata();

CREATE TRIGGER on_story_segment_update
  AFTER UPDATE ON public.story_segments
  FOR EACH ROW
  WHEN (OLD.is_end IS DISTINCT FROM NEW.is_end)
  EXECUTE PROCEDURE public.update_story_metadata();

-- Create function to mark a story segment as the end
CREATE OR REPLACE FUNCTION public.end_story_at_segment(p_segment_id uuid)
RETURNS SETOF story_segments
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
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

  -- Update the segment to be the end, and clear choices
  RETURN QUERY
  UPDATE public.story_segments
  SET is_end = true, choices = '{}'::text[]
  WHERE id = p_segment_id
  RETURNING *;
END;
$$;

-- Create function to delete story and all segments
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

  -- Ensure the story exists
  IF NOT FOUND THEN
    RAISE WARNING 'Story not found: %', p_story_id;
    RETURN;
  END IF;
  
  -- If story has an owner, user must be that owner.
  -- If story is anonymous (user_id is NULL), anyone can delete it
  IF v_user_id IS NOT NULL AND v_user_id != current_user_id THEN
    RAISE EXCEPTION 'You do not have permission to delete this story.';
  END IF;

  -- Delete the segments and the story
  DELETE FROM story_segments WHERE story_id = p_story_id;
  DELETE FROM stories WHERE id = p_story_id;
END;
$$;

-- Enable realtime for stories and story_segments
ALTER TABLE public.stories REPLICA IDENTITY FULL;
ALTER TABLE public.story_segments REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.stories;
ALTER PUBLICATION supabase_realtime ADD TABLE public.story_segments;