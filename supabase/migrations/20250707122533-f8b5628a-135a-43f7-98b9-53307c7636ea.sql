-- Create policy for public read access to story images
CREATE POLICY "Allow public read access to story images"
ON storage.objects FOR SELECT
TO anon, authenticated
USING (bucket_id = 'story_images');

-- Also ensure the bucket allows public access to the files
UPDATE storage.buckets 
SET public = true 
WHERE id = 'story_images';