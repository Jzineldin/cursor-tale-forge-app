import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const DEMO_LIMITS = {
  voice: 3,
  story: 10,
  image: 5
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Get user from request
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser()
    
    if (userError) {
      return new Response(
        JSON.stringify({ error: 'Authentication failed' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Only check limits for demo account
    if (user?.email !== 'demo@tale-forge.app') {
      return new Response(
        JSON.stringify({ allowed: true, isDemo: false }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get client IP from various headers
    const ip = req.headers.get('x-forwarded-for') || 
               req.headers.get('x-real-ip') || 
               req.headers.get('cf-connecting-ip') ||
               '127.0.0.1'

    const clientIP = ip.split(',')[0].trim()
    const today = new Date().toISOString().split('T')[0]

    const url = new URL(req.url)
    const action = url.searchParams.get('action')
    const featureType = url.searchParams.get('feature') as 'voice' | 'story' | 'image' || 'voice'

    if (action === 'check') {
      // Check current usage for this IP + feature + date
      const { data: usage, error } = await supabaseClient
        .from('demo_usage')
        .select('usage_count')
        .eq('ip_address', clientIP)
        .eq('feature_type', featureType)
        .eq('date_created', today)
        .single()

      const currentUsage = usage?.usage_count || 0
      const limit = DEMO_LIMITS[featureType] || 3

      if (currentUsage >= limit) {
        return new Response(
          JSON.stringify({
            allowed: false,
            isDemo: true,
            currentUsage,
            limit,
            message: `Demo ${featureType} limit reached (${limit}/day per IP). Sign up for unlimited access!`
          }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      return new Response(
        JSON.stringify({
          allowed: true,
          isDemo: true,
          currentUsage,
          limit
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )

    } else if (action === 'increment') {
      // Upsert usage record
      const { error: upsertError } = await supabaseClient
        .from('demo_usage')
        .upsert({
          ip_address: clientIP,
          feature_type: featureType,
          date_created: today,
          usage_count: 1,
          last_used: new Date().toISOString()
        }, {
          onConflict: 'ip_address,feature_type,date_created',
          ignoreDuplicates: false
        })

      if (upsertError) {
        console.error('Demo usage upsert error:', upsertError)
        return new Response(
          JSON.stringify({ error: 'Failed to track usage' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // If record exists, increment it
      const { error: incrementError } = await supabaseClient.rpc('increment_demo_usage', {
        p_ip_address: clientIP,
        p_feature_type: featureType,
        p_date: today
      })

      if (incrementError) {
        console.error('Demo usage increment error:', incrementError)
      }

      return new Response(
        JSON.stringify({ success: true }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )

    } else if (action === 'usage') {
      // Get current usage for all features
      const { data: usage, error } = await supabaseClient.rpc('get_demo_usage', {
        p_ip_address: clientIP,
        p_date: today
      })

      if (error) {
        console.error('Failed to get demo usage:', error)
        return new Response(
          JSON.stringify({ error: 'Failed to get usage' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      const usageMap = {
        voice: 0,
        story: 0,
        image: 0
      }

      usage?.forEach((item: any) => {
        usageMap[item.feature_type as keyof typeof usageMap] = item.usage_count
      })

      return new Response(
        JSON.stringify({
          voice: usageMap.voice,
          story: usageMap.story,
          image: usageMap.image,
          limits: DEMO_LIMITS
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )

    } else {
      return new Response(
        JSON.stringify({ error: 'Invalid action' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

  } catch (error) {
    console.error('Demo protection error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
}) 