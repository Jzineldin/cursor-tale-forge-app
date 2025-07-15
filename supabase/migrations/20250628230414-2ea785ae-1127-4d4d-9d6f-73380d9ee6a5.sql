
-- Create missing storage buckets for images and audio
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('story_images', 'story_images', true, 10485760, ARRAY['image/png', 'image/jpeg', 'image/webp']),
  ('full-story-audio', 'full-story-audio', true, 52428800, ARRAY['audio/mpeg', 'audio/wav'])
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies if they exist and recreate them
DROP POLICY IF EXISTS "Allow public reads on story_images" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated uploads to story_images" ON storage.objects;
DROP POLICY IF EXISTS "Allow public reads on full_story_audio" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated uploads to full_story_audio" ON storage.objects;

-- Create RLS policies for story_images bucket
CREATE POLICY "Allow public reads on story_images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'story_images');

CREATE POLICY "Allow authenticated uploads to story_images"
ON storage.objects FOR INSERT
TO authenticated, anon
WITH CHECK (bucket_id = 'story_images');

-- Create RLS policies for full-story-audio bucket
CREATE POLICY "Allow public reads on full_story_audio"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'full-story-audio');

CREATE POLICY "Allow authenticated uploads to full_story_audio"
ON storage.objects FOR INSERT
TO authenticated, anon
WITH CHECK (bucket_id = 'full-story-audio');

-- Populate admin_settings table with default AI provider configurations
INSERT INTO public.admin_settings (setting_key, setting_value) VALUES
('text_providers', '{
  "primary": "gemini",
  "fallback": "openai",
  "wordCount": {"min": 120, "max": 200},
  "geminiSettings": {
    "model": "gemini-1.5-flash-latest",
    "temperature": 0.7
  },
  "openaiSettings": {
    "model": "gpt-4o-mini",
    "temperature": 0.7
  }
}'::jsonb),
('image_providers', '{
  "primary": "openai",
  "fallback": "replicate",
  "huggingFaceSettings": {
    "model": "black-forest-labs/FLUX.1-schnell",
    "steps": 4,
    "guidance_scale": 0.0,
    "width": 1024,
    "height": 1024
  },
  "stableDiffusionSettings": {
    "steps": 20,
    "dimensions": "1024x1024"
  },
  "dalleSettings": {
    "model": "dall-e-3",
    "quality": "standard",
    "size": "1024x1024"
  },
  "replicateSettings": {
    "model": "flux-schnell",
    "steps": 4,
    "aspect_ratio": "1:1",
    "output_format": "webp"
  }
}'::jsonb),
('tts_providers', '{
  "primary": "openai",
  "voice": "fable",
  "speed": 1.0
}'::jsonb)
ON CONFLICT (setting_key) DO UPDATE SET
  setting_value = EXCLUDED.setting_value,
  updated_at = now();

-- Ensure realtime is properly configured for stories and story_segments tables
ALTER TABLE public.stories REPLICA IDENTITY FULL;
ALTER TABLE public.story_segments REPLICA IDENTITY FULL;

-- Add tables to realtime publication if not already added
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'stories'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.stories;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'story_segments'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.story_segments;
  END IF;
END $$;
