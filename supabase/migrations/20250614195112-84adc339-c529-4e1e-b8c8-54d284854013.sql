
-- Set REPLICA IDENTITY for story_segments to ensure full data is sent in realtime update events.
-- This is necessary for the client to receive the updated image_url.
ALTER TABLE public.story_segments REPLICA IDENTITY FULL;

-- Add the story_segments table to the 'supabase_realtime' publication if it's not already there.
-- This enables the broadcasting of changes on this table.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'story_segments'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.story_segments;
  END IF;
END $$;

-- Drop the policy if it exists to ensure the script is re-runnable.
DROP POLICY IF EXISTS "Allow public reads on story_images" ON storage.objects;

-- Create a policy to allow anyone (anonymous and authenticated users) to view images
-- in the 'story_images' bucket. This is essential for the images to display in the browser.
CREATE POLICY "Allow public reads on story_images"
ON storage.objects FOR SELECT
TO anon, authenticated
USING ( bucket_id = 'story_images' );
