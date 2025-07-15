
-- Drop existing policies on story_images bucket to ensure a clean state.
-- It's okay if these fail; it just means the policies didn't exist.
DROP POLICY IF EXISTS "Allow authenticated uploads to story_images" ON storage.objects;
DROP POLICY IF EXISTS "Allow public reads on story_images" ON storage.objects;
DROP POLICY IF EXISTS "Allow public uploads to story_images" ON storage.objects;

-- Create a policy to allow the edge function (running as an authenticated user) to upload files.
CREATE POLICY "Allow authenticated uploads to story_images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'story_images' );

-- Create a policy to allow anyone to view the images.
CREATE POLICY "Allow public reads on story_images"
ON storage.objects FOR SELECT
USING ( bucket_id = 'story_images' );
