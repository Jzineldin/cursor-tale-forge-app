
-- This policy allows anyone to view images in the "story_images" bucket.
-- It is essential for the images to show up in your application after they are generated.
CREATE POLICY "Allow public read access to story images"
ON storage.objects FOR SELECT
TO public
USING ( bucket_id = 'story_images' );
