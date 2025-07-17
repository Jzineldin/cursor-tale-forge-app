import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { corsHeaders } from '../_shared/cors.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  console.log('🎵 Edge function called:', {
    method: req.method,
    url: req.url,
    headers: Object.fromEntries(req.headers.entries())
  })

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('🎵 Handling CORS preflight request')
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      console.error('❌ No authorization header provided')
      return new Response(
        JSON.stringify({ 
          error: 'Authentication required',
          details: 'Please log in to access voice features'
        }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Extract token from Bearer header
    const token = authHeader.replace('Bearer ', '')
    if (!token) {
      console.error('❌ No token provided in authorization header')
      return new Response(
        JSON.stringify({ 
          error: 'Invalid authorization token',
          details: 'Please log in to access voice features'
        }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Create Supabase client with the token
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('❌ Missing Supabase environment variables')
      return new Response(
        JSON.stringify({ 
          error: 'Server configuration error',
          details: 'Please contact support'
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Verify the user token
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      console.error('❌ Authentication failed:', authError)
      return new Response(
        JSON.stringify({ 
          error: 'Authentication failed',
          details: 'Please log in to access voice features'
        }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('✅ User authenticated:', user.id)

    // Get ElevenLabs API key from environment
    const elevenlabsApiKey = Deno.env.get('ELEVENLABS_API_KEY')
    
    console.log('🎵 Environment check:')
    console.log('- ELEVENLABS_API_KEY exists:', !!elevenlabsApiKey)
    console.log('- API key starts with:', elevenlabsApiKey?.substring(0, 10) + '...')
    console.log('- API key length:', elevenlabsApiKey?.length)
    
    if (!elevenlabsApiKey) {
      console.error('❌ ELEVENLABS_API_KEY not found in environment')
      return new Response(
        JSON.stringify({ 
          error: 'ElevenLabs API key not configured',
          details: 'Please check your Supabase Edge Function secrets'
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('🎵 Fetching voices from ElevenLabs API...')

    // Fetch voices from ElevenLabs API
    const response = await fetch('https://api.elevenlabs.io/v1/voices', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'xi-api-key': elevenlabsApiKey,
      },
    })

    console.log('🎵 ElevenLabs API response:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
      headers: Object.fromEntries(response.headers.entries())
    })

    if (!response.ok) {
      console.error('❌ ElevenLabs API error:', response.status, response.statusText)
      const errorText = await response.text()
      console.error('❌ Error details:', errorText)
      
      let errorMessage = 'Failed to fetch voices from ElevenLabs'
      let statusCode = response.status
      
      if (response.status === 401) {
        errorMessage = 'ElevenLabs API key is invalid or expired'
      } else if (response.status === 429) {
        errorMessage = 'ElevenLabs API rate limit exceeded'
      } else if (response.status === 403) {
        errorMessage = 'ElevenLabs API access forbidden - check account status'
      }
      
      return new Response(
        JSON.stringify({ 
          error: errorMessage,
          status: response.status,
          details: errorText,
          timestamp: new Date().toISOString()
        }),
        { 
          status: statusCode, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const voicesData = await response.json()
    console.log('🎵 Successfully fetched voices:', {
      totalVoices: voicesData.voices?.length || 0,
      hasVoices: !!voicesData.voices,
      voicesArray: Array.isArray(voicesData.voices)
    })

    // Also fetch user info to understand account type
    console.log('🎵 Fetching user info...')
    const userResponse = await fetch('https://api.elevenlabs.io/v1/user', {
      headers: {
        'Accept': 'application/json',
        'xi-api-key': elevenlabsApiKey,
      },
    })

    let userInfo = null
    if (userResponse.ok) {
      userInfo = await userResponse.json()
      console.log('🎵 User info fetched successfully:', {
        subscription: userInfo.subscription?.tier,
        characterCount: userInfo.subscription?.character_count,
        characterLimit: userInfo.subscription?.character_limit
      })
    } else {
      console.warn('⚠️ Failed to fetch user info:', userResponse.status)
    }

    // Categorize voices by type
    const categorizedVoices = {
      premade: voicesData.voices?.filter((voice: any) => voice.category === 'premade') || [],
      cloned: voicesData.voices?.filter((voice: any) => voice.category === 'cloned') || [],
      generated: voicesData.voices?.filter((voice: any) => voice.category === 'generated') || [],
      professional: voicesData.voices?.filter((voice: any) => voice.category === 'professional') || [],
    }

    console.log('🎵 Voice categories:', {
      premade: categorizedVoices.premade.length,
      cloned: categorizedVoices.cloned.length,
      generated: categorizedVoices.generated.length,
      professional: categorizedVoices.professional.length
    })

    // Test a voice to verify API is working
    let testResult: any = null
    if (voicesData.voices && voicesData.voices.length > 0) {
      const testVoice = voicesData.voices[0]
      console.log('🎵 Testing voice:', testVoice.name, testVoice.voice_id)
      
      try {
        const testResponse = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${testVoice.voice_id}`, {
          method: 'POST',
          headers: {
            'Accept': 'audio/mpeg',
            'Content-Type': 'application/json',
            'xi-api-key': elevenlabsApiKey,
          },
          body: JSON.stringify({
            text: 'Hello! This is a test of the ElevenLabs voice system.',
            model_id: 'eleven_multilingual_v2',
            voice_settings: {
              stability: 0.5,
              similarity_boost: 0.8,
              style: 0.0,
              use_speaker_boost: true
            }
          }),
        })

        testResult = {
          success: testResponse.ok,
          status: testResponse.status,
          voiceTested: testVoice.name,
          voiceId: testVoice.voice_id,
        }

        if (!testResponse.ok) {
          const errorText = await testResponse.text()
          testResult.error = errorText
          console.error('❌ Voice test failed:', testResult)
        } else {
          console.log('✅ Voice test successful')
        }
      } catch (error: any) {
        testResult = {
          success: false,
          error: error.message,
          voiceTested: testVoice.name,
          voiceId: testVoice.voice_id,
        }
        console.error('❌ Voice test exception:', error)
      }
    }
    
    const responseData = {
      success: true,
      userInfo,
      totalVoices: voicesData.voices?.length || 0,
      categorizedVoices,
      allVoices: voicesData.voices || [],
      testResult,
      timestamp: new Date().toISOString(),
    }
    
    console.log('🎵 Returning successful response with', responseData.totalVoices, 'voices')
    
    return new Response(
      JSON.stringify(responseData),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('❌ Edge function error:', error)
    console.error('❌ Error stack:', error.stack)
    
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error', 
        details: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
}) 