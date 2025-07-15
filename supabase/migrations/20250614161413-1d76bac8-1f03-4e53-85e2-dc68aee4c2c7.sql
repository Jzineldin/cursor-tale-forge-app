
-- Drop the old policy that only allowed authenticated users.
DROP POLICY IF EXISTS "Allow authenticated uploads to story_images" ON storage.objects;

-- Drop the new policy if it somehow exists from a previous attempt, to ensure a clean state.
DROP POLICY IF EXISTS "Allow authenticated and anonymous uploads to story_images" ON storage.objects;

-- Create a new policy that allows both anonymous and authenticated users to upload.
-- This is necessary for the edge function to successfully upload images when
-- triggered by users who are not logged in.
CREATE POLICY "Allow authenticated and anonymous uploads to story_images"
ON storage.objects FOR INSERT
TO anon, authenticated
WITH CHECK ( bucket_id = 'story_images' );
