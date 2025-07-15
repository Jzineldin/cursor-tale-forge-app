
import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

// ElevenLabs voice mapping - Updated with correct voice IDs from user's account
const ELEVENLABS_VOICE_MAP: Record<string, string> = {
  'fable': 'nPczCjzI2devNBz1zQrb', // Brian - Deep, authoritative storyteller
  'alloy': 'EXAVITQu4vr4xnSDxMaL', // Sarah - Calm, conversational (closest to Rachel)
  'echo': 'XB0fDUnXU5powFXDhCwa', // Charlotte - Confident, engaging (closest to Domi)
  'onyx': 'JBFqnCBsd6RMkjVDRZzb', // George - Deep, serious (closest to Josh)
  'nova': 'iP95p4xoKVk53GoZ742B', // Chris - Clear, energetic (closest to Adam)
  'shimmer': 'cgSgspJ2msm6clMCkdW9' // Jessica - Emotional, expressive (closest to Nicole)
};

export async function generateAudio(text: string, voice: string = 'fable', supabaseClient?: SupabaseClient): Promise<{ audioUrl: string; duration: number } | null> {
  console.log("Generating audio with ElevenLabs TTS for voice:", voice);
  
  const elevenlabsApiKey = Deno.env.get('ELEVENLABS_API_KEY');
  console.log("ElevenLabs API Key status:", elevenlabsApiKey ? 'Found' : 'Missing');

  if (!elevenlabsApiKey) {
    console.error("ELEVENLABS_API_KEY environment variable is not set in Supabase Edge Function secrets");
    return null;
  }

  // Map OpenAI voice names to ElevenLabs voice IDs
  const voiceId = ELEVENLABS_VOICE_MAP[voice] || ELEVENLABS_VOICE_MAP['fable'];
  console.log(`Using ElevenLabs voice ID: ${voiceId} for voice: ${voice}`);

  try {
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'xi-api-key': elevenlabsApiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: text,
        model_id: "eleven_multilingual_v2",
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
          style: 0.0,
          use_speaker_boost: true
        }
      }),
    });

    console.log(`ElevenLabs TTS API response status: ${response.status}`);

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`ElevenLabs TTS API error: ${response.status} ${errorBody}`);
      
      // More specific error logging
      if (response.status === 401) {
        console.error("ElevenLabs API key is invalid or expired. Please check your API key in Supabase Edge Function secrets.");
      } else if (response.status === 429) {
        console.error("ElevenLabs API rate limit exceeded. Your quota may be exhausted.");
      } else {
        console.error(`ElevenLabs TTS API error: ${response.status} - ${errorBody}`);
      }
      
      return null;
    }

    const audioBuffer = await response.arrayBuffer();
    
    if (!audioBuffer || audioBuffer.byteLength === 0) {
      console.error("ElevenLabs returned an empty audio buffer.");
      return null;
    }

    console.log(`Successfully generated audio from ElevenLabs TTS. Size: ${audioBuffer.byteLength} bytes`);
    
    // Upload audio to Supabase storage if client is provided
    let audioUrl = null;
    if (supabaseClient) {
      audioUrl = await uploadAudioToStorage(audioBuffer, supabaseClient);
    }
    
    return {
      audioUrl: audioUrl || "placeholder_audio_url",
      duration: Math.ceil(text.length / 20) // Rough estimate: ~20 characters per second
    };

  } catch (error) {
    console.error("Error calling ElevenLabs TTS API:", error.message);
    return null;
  }
}

// Upload audio to Supabase storage
export async function uploadAudioToStorage(audioBuffer: ArrayBuffer, client: SupabaseClient): Promise<string | null> {
  try {
    const filePath = `audio_${Date.now()}.mp3`;
    console.log(`Uploading audio to storage at path: ${filePath}`);

    const { data, error } = await client.storage
      .from('story-audio')
      .upload(filePath, audioBuffer, {
        contentType: 'audio/mpeg',
      });

    if (error) {
      console.error(`Failed to upload audio to storage: ${error.message}`);
      return null;
    }
    
    const { data: { publicUrl } } = client.storage.from('story-audio').getPublicUrl(data.path);
    console.log(`Audio uploaded successfully. Public URL: ${publicUrl}`);
    return publicUrl;
  } catch (uploadError) {
    console.error("Audio upload error:", uploadError);
    return null;
  }
}
