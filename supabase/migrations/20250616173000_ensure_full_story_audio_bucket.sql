
-- Ensure the full-story-audio bucket exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('full-story-audio', 'full-story-audio', true)
ON CONFLICT (id) DO NOTHING;

-- Ensure the policy exists for public reads
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'storage' 
        AND tablename = 'objects' 
        AND policyname = 'Allow public reads on full_story_audio'
    ) THEN
        CREATE POLICY "Allow public reads on full_story_audio"
        ON storage.objects FOR SELECT
        TO anon, authenticated
        USING ( bucket_id = 'full-story-audio' );
    END IF;
END $$;
