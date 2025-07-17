-- Add premium role for demo account
-- This gives demo users access to voice features without admin panel access

-- First, let's add a 'premium' role to the user_roles table if it doesn't exist
-- (We'll need to update the CHECK constraint to include 'premium')

-- Update the CHECK constraint to include 'premium' role
ALTER TABLE public.user_roles DROP CONSTRAINT IF EXISTS user_roles_role_check;
ALTER TABLE public.user_roles ADD CONSTRAINT user_roles_role_check 
  CHECK (role IN ('admin', 'moderator', 'user', 'premium'));

-- Add premium role to demo account
INSERT INTO public.user_roles (user_id, role)
SELECT 
    u.id,
    'premium'
FROM auth.users u
WHERE u.email = 'demo@taleforge.app'
ON CONFLICT (user_id, role) DO NOTHING;

-- Also add premium role to any user with 'admin' in their email for development
-- (This gives them premium features without admin panel access)
INSERT INTO public.user_roles (user_id, role)
SELECT 
    u.id,
    'premium'
FROM auth.users u
WHERE u.email LIKE '%admin%' 
  AND u.id NOT IN (SELECT user_id FROM public.user_roles WHERE role = 'premium')
ON CONFLICT (user_id, role) DO NOTHING; 