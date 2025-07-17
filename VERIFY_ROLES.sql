-- Verify User Roles Script
-- Run this in your Supabase Dashboard > SQL Editor

-- Check both accounts and their roles
SELECT 
  u.email,
  u.email_confirmed_at,
  p.full_name,
  ur.role,
  CASE 
    WHEN u.email_confirmed_at IS NOT NULL THEN '✅ Email Confirmed'
    ELSE '❌ Email Not Confirmed'
  END as email_status,
  CASE 
    WHEN ur.role IS NOT NULL THEN '✅ Role Assigned'
    ELSE '❌ No Role'
  END as role_status
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
LEFT JOIN public.user_roles ur ON u.id = ur.user_id
WHERE u.email IN ('jzineldin@gmail.com', 'demo@tale-forge.app')
ORDER BY u.email;

-- Check all roles in the system
SELECT 
  'All Roles Summary' as info,
  COUNT(*) as total_users_with_roles,
  COUNT(CASE WHEN role = 'admin' THEN 1 END) as admin_users,
  COUNT(CASE WHEN role = 'premium' THEN 1 END) as premium_users,
  COUNT(CASE WHEN role = 'user' THEN 1 END) as regular_users
FROM public.user_roles;

-- Check specific accounts in detail
SELECT 
  'Account Details' as info,
  u.email,
  u.id as user_id,
  ur.role,
  ur.created_at as role_created_at
FROM auth.users u
LEFT JOIN public.user_roles ur ON u.id = ur.user_id
WHERE u.email IN ('jzineldin@gmail.com', 'demo@tale-forge.app')
ORDER BY u.email; 