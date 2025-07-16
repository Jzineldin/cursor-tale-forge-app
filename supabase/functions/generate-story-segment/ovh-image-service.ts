import { getSafeNegativePrompt } from './enhanced-image-prompting.ts';
import { validateImagePrompt } from './content-safety.ts';

export async function generateImageWithOVH(prompt: string, settings?: any): Promise<Blob | null> {
    const OVH_API_TOKEN = Deno.env.get('OVH_AI_ENDPOINTS_ACCESS_TOKEN');
    if (!OVH_API_TOKEN) {
        console.error('🔑 OVH_AI_ENDPOINTS_ACCESS_TOKEN is not set. Please configure it in Supabase Edge Functions secrets.');
        return null;
    }

    const IMAGE_GENERATION_URL = 'https://stable-diffusion-xl.endpoints.kepler.ai.cloud.ovh.net/api/text2image';

    // Validate and sanitize the prompt for child safety
    const safePrompt = validateImagePrompt(prompt);
    
    console.log('🎨 Calling OVHcloud AI Endpoints for SAFE image generation...');
    console.log(`📝 Original prompt: "${prompt.substring(0, 100)}${prompt.length > 100 ? '...' : ''}"`);
    console.log(`🛡️ Safe prompt: "${safePrompt.substring(0, 100)}${safePrompt.length > 100 ? '...' : ''}"`);
    
    // Use comprehensive safe negative prompt
    const safeNegativePrompt = getSafeNegativePrompt();
    const customNegative = settings?.negative_prompt || '';
    const negativePrompt = customNegative ? `${safeNegativePrompt}, ${customNegative}` : safeNegativePrompt;
    
    console.log(`⚙️ Using settings - Negative prompt: "${negativePrompt}"`);
    
    try {
        const response = await fetch(IMAGE_GENERATION_URL, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json', 
                'Accept': 'application/octet-stream', 
                'Authorization': `Bearer ${OVH_API_TOKEN}` 
            },
            body: JSON.stringify({ 
                prompt: safePrompt, 
                negative_prompt: negativePrompt
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            
            // Handle specific rate limiting error (429)
            if (response.status === 429) {
                console.error('⚠️ OVH Rate Limit Exceeded: You have exceeded the rate limit for OVHcloud AI Endpoints.');
                console.error('📊 Rate limits: Anonymous (2 req/min), Authenticated (400 req/min per project)');
                console.error('💡 Please wait before making another request or check your authentication.');
                return null;
            }
            
            // Handle other HTTP errors
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