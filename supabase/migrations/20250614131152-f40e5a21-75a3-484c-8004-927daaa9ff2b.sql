
-- Create a public storage bucket for story images
insert into storage.buckets
  (id, name, public)
values
  ('story_images', 'story_images', true);

-- Create a policy to allow anyone to upload files to the story_images bucket.
-- This will be used by our edge function to save the generated images.
CREATE POLICY "Allow public uploads to story_images"
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'story_images' );
