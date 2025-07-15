
-- Create the story_images storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('story_images', 'story_images', true)
ON CONFLICT (id) DO NOTHING;

-- Create permissive RLS policies for the story_images bucket
CREATE POLICY "Anyone can view story images"
ON storage.objects FOR SELECT
USING (bucket_id = 'story_images');

CREATE POLICY "Anyone can upload story images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'story_images');

CREATE POLICY "Anyone can update story images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'story_images');

CREATE POLICY "Anyone can delete story images"
ON storage.objects FOR DELETE
USING (bucket_id = 'story_images');
