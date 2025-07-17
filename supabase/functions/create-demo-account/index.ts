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

    console.log('Creating demo account...')

    // Demo account credentials
    const demoEmail = 'demo@tale-forge.app'
    const demoPassword = 'ShippedS1'
    const demoName = 'Demo User'

    // Check if demo account already exists
    const { data: existingUser, error: checkError } = await supabase.auth.admin.getUserByEmail(demoEmail)
    
    if (checkError && checkError.message !== 'User not found') {
      console.error('Error checking existing user:', checkError)
      return new Response(JSON.stringify({ error: 'Failed to check existing user' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      })
    }

    let userId: string

    if (existingUser.user) {
      console.log('Demo account already exists, updating...')
      userId = existingUser.user.id
      
      // Update the user to ensure email is confirmed
      const { error: updateError } = await supabase.auth.admin.updateUserById(userId, {
        email_confirm: true,
        user_metadata: { full_name: demoName }
      })
      
      if (updateError) {
        console.error('Error updating demo user:', updateError)
        return new Response(JSON.stringify({ error: 'Failed to update demo user' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        })
      }
    } else {
      console.log('Creating new demo account...')
      
      // Create the demo user
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email: demoEmail,
        password: demoPassword,
        email_confirm: true, // This bypasses email confirmation
        user_metadata: { full_name: demoName }
      })
      
      if (createError) {
        console.error('Error creating demo user:', createError)
        return new Response(JSON.stringify({ error: 'Failed to create demo user' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        })
      }
      
      userId = newUser.user.id
    }

    // Create profile entry
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: userId,
        email: demoEmail,
        full_name: demoName
      }, { onConflict: 'id' })

    if (profileError) {
      console.error('Error creating profile:', profileError)
    }

    // Add premium role
    const { error: roleError } = await supabase
      .from('user_roles')
      .upsert({
        user_id: userId,
        role: 'premium'
      }, { onConflict: 'user_id,role' })

    if (roleError) {
      console.error('Error adding premium role:', roleError)
    }

    // Create sample stories for demo account
    const sampleStories = [
      {
        title: 'The Magical Forest Adventure',
        description: 'A whimsical journey through an enchanted forest where every choice leads to new discoveries.',
        story_mode: 'Child-Adapted Story',
        is_completed: true,
        is_public: true
      },
      {
        title: 'Space Explorer: The Lost Planet',
        description: 'An exciting space adventure where you discover a mysterious planet with ancient secrets.',
        story_mode: 'Sci-Fi Thriller',
        is_completed: true,
        is_public: true
      }
    ]

    for (const story of sampleStories) {
      const { error: storyError } = await supabase
        .from('stories')
        .insert({
          user_id: userId,
          ...story
        })
      
      if (storyError && storyError.code !== '23505') { // Ignore duplicate errors
        console.error('Error creating sample story:', storyError)
      }
    }

    console.log('Demo account setup completed successfully')

    return new Response(JSON.stringify({ 
      success: true,
      message: 'Demo account created successfully',
      credentials: {
        email: demoEmail,
        password: demoPassword
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
}) 