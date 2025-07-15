
-- Drop the old, potentially incorrect policy to ensure a clean state.
-- It's okay if this fails; it just means the policy didn't exist.
DROP POLICY IF EXISTS "Public read access for story audio" ON storage.objects;

-- Create the new, correct policy that explicitly allows public read access.
CREATE POLICY "Allow public read access to story audio"
ON storage.objects FOR SELECT
TO anon, authenticated
USING ( bucket_id = 'story-audio' );
