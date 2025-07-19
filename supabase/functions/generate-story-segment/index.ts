// ── Deno 1.45+, Edge runtime, CORS-safe ----------------------------
import { serve } from "https://deno.land/std@0.182.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import slug from "https://esm.sh/slug@8.0.0/";

const TEXT_ENDPOINT = Deno.env.get('OVH_TEXT_ENDPOINT')!;
const IMAGE_ENDPOINT = Deno.env.get('OVH_IMAGE_ENDPOINT')!;
const TOKEN = Deno.env.get('OVH_AI_ENDPOINTS_ACCESS_TOKEN')!;
const MODEL = "Qwen2.5-Coder-32B-Instruct";

const headers = {
  "Access-Control-Allow-Origin":  "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "*",
  "Content-Type": "application/json",
};

// OVH Image Generation
async function generateImageWithOVH(prompt: string, supabaseClient: any): Promise<string | null> {
  console.log('🎨 Starting image generation for prompt:', prompt.substring(0, 100) + '...');
  
  // Check environment variables
  console.log('🔧 Environment check:', {
    hasToken: !!TOKEN,
    hasImageEndpoint: !!IMAGE_ENDPOINT,
    imageEndpoint: IMAGE_ENDPOINT
  });
  
  if (!TOKEN) {
    console.error('🔑 OVH_AI_ENDPOINTS_ACCESS_TOKEN is not set');
    return null;
  }

  if (!IMAGE_ENDPOINT) {
    console.error('🔑 OVH_IMAGE_ENDPOINT is not set');
    return null;
  }

  try {
    console.log('🚀 Calling OVH image API at:', IMAGE_ENDPOINT);
    console.log('📝 Request payload:', JSON.stringify({ 
      prompt: prompt.substring(0, 100) + '...', 
      negative_prompt: 'Ugly, blurry, low quality, deformed, distorted, scary, dark, violent, inappropriate, adult content, weapons, blood, gore, horror, nightmare',
      num_inference_steps: 20
    }));
    
    const response = await fetch(IMAGE_ENDPOINT, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json', 
        'Accept': 'application/octet-stream', 
        'Authorization': `Bearer ${TOKEN}` 
      },
      body: JSON.stringify({ 
        prompt: prompt, 
        negative_prompt: 'Ugly, blurry, low quality, deformed, distorted, scary, dark, violent, inappropriate, adult content, weapons, blood, gore, horror, nightmare',
        num_inference_steps: 20
      }),
    });

    console.log('📡 OVH response status:', response.status);
    console.log('📡 OVH response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ OVH Image Generation Failed (${response.status}):`, errorText);
      return null;
    }
    
    console.log('✅ OVH image generation successful, uploading to storage...');
    const imageBlob = await response.blob();
    console.log('📦 Image blob size:', imageBlob.size, 'bytes');
    
    // Upload the image to Supabase Storage
    const fileName = `story-images/${Date.now()}-${Math.random().toString(36).substring(7)}.png`;
    console.log('📁 Uploading to file:', fileName);
    
    const { data: uploadData, error: uploadError } = await supabaseClient
      .storage
      .from('story-images')
      .upload(fileName, imageBlob, {
        contentType: 'image/png',
        cacheControl: '3600'
      });
    
    if (uploadError) {
      console.error('❌ Failed to upload image to storage:', uploadError);
      return null;
    }
    
    console.log('✅ Image uploaded to storage successfully');
    
    // Get the public URL
    const { data: urlData } = supabaseClient
      .storage
      .from('story-images')
      .getPublicUrl(fileName);
    
    console.log('✅ Image uploaded successfully:', urlData.publicUrl);
    return urlData.publicUrl;
  } catch (error) {
    console.error('💥 Network error during OVH image generation:', error);
    return null;
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers });
  if (req.method !== "POST")    return new Response("Use POST", { status: 405, headers });

  let body;
  try   { body = await req.json(); }
  catch { return new Response("Bad JSON", { status: 400, headers }); }

  const { 
    prompt = "", 
    age = "7-9", 
    genre = "story",
    storyId,
    parentSegmentId,
    choiceText,
    skipImage = false
  } = body;
  
  if (!prompt.trim()) return new Response("Missing prompt", { status: 400, headers });

  try {
    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get story context for continuity
    let storyContext = '';
    const isInitialStory = !parentSegmentId;
    
    if (storyId && !isInitialStory) {
      try {
        // Get previous segments for context - keep last 2 segments only
        const { data: previousSegments } = await supabaseClient
          .from('story_segments')
          .select('segment_text')
          .eq('story_id', storyId)
          .order('created_at', { ascending: true });
        
        if (previousSegments && previousSegments.length > 0) {
          // Get last 2 segments for context
          const lastTwoSegments = previousSegments.slice(-2);
          const context = lastTwoSegments
            .map(s => s.segment_text.trim())
            .join('\n');
          
          storyContext = `Continue this story naturally:\n${context}\n\n`;
          console.log('📚 Added story context for continuity');
        }
      } catch (contextError) {
        console.error('❌ Failed to get story context:', contextError);
      }
    }

    // Simplified system prompt
    const systemPrompt = getSystemPrompt(age, genre, isInitialStory);
    
    // Add context to the prompt
    const contextualPrompt = storyContext + prompt;
    
    const messages = [
      { role: "system", content: systemPrompt },
      { role: "user",   content: contextualPrompt }
    ];

    // Check environment variables
    console.log('🔧 Environment check:', {
      hasToken: !!TOKEN,
      hasTextEndpoint: !!TEXT_ENDPOINT,
      textEndpoint: TEXT_ENDPOINT
    });
    
    if (!TOKEN || !TEXT_ENDPOINT) {
      console.error("Missing OVH environment variables");
      return new Response(JSON.stringify(MOCK_STORY), { headers });
    }

    // Call OVH API for text generation
    console.log('🚀 Calling OVH API:', `${TEXT_ENDPOINT}/chat/completions`);
    
    const resp = await fetch(`${TEXT_ENDPOINT}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type":  "application/json",
        Authorization:   `Bearer ${TOKEN}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages,
        max_tokens: 600,
        temperature: 0.8, // Higher creativity
      }),
    });

    if (!resp.ok) {
      const errorText = await resp.text();
      console.error("OVH API error:", resp.status, errorText);
      return new Response(JSON.stringify(MOCK_STORY), { headers });
    }

    const data = await resp.json();
    const generatedText = data.choices?.[0]?.message?.content?.trim();
    
    if (!generatedText) {
      console.error("No text generated from AI response:", data);
      return new Response(JSON.stringify(MOCK_STORY), { headers });
    }

    console.log('📝 Raw AI response:', generatedText);

    // Parse story text and choices
    let cleanText = generatedText;
    let choices = ['Continue the story', 'Explore further', 'Make a choice'];

    // Try to extract choices from the response
    const choiceMatch = generatedText.match(/CHOICES?:\s*\[(.*?)\]/i);
    if (choiceMatch) {
      const choiceText = choiceMatch[1];
      const extractedChoices = choiceText
        .split(',')
        .map(c => c.trim().replace(/^["']|["']$/g, ''))
        .filter(c => c.length > 0);
      
      if (extractedChoices.length >= 3) {
        choices = extractedChoices.slice(0, 3);
        // Remove the choices section from the story text
        cleanText = generatedText.replace(/CHOICES?:\s*\[.*?\]/i, '').trim();
      }
    }

    // Clean up the text
    cleanText = cleanText
      .replace(/^Once upon a time,?\s*/i, '')
      .replace(/^In a magical forest,?\s*/i, '')
      .replace(/^There was once,?\s*/i, '')
      .trim();

    // Ensure we have a proper story
    if (!cleanText || cleanText.length < 50) {
      cleanText = MOCK_STORY.text;
      choices = MOCK_STORY.choices;
    }

    console.log('✅ Cleaned story text:', cleanText.substring(0, 100) + '...');
    console.log('✅ Choices:', choices);

    // Insert into database if we have a storyId
    let segmentId = null;
    if (storyId) {
      try {
        const { data: segment, error: insertError } = await supabaseClient
          .from('story_segments')
          .insert({
            story_id: storyId,
            parent_segment_id: parentSegmentId,
            segment_text: cleanText,
            choice_text: choiceText,
            image_generation_status: skipImage ? 'skipped' : 'pending',
            is_image_generating: !skipImage
          })
          .select()
          .single();

        if (insertError) {
          console.error('❌ Database insertion failed:', insertError);
        } else if (segment) {
          segmentId = segment.id;
          console.log('✅ Database insertion successful, segment ID:', segmentId);
          
          // Set loading state immediately to avoid "failed" placeholder
          if (!skipImage) {
            try {
              await supabaseClient
                .from('story_segments')
                .update({
                  is_image_generating: true,
                  image_url: 'https://via.placeholder.com/400x400/4F46E5/FFFFFF?text=Generating+Image...',
                  updated_at: new Date().toISOString(),
                })
                .eq('id', segmentId);
              console.log('✅ Set immediate loading state with placeholder URL');
            } catch (loadingError) {
              console.error('❌ Failed to set loading state:', loadingError);
            }
          }
        } else {
          console.error('❌ Database insertion failed - no segment returned');
        }
      } catch (dbError) {
        console.error('❌ Database error:', dbError);
      }
    } else {
      console.log('⚠️ No storyId provided, skipping database insertion');
    }
    
    // Generate image if not skipped (async - don't wait for completion)
    let immediateImageUrl = 'https://via.placeholder.com/400x400/4F46E5/FFFFFF?text=Generating+Image...';
    if (!skipImage) {
      // Generate image prompt
      const imagePrompt = `${IMAGE_PROMPT_BEAUTIFIER}: ${cleanText.substring(0, 200)}...`;
      
      console.log('🎨 Starting image generation');
      
      // Return placeholder URL in response to show loading state
      immediateImageUrl = 'https://via.placeholder.com/400x400/4F46E5/FFFFFF?text=Generating+Image...';
      
      // Try to generate the real image in the background (only if we have segment ID)
      if (segmentId) {
        console.log('🎨 Starting background image generation for segment:', segmentId);
        
        // Add a timeout to prevent hanging
        const imageGenerationPromise = generateImageWithOVH(imagePrompt, supabaseClient);
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Image generation timeout')), 60000)
        );
        
        Promise.race([imageGenerationPromise, timeoutPromise])
          .then(result => {
            console.log('🎨 Image generation completed:', result ? 'success' : 'failed');
            
            if (result) {
              // Update with the real image if generation succeeded
              supabaseClient
                .from('story_segments')
                .update({ 
                  image_url: result,
                  image_generation_status: 'completed',
                  is_image_generating: false
                })
                .eq('id', segmentId)
                .then(() => console.log('✅ Database updated with real image URL'))
                .catch(error => console.error('❌ Failed to update database with real image:', error));
            } else {
              // If image generation failed, use a nice fallback image
              const fallbackUrl = 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop&crop=center&auto=format&q=80';
              supabaseClient
                .from('story_segments')
                .update({ 
                  image_url: fallbackUrl,
                  image_generation_status: 'completed',
                  is_image_generating: false
                })
                .eq('id', segmentId)
                .then(() => console.log('✅ Database updated with fallback image URL'))
                .catch(error => console.error('❌ Failed to update database with fallback:', error));
            }
          })
          .catch(error => {
            console.error('🎨 Image generation failed or timed out:', error);
            // Use a nice fallback image instead of failing
            const fallbackUrl = 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop&crop=center&auto=format&q=80';
            supabaseClient
              .from('story_segments')
              .update({ 
                image_url: fallbackUrl,
                image_generation_status: 'completed',
                is_image_generating: false
              })
              .eq('id', segmentId)
              .then(() => console.log('✅ Database updated with fallback image URL after error'))
              .catch(dbError => console.error('❌ Failed to update database with fallback after error:', dbError));
          });
      }
    }

    // Image URL will be updated asynchronously when generation completes

    return new Response(JSON.stringify({ 
      text: cleanText,
      image_url: immediateImageUrl,
      id: segmentId,
      story_id: storyId,
      choices: choices,
      is_end: false,
      image_generation_status: skipImage ? 'skipped' : 'pending',
      is_image_generating: !skipImage
    }), { headers });
  } catch (error) {
    console.error("Edge function error:", error);
    return new Response(JSON.stringify(MOCK_STORY), { headers });
  }
});

// Simplified system prompts for more natural storytelling
const getSystemPrompt = (age: string, genre: string, isSeed: boolean = true) => {
  const ageGuidance = age === '3-6' ? 
    'Write a simple, gentle story with clear actions and happy endings. Use short sentences and familiar words.' :
    age === '7-9' ? 
    'Write an engaging story with clear characters and simple problems that get solved. Include some description but keep it flowing.' :
    age === '10-12' ? 
    'Write a more detailed story with character development and interesting plot twists. Include rich descriptions and emotional moments.' :
    'Write a sophisticated story with complex characters and meaningful choices. Include detailed descriptions and emotional depth.';

  const genreGuidance = {
    'bedtime-stories': 'Create a peaceful, calming story perfect for bedtime. Include gentle themes of comfort, safety, and sweet dreams.',
    'fantasy-magic': 'Create a magical adventure with enchanted elements, mystical creatures, and wondrous discoveries.',
    'adventure-exploration': 'Create an exciting journey of discovery with challenges, teamwork, and amazing discoveries.',
    'mystery-detective': 'Create a puzzling mystery with clues to follow, secrets to uncover, and clever problem-solving.',
    'science-space': 'Create a futuristic adventure with technology, space exploration, and scientific discoveries.',
    'educational-stories': 'Create an engaging learning experience that teaches something interesting in a fun way.',
    'values-lessons': 'Create a heartwarming story that teaches important values like kindness, friendship, and helping others.',
    'silly-humor': 'Create a fun, silly story that makes you laugh with unexpected events and playful characters.'
  };

  const genreHelp = genreGuidance[genre] || genreGuidance['fantasy-magic'];

  return `You are a creative storyteller for children aged ${age}. 

${genreHelp}

${ageGuidance}

Write a natural, flowing story (100-200 words) that feels like a real children's book. Make it engaging and age-appropriate.

After the story, provide exactly 3 specific choices that continue the story naturally. The choices should be concrete actions related to what just happened.

Format: Write the story, then add "CHOICES: [Choice 1, Choice 2, Choice 3]" at the end.

Keep everything safe, positive, and inspiring for children.`;
};

const IMAGE_PROMPT_BEAUTIFIER = `Beautiful children's book illustration, digital art, vibrant colors, safe and wholesome, high quality, detailed, magical atmosphere`;

// Mock failsafe story
const MOCK_STORY = {
  text: "Once upon a time, in a magical forest, there lived a friendly little fox named Luna. Luna loved to explore and make new friends. One sunny morning, Luna discovered a beautiful garden filled with colorful flowers and singing birds. The garden was so enchanting that Luna decided to invite all her forest friends to share in its beauty. Together, they had the most wonderful picnic, sharing stories and laughter under the warm sun.",
  choices: ["Explore the garden", "Make new friends", "Share with others"],
  image_url: 'https://via.placeholder.com/400x400/4F46E5/FFFFFF?text=Story+Image',
  is_end: false
}; 