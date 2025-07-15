import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

function enhanceImagePrompt(prompt: string, visualContext?: any): string {
  let enhancedPrompt = prompt;
  
  // Add character consistency
  if (visualContext?.characters) {
    const characterDescriptions = Object.entries(visualContext.characters)
      .map(([name, description]) => `${name}: ${description}`)
      .join(', ');
    
    if (characterDescriptions) {
      enhancedPrompt = `${enhancedPrompt} - Characters: ${characterDescriptions}`;
    }
  }
  
  // Add style consistency
  if (visualContext?.style) {
    enhancedPrompt = `${enhancedPrompt} - Art style: ${visualContext.style}`;
  }
  
  // Add quality descriptors for DALL-E-3
  enhancedPrompt = `High quality digital illustration, detailed and vibrant: ${enhancedPrompt}. Professional storybook art style, consistent character design.`;
  
  // Keep within limits
  if (enhancedPrompt.length > 4000) {
    enhancedPrompt = enhancedPrompt.substring(0, 4000);
  }
  
  return enhancedPrompt;
}

export async function generateImageWithOpenAI(prompt: string, visualContext?: any): Promise<Blob | null> {
  const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
  if (!openAIApiKey) {
    console.error('❌ OpenAI API key not available');
    return null;
  }

  const enhancedPrompt = enhanceImagePrompt(prompt, visualContext);
  console.log('🎨 Generating image with DALL-E-3...');
  console.log('Enhanced prompt:', enhancedPrompt);

  try {
    console.log('📡 Making request to OpenAI Image API...');
    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt: enhancedPrompt,
        size: '1024x1024',
        quality: 'hd',
        n: 1
      }),
    });

    console.log(`📊 OpenAI Image API Response Status: ${response.status}`);
    console.log(`📊 Response Headers:`, Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ OpenAI Image API Error Response:', errorText);
      
      // Try to parse error for better logging
      try {
        const errorData = JSON.parse(errorText);
        console.error('❌ Parsed OpenAI Error:', errorData);
        if (errorData.error?.message) {
          console.error('❌ Error Message:', errorData.error.message);
        }
      } catch (parseError) {
        console.error('❌ Could not parse error response:', parseError);
      }
      
      return null;
    }

    const data = await response.json();
    console.log('✅ OpenAI Image API Success Response Structure:', {
      hasData: !!data.data,
      dataLength: data.data?.length,
      firstItemKeys: data.data?.[0] ? Object.keys(data.data[0]) : null
    });
    
    // DALL-E-3 returns URL, need to fetch the image
    if (data.data && data.data[0] && data.data[0].url) {
      const imageUrl = data.data[0].url;
      console.log('🖼️ Fetching generated image from URL:', imageUrl);
      
      const imageResponse = await fetch(imageUrl);
      console.log(`📥 Image fetch response status: ${imageResponse.status}`);
      
      if (!imageResponse.ok) {
        console.error('❌ Failed to fetch generated image:', imageResponse.status, imageResponse.statusText);
        return null;
      }
      
      const imageBlob = await imageResponse.blob();
      console.log(`✅ Generated image blob: ${imageBlob.size} bytes, type: ${imageBlob.type}`);
      return imageBlob;
    }

    console.error('❌ Invalid response structure from OpenAI Image API:', data);
    return null;
    
  } catch (error) {
    console.error('❌ OpenAI image generation failed with exception:', error);
    console.error('❌ Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
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

// Main function for generating images with DALL-E-3
export async function generateImageWithFallback(prompt: string, visualContext?: any): Promise<Blob | null> {
  console.log('🎨 Starting image generation with DALL-E-3');
  console.log('Image prompt:', prompt);
  console.log('Visual context:', visualContext);
  
  // Try DALL-E-3 first
  const imageBlob = await generateImageWithOpenAI(prompt, visualContext);
  if (imageBlob) {
    console.log('✅ Successfully generated image with DALL-E-3');
    return imageBlob;
  }
  
  console.log('❌ DALL-E-3 image generation failed - no fallback provided');
  return null;
}

// Upload function that ensures storage bucket exists
async function ensureStorageBucket(client: SupabaseClient): Promise<boolean> {
  try {
    const { data: buckets, error: listError } = await client.storage.listBuckets();
    
    if (listError) {
      console.error('Error listing buckets:', listError);
      return false;
    }
    
    const bucketExists = buckets?.some(bucket => bucket.name === 'story_images');
    
    if (!bucketExists) {
      console.log('📁 Creating story_images bucket...');
      const { error: createError } = await client.storage.createBucket('story_images', {
        public: true,
        fileSizeLimit: 10485760, // 10MB
        allowedMimeTypes: ['image/png', 'image/jpeg', 'image/webp']
      });
      
      if (createError) {
        console.error('Error creating bucket:', createError);
        return false;
      }
      console.log('✅ Successfully created story_images bucket');
    }
    
    return true;
  } catch (error) {
    console.error('Error ensuring storage bucket:', error);
    return false;
  }
}

export async function uploadImageToStorageWithBucket(imageBlob: Blob, client: SupabaseClient): Promise<string> {
  console.log('📤 Ensuring storage bucket exists...');
  const bucketReady = await ensureStorageBucket(client);
  
  if (!bucketReady) {
    throw new Error('Storage bucket is not ready');
  }

  return await uploadImageToStorage(imageBlob, client);
}
