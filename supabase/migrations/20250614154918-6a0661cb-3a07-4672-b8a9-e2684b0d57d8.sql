
-- Drop existing policies on the story_images bucket to ensure a clean state.
-- It's okay if these fail; it just means the policies didn't exist before.
DROP POLICY IF EXISTS "Allow authenticated uploads to story_images" ON storage.objects;
DROP POLICY IF EXISTS "Allow public reads on story_images" ON storage.objects;
DROP POLICY IF EXISTS "Allow public uploads to story_images" ON storage.objects;

-- Create a policy to allow our edge function (which runs as an authenticated user) to upload images.
CREATE POLICY "Allow authenticated uploads to story_images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'story_images' );

-- Create a policy to allow anyone to view the images stored in the bucket.
-- This is required so the images can be displayed in the browser.
CREATE POLICY "Allow public reads on story_images"
ON storage.objects FOR SELECT
USING ( bucket_id = 'story_images' );
