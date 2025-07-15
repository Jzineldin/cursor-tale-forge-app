
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const ELEVENLABS_DEFAULT_VOICE_ID = 'fable';

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

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { voiceId, text } = await req.json();
    const sampleText = text || "Hello, this is a test of my voice. I hope you like it!";

    const elevenlabsApiKey = Deno.env.get('ELEVENLABS_API_KEY');
    if (!elevenlabsApiKey) {
      console.error('ELEVENLABS_API_KEY is not set in Supabase secrets.');
      throw new Error('ElevenLabs API key is not configured. Please check your Supabase Edge Function secrets.');
    }

    console.log('Testing voice generation with ElevenLabs API...');
    console.log('Voice:', voiceId || ELEVENLABS_DEFAULT_VOICE_ID);
    console.log('Text length:', sampleText.length);
    
    const selectedVoice = voiceId || ELEVENLABS_DEFAULT_VOICE_ID;
    const elevenlabsVoiceId = ELEVENLABS_VOICE_MAP[selectedVoice] || ELEVENLABS_VOICE_MAP['fable'];
    console.log(`Using ElevenLabs voice ID: ${elevenlabsVoiceId} for voice: ${selectedVoice}`);

    // Add retry logic for rate limiting
    let retryCount = 0;
    const maxRetries = 3;
    let response;

    while (retryCount < maxRetries) {
      try {
        response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${elevenlabsVoiceId}`, {
          method: 'POST',
          headers: {
            'xi-api-key': elevenlabsApiKey,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text: sampleText,
            model_id: "eleven_multilingual_v2",
            voice_settings: {
              stability: 0.5,
              similarity_boost: 0.75,
              style: 0.0,
              use_speaker_boost: true
            }
          }),
        });

        console.log(`ElevenLabs TTS API response status: ${response.status} (attempt ${retryCount + 1})`);

        if (response.status === 429) {
          // Rate limited - wait and retry
          const retryAfter = response.headers.get('retry-after');
          const waitTime = retryAfter ? parseInt(retryAfter) * 1000 : (retryCount + 1) * 2000;
          console.log(`Rate limited. Waiting ${waitTime}ms before retry...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
          retryCount++;
          continue;
        }

        if (!response.ok) {
          const errorBody = await response.text();
          console.error(`ElevenLabs TTS API error: ${response.status} - ${errorBody}`);
          
          if (response.status === 401) {
            throw new Error('ElevenLabs API key is invalid. Please verify your API key in Supabase Edge Function secrets.');
          } else if (response.status === 429) {
            throw new Error('ElevenLabs API rate limit exceeded. Please wait a moment and try again.');
          } else {
            throw new Error(`ElevenLabs TTS API error: ${response.status} - ${errorBody}`);
          }
        }

        // Success - break out of retry loop
        break;

      } catch (error) {
        if (retryCount === maxRetries - 1) {
          throw error;
        }
        console.log(`Attempt ${retryCount + 1} failed, retrying...`);
        retryCount++;
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    const audioBuffer = await response.arrayBuffer();
    
    // Convert arrayBuffer to base64
    const base64Audio = btoa(String.fromCharCode(...new Uint8Array(audioBuffer)));

    console.log('Voice generation successful');
    return new Response(JSON.stringify({ audioContent: base64Audio }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error generating test audio:', error);
    
    // Return more helpful error messages
    let errorMessage = error.message;
    let statusCode = 500;
    
    if (error.message?.includes('quota') || error.message?.includes('429')) {
      errorMessage = 'ElevenLabs API rate limit exceeded. Please wait a moment and try again, or check your ElevenLabs account usage.';
      statusCode = 429;
    } else if (error.message?.includes('Invalid API key') || error.message?.includes('401')) {
      errorMessage = 'ElevenLabs API key is invalid. Please verify your API key in Supabase Edge Function secrets.';
      statusCode = 401;
    }
    
    return new Response(JSON.stringify({ 
      error: errorMessage,
      details: 'If this issue persists, check your ElevenLabs account status and API key configuration.'
    }), {
      status: statusCode,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
