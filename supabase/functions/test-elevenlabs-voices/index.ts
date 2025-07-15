import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    );

    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user } } = await supabaseClient.auth.getUser(token);

    if (!user) {
      return new Response('Unauthorized', { status: 401, headers: corsHeaders });
    }

    const ELEVENLABS_API_KEY = Deno.env.get('ELEVENLABS_API_KEY');
    if (!ELEVENLABS_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'ElevenLabs API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Fetching available voices from ElevenLabs...');

    // Fetch all available voices
    const voicesResponse = await fetch('https://api.elevenlabs.io/v1/voices', {
      headers: {
        'Accept': 'application/json',
        'xi-api-key': ELEVENLABS_API_KEY,
      },
    });

    if (!voicesResponse.ok) {
      const errorText = await voicesResponse.text();
      console.error('ElevenLabs voices API error:', errorText);
      return new Response(
        JSON.stringify({ 
          error: 'Failed to fetch voices', 
          details: errorText,
          status: voicesResponse.status 
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const voicesData = await voicesResponse.json();
    console.log('Available voices:', voicesData);

    // Also fetch user info to understand account type
    const userResponse = await fetch('https://api.elevenlabs.io/v1/user', {
      headers: {
        'Accept': 'application/json',
        'xi-api-key': ELEVENLABS_API_KEY,
      },
    });

    let userInfo = null;
    if (userResponse.ok) {
      userInfo = await userResponse.json();
      console.log('User info:', userInfo);
    }

    // Categorize voices by type
    const categorizedVoices = {
      premade: voicesData.voices?.filter((voice: any) => voice.category === 'premade') || [],
      cloned: voicesData.voices?.filter((voice: any) => voice.category === 'cloned') || [],
      generated: voicesData.voices?.filter((voice: any) => voice.category === 'generated') || [],
      professional: voicesData.voices?.filter((voice: any) => voice.category === 'professional') || [],
    };

    // Test a voice to verify API is working
    let testResult: any = null;
    if (voicesData.voices && voicesData.voices.length > 0) {
      const testVoice = voicesData.voices[0];
      console.log('Testing voice:', testVoice.name, testVoice.voice_id);
      
      try {
        const testResponse = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${testVoice.voice_id}`, {
          method: 'POST',
          headers: {
            'Accept': 'audio/mpeg',
            'Content-Type': 'application/json',
            'xi-api-key': ELEVENLABS_API_KEY,
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
        });

        testResult = {
          success: testResponse.ok,
          status: testResponse.status,
          voiceTested: testVoice.name,
          voiceId: testVoice.voice_id,
        };

        if (!testResponse.ok) {
          const errorText = await testResponse.text();
          testResult.error = errorText;
        }
      } catch (error: any) {
        testResult = {
          success: false,
          error: error.message,
          voiceTested: testVoice.name,
          voiceId: testVoice.voice_id,
        };
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        userInfo,
        totalVoices: voicesData.voices?.length || 0,
        categorizedVoices,
        allVoices: voicesData.voices || [],
        testResult,
        timestamp: new Date().toISOString(),
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in test-elevenlabs-voices function:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error', 
        details: error.message 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}); 