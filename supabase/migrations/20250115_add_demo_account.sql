-- Add demo account with premium role for voice features
-- This migration creates the demo account and assigns it the premium role

-- First, create the demo user in auth.users (if it doesn't exist)
-- Note: This will be handled by Supabase Auth when the user first signs up
-- We just need to ensure the user_roles table has the correct role

-- Insert premium role for demo account (will be created when user first signs in)
INSERT INTO public.user_roles (user_id, role)
SELECT 
    u.id,
    'premium'
FROM auth.users u
WHERE u.email = 'demo@tale-forge.app'
ON CONFLICT (user_id, role) DO NOTHING;

-- Also ensure the demo account has a profile entry
INSERT INTO public.profiles (id, email, full_name)
SELECT 
    u.id,
    u.email,
    'Demo User'
FROM auth.users u
WHERE u.email = 'demo@tale-forge.app'
ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    updated_at = now();

-- Add some sample stories for the demo account to showcase functionality
INSERT INTO public.stories (id, user_id, title, description, story_mode, is_completed, is_public, created_at, updated_at)
SELECT 
    gen_random_uuid(),
    u.id,
    'The Magical Forest Adventure',
    'A whimsical journey through an enchanted forest where every choice leads to new discoveries.',
    'Child-Adapted Story',
    true,
    true,
    now(),
    now()
FROM auth.users u
WHERE u.email = 'demo@tale-forge.app'
ON CONFLICT DO NOTHING;

INSERT INTO public.stories (id, user_id, title, description, story_mode, is_completed, is_public, created_at, updated_at)
SELECT 
    gen_random_uuid(),
    u.id,
    'Space Explorer: The Lost Planet',
    'An exciting space adventure where you discover a mysterious planet with ancient secrets.',
    'Sci-Fi Thriller',
    true,
    true,
    now(),
    now()
FROM auth.users u
WHERE u.email = 'demo@tale-forge.app'
ON CONFLICT DO NOTHING; 