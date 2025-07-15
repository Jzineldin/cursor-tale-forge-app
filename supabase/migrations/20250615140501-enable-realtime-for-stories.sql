
-- Enable Realtime for the 'stories' table to allow live updates on story status.
-- This is necessary for the UI to react to changes like video generation progress.

-- Set REPLICA IDENTITY for stories to ensure full row data is available in update events.
ALTER TABLE public.stories REPLICA IDENTITY FULL;

-- Add the 'stories' table to the 'supabase_realtime' publication to broadcast changes.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'stories'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.stories;
  END IF;
END $$;
