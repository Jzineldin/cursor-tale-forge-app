
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

    // Check demo limits first
    const { data: { user } } = await supabaseClient.auth.getUser()
    
    if (user?.email === 'demo@tale-forge.app') {
      // Get client IP from various headers
      const ip = req.headers.get('x-forwarded-for') || 
                 req.headers.get('x-real-ip') || 
                 req.headers.get('cf-connecting-ip') ||
                 '127.0.0.1'

      const clientIP = ip.split(',')[0].trim()
      const today = new Date().toISOString().split('T')[0]

      // Check current usage for this IP + feature + date
      const { data: usage, error } = await supabaseClient
        .from('demo_usage')
        .select('usage_count')
        .eq('ip_address', clientIP)
        .eq('feature_type', 'voice')
        .eq('date_created', today)
        .single()

      const currentUsage = usage?.usage_count || 0
      const limit = 3 // Demo voice limit

      if (currentUsage >= limit) {
        return new Response(
          JSON.stringify({
            error: `Demo voice limit reached (${limit}/day per IP). Sign up for unlimited access!`,
            currentUsage,
            limit,
            resetTime: 'tomorrow'
          }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Increment usage for demo account
      await supabaseClient
        .from('demo_usage')
        .upsert({
          ip_address: clientIP,
          feature_type: 'voice',
          date_created: today,
          usage_count: 1,
          last_used: new Date().toISOString()
        }, {
          onConflict: 'ip_address,feature_type,date_created',
          ignoreDuplicates: false
        })

      // If record exists, increment it
      await supabaseClient.rpc('increment_demo_usage', {
        p_ip_address: clientIP,
        p_feature_type: 'voice',
        p_date: today
      })
    }

    const { text, voice = 'fable', speed = 1.0, segmentId } = await req.json()

    console.log('🔊 Generating audio:', { 
      textLength: text?.length, 
      voice, 
      speed, 
      segmentId 
    })

    if (!text) {
      throw new Error('Text is required for audio generation')
    }

    // ElevenLabs voice mapping - Updated with actual ElevenLabs voice IDs from user's account
    const ELEVENLABS_VOICE_MAP: Record<string, string> = {
      // Direct ElevenLabs voice IDs
      'nPczCjzI2devNBz1zQrb': 'nPczCjzI2devNBz1zQrb', // Brian - Master Storyteller
      'EXAVITQu4vr4xnSDxMaL': 'EXAVITQu4vr4xnSDxMaL', // Sarah - Warm Storyteller
      'XB0fDUnXU5powFXDhCwa': 'XB0fDUnXU5powFXDhCwa', // Charlotte - Expressive Reader
      'JBFqnCBsd6RMkjVDRZzb': 'JBFqnCBsd6RMkjVDRZzb', // George - Deep & Serious
      'iP95p4xoKVk53GoZ742B': 'iP95p4xoKVk53GoZ742B', // Chris - Energetic Narrator
      'cgSgspJ2msm6clMCkdW9': 'cgSgspJ2msm6clMCkdW9', // Jessica - Expressive
      'Xb7hH8MSUJpSbSDYk0k2': 'Xb7hH8MSUJpSbSDYk0k2', // Alice - Conversational
      'bIHbv24MWmeRgasZH58o': 'bIHbv24MWmeRgasZH58o', // Will - British Charm
      'cjVigY5qzO86Huf0OWal': 'cjVigY5qzO86Huf0OWal', // Eric - Empathetic Guide
      '9BWtsMINqrJLrRacOk9x': '9BWtsMINqrJLrRacOk9x', // Aria - Uplifting
      'onwK4e9ZLuTAKqWW03F9': 'onwK4e9ZLuTAKqWW03F9', // Daniel - Professional
      'SAz9YHcvj6GT2YYXdXww': 'SAz9YHcvj6GT2YYXdXww', // River - Character Voice
      
      // Legacy OpenAI voice name mappings for backwards compatibility
      'fable': 'nPczCjzI2devNBz1zQrb', // Brian - Master Storyteller
      'alloy': 'EXAVITQu4vr4xnSDxMaL', // Sarah - Warm Storyteller
      'echo': 'XB0fDUnXU5powFXDhCwa', // Charlotte - Expressive Reader
      'onyx': 'JBFqnCBsd6RMkjVDRZzb', // George - Deep & Serious
      'nova': 'iP95p4xoKVk53GoZ742B', // Chris - Energetic Narrator
      'shimmer': 'cgSgspJ2msm6clMCkdW9' // Jessica - Expressive
    };

    const elevenlabsKey = Deno.env.get('ELEVENLABS_API_KEY')
    if (!elevenlabsKey) {
      throw new Error('ElevenLabs API key not configured')
    }

    // Map OpenAI voice names to ElevenLabs voice IDs
    const voiceId = ELEVENLABS_VOICE_MAP[voice] || ELEVENLABS_VOICE_MAP['fable'];
    console.log(`🔊 Using ElevenLabs voice ID: ${voiceId} for voice: ${voice}`);

    // Generate audio using ElevenLabs TTS
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'xi-api-key': elevenlabsKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: text.substring(0, 5000), // ElevenLabs limit is higher than OpenAI
        model_id: "eleven_multilingual_v2",
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
          style: 0.0,
          use_speaker_boost: true
        }
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('ElevenLabs TTS error:', response.status, errorText)
      throw new Error(`ElevenLabs TTS error: ${response.status}`)
    }

    // Get the audio data
    const audioBuffer = await response.arrayBuffer()
    const audioBlob = new Blob([audioBuffer], { type: 'audio/mpeg' })

    // Upload to Supabase Storage
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const fileName = `story_audio_${segmentId || Date.now()}.mp3`
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('story-audio')
      .upload(fileName, audioBlob, {
        contentType: 'audio/mpeg',
        upsert: true
      })

    if (uploadError) {
      console.error('Storage upload error:', uploadError)
      throw new Error(`Storage upload failed: ${uploadError.message}`)
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('story-audio')
      .getPublicUrl(fileName)

    // Estimate duration (rough calculation: ~150 words per minute)
    const wordCount = text.split(/\s+/).length
    const estimatedDuration = Math.ceil((wordCount / 150) * 60) // seconds

    console.log('✅ Audio generated successfully:', {
      publicUrl,
      duration: estimatedDuration,
      fileName
    })

    return new Response(
      JSON.stringify({ 
        audio_url: publicUrl,
        duration: estimatedDuration,
        success: true
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  } catch (error) {
    console.error('Audio generation failed:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
