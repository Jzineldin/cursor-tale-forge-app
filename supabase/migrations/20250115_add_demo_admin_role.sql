-- Add admin role to demo account
-- This ensures the demo account has access to all features including voice generation

INSERT INTO public.user_roles (user_id, role)
SELECT 
    u.id,
    'admin'
FROM auth.users u
WHERE u.email = 'demo@taleforge.app'
ON CONFLICT (user_id, role) DO NOTHING;

-- Also add admin role to any user with 'admin' in their email for development
INSERT INTO public.user_roles (user_id, role)
SELECT 
    u.id,
    'admin'
FROM auth.users u
WHERE u.email LIKE '%admin%' 
  AND u.id NOT IN (SELECT user_id FROM public.user_roles WHERE role = 'admin')
ON CONFLICT (user_id, role) DO NOTHING; 