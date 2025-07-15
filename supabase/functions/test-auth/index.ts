import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    )

    // Test 1: Check if we can connect to the database
    console.log('Testing database connection...')
    
    // Test 2: Check if auth.users table exists and has data
    const { data: users, error: usersError } = await supabase
      .from('auth.users')
      .select('id, email, created_at')
      .limit(5)

    if (usersError) {
      console.error('Error querying auth.users:', usersError)
    } else {
      console.log('Found users:', users?.length || 0)
    }

    // Test 3: Check if the specific user exists
    const { data: specificUser, error: specificUserError } = await supabase
      .from('auth.users')
      .select('id, email, created_at, email_confirmed_at')
      .eq('email', 'jzineldin@gmail.com')
      .single()

    if (specificUserError) {
      console.error('Error finding specific user:', specificUserError)
    } else {
      console.log('Found specific user:', specificUser)
    }

    // Test 4: Check if user_roles table exists and has admin role
    const { data: userRoles, error: rolesError } = await supabase
      .from('user_roles')
      .select('*')
      .eq('role', 'admin')

    if (rolesError) {
      console.error('Error querying user_roles:', rolesError)
    } else {
      console.log('Found admin roles:', userRoles?.length || 0)
    }

    // Test 5: Check if profiles table exists
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1)

    if (profilesError) {
      console.error('Error querying profiles:', profilesError)
    } else {
      console.log('Profiles table accessible, found:', profiles?.length || 0, 'profiles')
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Auth test completed',
        database_connection: 'OK',
        users_found: users?.length || 0,
        specific_user: specificUser ? {
          id: specificUser.id,
          email: specificUser.email,
          email_confirmed: !!specificUser.email_confirmed_at
        } : null,
        admin_roles: userRoles?.length || 0,
        profiles_accessible: !profilesError
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Auth test failed:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
}) 