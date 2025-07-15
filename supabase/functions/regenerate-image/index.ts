import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// OVH Image Generation Service
async function generateImageWithOVH(prompt: string, settings?: any): Promise<Blob | null> {
    const OVH_API_TOKEN = Deno.env.get('OVH_AI_ENDPOINTS_ACCESS_TOKEN');
    if (!OVH_API_TOKEN) {
        console.error('🔑 OVH_AI_ENDPOINTS_ACCESS_TOKEN is not set. Please configure it in Supabase Edge Functions secrets.');
        return null;
    }

    const IMAGE_GENERATION_URL = 'https://stable-diffusion-xl.endpoints.kepler.ai.cloud.ovh.net/api/text2image';

    console.log('🎨 Calling OVHcloud AI Endpoints for image generation...');
    console.log(`📝 Prompt: "${prompt.substring(0, 100)}${prompt.length > 100 ? '...' : ''}"`);
    
    const negativePrompt = settings?.negative_prompt || 'Ugly, blurry, low quality, deformed, distorted';
    const steps = settings?.steps || 20;
    
    console.log(`⚙️ Using settings - Steps: ${steps}, Negative prompt: "${negativePrompt}"`);
    
    try {
        const response = await fetch(IMAGE_GENERATION_URL, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json', 
                'Accept': 'application/octet-stream', 
                'Authorization': `Bearer ${OVH_API_TOKEN}` 
            },
            body: JSON.stringify({ 
                prompt: prompt, 
                negative_prompt: negativePrompt,
                num_inference_steps: steps
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            
            if (response.status === 429) {
                console.error('⚠️ OVH Rate Limit Exceeded: You have exceeded the rate limit for OVHcloud AI Endpoints.');
                console.error('📊 Rate limits: Anonymous (2 req/min), Authenticated (400 req/min per project)');
                console.error('💡 Please wait before making another request or check your authentication.');
                return null;
            }
            
            console.error(`❌ OVH Image Generation Failed (${response.status}): ${errorText}`);
            console.error('🔧 Check your API token and request parameters');
            return null;
        }
        
        console.log('✅ Successfully generated 1024x1024 image with OVHcloud AI Endpoints (Stable Diffusion XL)');
        return await response.blob();
    } catch (error) {
        console.error('💥 Network error during OVH image generation:', error);
        console.error('🌐 Check your internet connection and OVHcloud service availability');
        return null;
    }
}

// OpenAI Image Generation Service
async function generateImageWithOpenAI(prompt: string, visualContext?: any): Promise<Blob | null> {
  const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
  if (!openAIApiKey) {
    console.error('OpenAI API key not found');
    return null;
  }

  try {
    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-image-1',
        prompt: prompt,
        n: 1,
        size: '1024x1024',
        response_format: 'b64_json'
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('OpenAI API error:', data);
      return null;
    }

    const base64Image = data.data[0].b64_json;
    const binaryString = atob(base64Image);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    
    return new Blob([bytes], { type: 'image/png' });
  } catch (error) {
    console.error('Error generating image with OpenAI:', error);
    return null;
  }
}

// Get generation settings from database
async function getGenerationSettings(client: any) {
  const { data } = await client
    .from('admin_settings')
    .select('key, value')
    .in('key', [
      'image_provider_primary',
      'image_provider_fallback',
      'ovh_negative_prompt',
      'ovh_steps'
    ]);

  const settings = {
    imageProviders: {
      primary: 'openai',
      fallback: 'ovh',
      ovhSettings: {
        negative_prompt: 'Ugly, blurry, low quality, deformed, distorted',
        steps: 20
      }
    }
  };

  if (data) {
    data.forEach((setting: any) => {
      switch (setting.key) {
        case 'image_provider_primary':
          settings.imageProviders.primary = setting.value || 'openai';
          break;
        case 'image_provider_fallback':
          settings.imageProviders.fallback = setting.value || 'ovh';
          break;
        case 'ovh_negative_prompt':
          settings.imageProviders.ovhSettings.negative_prompt = setting.value || 'Ugly, blurry, low quality, deformed, distorted';
          break;
        case 'ovh_steps':
          settings.imageProviders.ovhSettings.steps = parseInt(setting.value) || 20;
          break;
      }
    });
  }

  return settings;
}

// Enhanced image prompt creation
function createEnhancedImagePrompt(originalPrompt: string, visualContext: any): string {
  const style = visualContext?.style || "epic fantasy illustration, digital art, cinematic lighting, high detail";
  return `${originalPrompt}, ${style}`;
}

// Main image generation function
async function generateImage(prompt: string, client: any, testMode: boolean = false): Promise<Blob | null> {
  console.log('🎨 Starting dynamic image generation...');
  console.log(`🧪 Test mode: ${testMode}`);
  
  // Enhanced logging for provider visibility
  const logProviderAttempt = (provider: string, status: 'attempting' | 'success' | 'error', details?: any) => {
    console.log(`[PROVIDER_LOG] ${provider.toUpperCase()}: ${status}`, details || '');
  };
  
  const settings = await getGenerationSettings(client);
  const primaryProvider = settings.imageProviders.primary;
  const fallbackProvider = settings.imageProviders.fallback;

  const visualContext = {
    style: "epic fantasy illustration, digital art, cinematic lighting, high detail",
    characters: []
  };

  const enhancedPrompt = createEnhancedImagePrompt(prompt, visualContext);

  console.log(`Primary provider set to: ${primaryProvider}`);
  logProviderAttempt(primaryProvider, 'attempting', { prompt: enhancedPrompt.substring(0, 100) });
  
  // Try Primary Provider
  let imageBlob = await callImageProvider(primaryProvider, enhancedPrompt, settings);

  if (imageBlob) {
    logProviderAttempt(primaryProvider, 'success', { size: imageBlob.size });
    console.log(`✅ Successfully generated image with primary provider: ${primaryProvider}`);
    return imageBlob;
  }

  // If Primary Fails, Try Fallback Provider
  logProviderAttempt(primaryProvider, 'error', { reason: 'No result returned' });
  console.warn(`Primary provider '${primaryProvider}' failed. Trying fallback: ${fallbackProvider}`);
  logProviderAttempt(fallbackProvider, 'attempting', { prompt: enhancedPrompt.substring(0, 100), fallback: true });
  imageBlob = await callImageProvider(fallbackProvider, enhancedPrompt, settings);
  
  if (imageBlob) {
    logProviderAttempt(fallbackProvider, 'success', { size: imageBlob.size, fallback: true });
    console.log(`✅ Successfully generated image with fallback provider: ${fallbackProvider}`);
    return imageBlob;
  }

  logProviderAttempt(fallbackProvider, 'error', { reason: 'No result returned', fallback: true });

  console.error('❌ All image generation providers failed.');
  return null;
}

// Helper function to call the correct service based on the provider name
async function callImageProvider(provider: string, prompt: string, settings: any): Promise<Blob | null> {
    const startTime = Date.now();
    try {
        console.log(`[PROVIDER_CALL] Calling ${provider} provider`);
        
        let result: Blob | null = null;
        
        switch (provider) {
            case 'ovh':
                result = await generateImageWithOVH(prompt, settings.imageProviders?.ovhSettings);
                break;
            case 'openai':
                result = await generateImageWithOpenAI(prompt, null);
                break;
            default:
                console.error(`[PROVIDER_CALL] Unknown image provider: '${provider}'. Defaulting to OpenAI.`);
                result = await generateImageWithOpenAI(prompt, null);
                break;
        }
        
        const duration = (Date.now() - startTime) / 1000;
        console.log(`[PROVIDER_CALL] ${provider} completed in ${duration}s, result: ${result ? 'success' : 'failed'}`);
        
        return result;
    } catch (error) {
        const duration = (Date.now() - startTime) / 1000;
        console.error(`[PROVIDER_CALL] Error calling ${provider} provider after ${duration}s:`, error);
        return null;
    }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { prompt, testMode = false } = await req.json()

    if (!prompt) {
      return new Response(
        JSON.stringify({ error: 'Prompt is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log(`🖼️ Regenerating image with prompt: "${prompt}"`)
    console.log(`🧪 Test mode: ${testMode}`)

    // Generate image using dynamic provider system
    const imageBlob = await generateImage(prompt, supabaseClient, testMode)

    if (!imageBlob) {
      return new Response(
        JSON.stringify({ error: 'Failed to generate image with all available providers' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    if (testMode) {
      // In test mode, just return success without storing
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Image generation test completed successfully',
          imageSize: imageBlob.size 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // For non-test mode, you would upload to storage here
    // But for now just return success
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Image regenerated successfully' 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in regenerate-image function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})