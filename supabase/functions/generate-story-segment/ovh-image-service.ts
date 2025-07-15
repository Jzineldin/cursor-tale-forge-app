export async function generateImageWithOVH(prompt: string, settings?: any): Promise<Blob | null> {
    const OVH_API_TOKEN = Deno.env.get('OVH_AI_ENDPOINTS_ACCESS_TOKEN');
    if (!OVH_API_TOKEN) {
        console.error('🔑 OVH_AI_ENDPOINTS_ACCESS_TOKEN is not set. Please configure it in Supabase Edge Functions secrets.');
        return null;
    }

    const IMAGE_GENERATION_URL = 'https://stable-diffusion-xl.endpoints.kepler.ai.cloud.ovh.net/api/text2image';

    console.log('🎨 Calling OVHcloud AI Endpoints for image generation...');
    console.log(`📝 Prompt: "${prompt.substring(0, 100)}${prompt.length > 100 ? '...' : ''}"`);
    
    // Use settings if provided, otherwise use defaults
    const negativePrompt = settings?.negative_prompt || 'Ugly, blurry, low quality, deformed, distorted';
    
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
                prompt: prompt, 
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