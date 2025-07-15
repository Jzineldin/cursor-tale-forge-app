
-- Only create storage buckets if they don't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT FROM storage.buckets WHERE id = 'story-images') THEN
        INSERT INTO storage.buckets (id, name, public) VALUES ('story-images', 'story-images', true);
    END IF;
    
    IF NOT EXISTS (SELECT FROM storage.buckets WHERE id = 'story-audio') THEN
        INSERT INTO storage.buckets (id, name, public) VALUES ('story-audio', 'story-audio', true);
    END IF;
    
    IF NOT EXISTS (SELECT FROM storage.buckets WHERE id = 'user-avatars') THEN
        INSERT INTO storage.buckets (id, name, public) VALUES ('user-avatars', 'user-avatars', true);
    END IF;
END $$;

-- Add storage policies only if they don't exist
DO $$ 
BEGIN
    -- Story images policies
    IF NOT EXISTS (
        SELECT FROM pg_policies 
        WHERE schemaname = 'storage' AND tablename = 'objects' 
        AND policyname = 'Users can upload story images'
    ) THEN
        CREATE POLICY "Users can upload story images" ON storage.objects
          FOR INSERT WITH CHECK (bucket_id = 'story-images');
    END IF;
    
    IF NOT EXISTS (
        SELECT FROM pg_policies 
        WHERE schemaname = 'storage' AND tablename = 'objects' 
        AND policyname = 'Anyone can view story images'
    ) THEN
        CREATE POLICY "Anyone can view story images" ON storage.objects
          FOR SELECT USING (bucket_id = 'story-images');
    END IF;
    
    -- Story audio policies
    IF NOT EXISTS (
        SELECT FROM pg_policies 
        WHERE schemaname = 'storage' AND tablename = 'objects' 
        AND policyname = 'Users can upload story audio'
    ) THEN
        CREATE POLICY "Users can upload story audio" ON storage.objects
          FOR INSERT WITH CHECK (bucket_id = 'story-audio');
    END IF;
    
    IF NOT EXISTS (
        SELECT FROM pg_policies 
        WHERE schemaname = 'storage' AND tablename = 'objects' 
        AND policyname = 'Anyone can view story audio'
    ) THEN
        CREATE POLICY "Anyone can view story audio" ON storage.objects
          FOR SELECT USING (bucket_id = 'story-audio');
    END IF;
    
    -- User avatars policies
    IF NOT EXISTS (
        SELECT FROM pg_policies 
        WHERE schemaname = 'storage' AND tablename = 'objects' 
        AND policyname = 'Users can upload avatars'
    ) THEN
        CREATE POLICY "Users can upload avatars" ON storage.objects
          FOR INSERT WITH CHECK (bucket_id = 'user-avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
    END IF;
    
    IF NOT EXISTS (
        SELECT FROM pg_policies 
        WHERE schemaname = 'storage' AND tablename = 'objects' 
        AND policyname = 'Anyone can view avatars'
    ) THEN
        CREATE POLICY "Anyone can view avatars" ON storage.objects
          FOR SELECT USING (bucket_id = 'user-avatars');
    END IF;
END $$;
