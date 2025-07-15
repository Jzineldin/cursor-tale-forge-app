
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const debugInfo = {
      openaiKey: Deno.env.get('OPENAI_API_KEY') ? 'Present ✅' : 'Missing ❌',
      googleKey: Deno.env.get('GOOGLE_API_KEY') ? 'Present ✅' : 'Missing ❌',
      supabaseUrl: Deno.env.get('SUPABASE_URL') ? 'Present ✅' : 'Missing ❌',
      supabaseKey: Deno.env.get('SUPABASE_ANON_KEY') ? 'Present ✅' : 'Missing ❌',
      timestamp: new Date().toISOString(),
      environment: 'Supabase Edge Function',
      status: 'Debug endpoint working'
    }

    console.log('Debug info requested:', debugInfo)

    return new Response(
      JSON.stringify(debugInfo, null, 2),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )
  } catch (error) {
    console.error('Debug endpoint error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
        status: 500 
      }
    )
  }
})
