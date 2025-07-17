-- Create Demo Account SQL Script
-- Run this in your Supabase Dashboard > SQL Editor

-- Step 0: Clean up duplicate entries and ensure proper constraints
DO $$
BEGIN
  -- Remove duplicate entries from user_roles table using ROW_NUMBER()
  DELETE FROM public.user_roles 
  WHERE id IN (
    SELECT id FROM (
      SELECT id, ROW_NUMBER() OVER (PARTITION BY user_id, role ORDER BY created_at) as rn
      FROM public.user_roles
    ) t WHERE t.rn > 1
  );
  
  -- Add unique constraint if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'user_roles_user_id_role_key'
  ) THEN
    ALTER TABLE public.user_roles 
    ADD CONSTRAINT user_roles_user_id_role_key 
    UNIQUE (user_id, role);
  END IF;
END $$;

-- Step 1: Create the demo user in auth.users (if it doesn't exist)
DO $$
BEGIN
  -- Check if user already exists
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'demo@tale-forge.app') THEN
    INSERT INTO auth.users (
      id,
      email,
      encrypted_password,
      email_confirmed_at,
      created_at,
      updated_at,
      raw_user_meta_data
    ) VALUES (
      gen_random_uuid(),
      'demo@tale-forge.app',
      crypt('ShippedS1', gen_salt('bf')),
      now(),
      now(),
      now(),
      '{"full_name": "Demo User"}'::jsonb
    );
  ELSE
    -- Update existing user to ensure email is confirmed
    UPDATE auth.users 
    SET 
      email_confirmed_at = now(),
      raw_user_meta_data = '{"full_name": "Demo User"}'::jsonb
    WHERE email = 'demo@tale-forge.app';
  END IF;
END $$;

-- Step 2: Create profile entry
DO $$
BEGIN
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
END $$;

-- Step 3: Add premium role (without ON CONFLICT for now)
DO $$
DECLARE
  demo_user_id UUID;
BEGIN
  -- Get the demo user ID
  SELECT id INTO demo_user_id FROM auth.users WHERE email = 'demo@tale-forge.app';
  
  IF demo_user_id IS NOT NULL THEN
    -- Delete existing premium role if it exists
    DELETE FROM public.user_roles 
    WHERE user_id = demo_user_id AND role = 'premium';
    
    -- Insert new premium role
    INSERT INTO public.user_roles (user_id, role)
    VALUES (demo_user_id, 'premium');
  END IF;
END $$;

-- Step 4: Create sample stories for demo account
DO $$
DECLARE
  demo_user_id UUID;
BEGIN
  -- Get the demo user ID
  SELECT id INTO demo_user_id FROM auth.users WHERE email = 'demo@tale-forge.app';
  
  IF demo_user_id IS NOT NULL THEN
    -- Create first sample story
    INSERT INTO public.stories (id, user_id, title, description, story_mode, is_completed, is_public, created_at, updated_at)
    VALUES (
      gen_random_uuid(),
      demo_user_id,
      'The Magical Forest Adventure',
      'A whimsical journey through an enchanted forest where every choice leads to new discoveries.',
      'Child-Adapted Story',
      true,
      true,
      now(),
      now()
    );
    
    -- Create second sample story
    INSERT INTO public.stories (id, user_id, title, description, story_mode, is_completed, is_public, created_at, updated_at)
    VALUES (
      gen_random_uuid(),
      demo_user_id,
      'Space Explorer: The Lost Planet',
      'An exciting space adventure where you discover a mysterious planet with ancient secrets.',
      'Sci-Fi Thriller',
      true,
      true,
      now(),
      now()
    );
  END IF;
END $$;

-- Step 5: Verify the demo account was created
SELECT 
  u.email,
  u.email_confirmed_at,
  p.full_name,
  ur.role,
  CASE WHEN u.email_confirmed_at IS NOT NULL THEN '✅ Email Confirmed' ELSE '❌ Email Not Confirmed' END as status
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
LEFT JOIN public.user_roles ur ON u.id = ur.user_id
WHERE u.email = 'demo@tale-forge.app'; 