
import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getGenerationSettings } from "./settings.ts";
import { createEnhancedImagePrompt } from "./enhanced-image-prompting.ts";

// Import all available image generation services
import { generateImageWithOpenAI } from "./openai-image-service.ts";
import { generateImageWithOVH } from "./ovh-image-service.ts";

/**
 * Main function for generating images.
 * It reads the settings from the database to decide which provider to use.
 */
export async function generateImage(prompt: string, client: SupabaseClient, testMode: boolean = false): Promise<Blob | null> {
  console.log('🎨 Starting dynamic image generation...');
  console.log(`🧪 Test mode: ${testMode}`);
  
  const settings = await getGenerationSettings(client);
  const primaryProvider = settings.imageProviders.primary;
  const fallbackProvider = settings.imageProviders.fallback;

  console.log(`🎯 PROVIDER SELECTION:
    Primary: ${primaryProvider}
    Fallback: ${fallbackProvider}
    Using settings from admin panel: YES`);

  const visualContext = {
    style: "epic fantasy illustration, digital art, cinematic lighting, high detail",
    characters: [] // This will be loaded from story data in the future
  };

  const enhancedPrompt = createEnhancedImagePrompt(prompt, visualContext);

  // Enhanced logging for provider visibility
  const logProviderAttempt = (provider: string, status: 'attempting' | 'success' | 'error', details?: any) => {
    console.log(`[PROVIDER_LOG] ${provider.toUpperCase()}: ${status}`, details || '');
  };

  console.log(`🚀 Starting with PRIMARY provider: ${primaryProvider}`);
  logProviderAttempt(primaryProvider, 'attempting', { 
    prompt: enhancedPrompt.substring(0, 100),
    settings: primaryProvider === 'ovh' ? settings.imageProviders.ovhSettings : 'default'
  });
  
  // --- Try Primary Provider ---
  let imageBlob = await callImageProvider(primaryProvider, enhancedPrompt, settings);

  if (imageBlob) {
    logProviderAttempt(primaryProvider, 'success', { size: imageBlob.size });
    console.log(`✅ SUCCESS with PRIMARY provider: ${primaryProvider}`);
    return imageBlob;
  }

  // --- If Primary Fails, Try Fallback Provider ---
  logProviderAttempt(primaryProvider, 'error', { reason: 'No result returned' });
  console.warn(`❌ PRIMARY provider '${primaryProvider}' failed. Switching to FALLBACK: ${fallbackProvider}`);
  logProviderAttempt(fallbackProvider, 'attempting', { 
    prompt: enhancedPrompt.substring(0, 100), 
    fallback: true,
    settings: fallbackProvider === 'ovh' ? settings.imageProviders.ovhSettings : 'default'
  });
  
  imageBlob = await callImageProvider(fallbackProvider, enhancedPrompt, settings);
  
  if (imageBlob) {
    logProviderAttempt(fallbackProvider, 'success', { size: imageBlob.size, fallback: true });
    console.log(`✅ SUCCESS with FALLBACK provider: ${fallbackProvider}`);
    return imageBlob;
  }

  logProviderAttempt(fallbackProvider, 'error', { reason: 'No result returned', fallback: true });
  console.error('❌ ALL image generation providers failed (primary AND fallback)');
  return null;
}

/**
 * Helper function to call the correct service based on the provider name.
 */
async function callImageProvider(provider: string, prompt: string, settings: any): Promise<Blob | null> {
    const startTime = Date.now();
    try {
        console.log(`[PROVIDER_CALL] 🔧 Calling ${provider.toUpperCase()} provider`);
        
        let result: Blob | null = null;
        
        switch (provider) {
            case 'ovh':
                console.log(`[PROVIDER_CALL] 🏭 Using OVH with settings:`, settings.imageProviders?.ovhSettings);
                result = await generateImageWithOVH(prompt, settings.imageProviders?.ovhSettings);
                break;
            case 'openai':
                console.log(`[PROVIDER_CALL] 🤖 Using OpenAI DALL-E`);
                result = await generateImageWithOpenAI(prompt, null);
                break;
            default:
                console.error(`[PROVIDER_CALL] ❓ Unknown provider: '${provider}'. Defaulting to OpenAI.`);
                result = await generateImageWithOpenAI(prompt, null);
                break;
        }
        
        const duration = (Date.now() - startTime) / 1000;
        const status = result ? 'SUCCESS' : 'FAILED';
        console.log(`[PROVIDER_CALL] ${provider.toUpperCase()} completed in ${duration}s - ${status}`);
        
        return result;
    } catch (error) {
        const duration = (Date.now() - startTime) / 1000;
        console.error(`[PROVIDER_CALL] ❌ Error with ${provider.toUpperCase()} after ${duration}s:`, error);
        return null;
    }
}


export async function uploadImageToStorage(imageBlob: Blob, client: SupabaseClient): Promise<string> {
  const filePath = `story_image_${Date.now()}.png`;
  console.log(`📤 Uploading image to storage: ${filePath}`);

  try {
    const { data, error } = await client.storage
      .from('story_images')
      .upload(filePath, imageBlob, {
        contentType: 'image/png',
      });

    if (error) {
      console.error('❌ Storage upload failed:', error);
      throw new Error(`Failed to upload image: ${error.message}`);
    }
    
    const { data: { publicUrl } } = client.storage
      .from('story_images')
      .getPublicUrl(data.path);
    
    console.log(`✅ Image uploaded successfully: ${publicUrl}`);
    return publicUrl;
    
  } catch (error) {
    console.error('❌ Image upload error:', error);
    throw error;
  }
}
