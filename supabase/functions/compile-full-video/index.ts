
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";
import Replicate from "https://esm.sh/replicate@0.29.1";

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Helper to update story status
const updateVideoStatus = async (supabaseAdmin: SupabaseClient, storyId: string, status: 'in_progress' | 'completed' | 'failed', videoUrl: string | null = null) => {
  const updates: { video_compilation_status: string; video_url?: string } = { video_compilation_status: status };
  if (videoUrl) {
    updates.video_url = videoUrl;
  }
  const { error } = await supabaseAdmin.from('stories').update(updates).eq('id', storyId);
  if (error) {
    console.error(`[compile-full-video] Failed to update story ${storyId} status to ${status}:`, error);
  }
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  let storyId: string | null = null;
  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  try {
    const body = await req.json();
    storyId = body.storyId;

    if (!storyId) {
      throw new Error("Missing storyId in request body");
    }

    console.log(`[compile-full-video] Received request for storyId: ${storyId}`);
    
    await updateVideoStatus(supabaseAdmin, storyId, 'in_progress');

    // 1. Fetch story data: audio URL and all segment images
    const { data: storyData, error: fetchError } = await supabaseAdmin
      .from('stories')
      .select('full_story_audio_url, story_segments(image_url)')
      .eq('id', storyId)
      .order('created_at', { foreignTable: 'story_segments', ascending: true })
      .single();

    if (fetchError) throw new Error(`Failed to fetch story data: ${fetchError.message}`);
    if (!storyData?.full_story_audio_url) {
      throw new Error("Story does not have a generated audio narration. Please generate audio first.");
    }
    if (!storyData.story_segments || storyData.story_segments.length === 0) {
        throw new Error("No story segments with images found.");
    }
    
    const segments = storyData.story_segments as { image_url: string }[];
    const imageUrls = segments.map(s => s.image_url);
    const audioUrl = storyData.full_story_audio_url;

    // 2. Call Replicate to generate slideshow video
    console.log(`[compile-full-video] Calling Replicate 'another-ai-artist/tiktok-video-generator'...`);
    const replicate = new Replicate({ auth: Deno.env.get('REPLICATE_API_KEY')! });

    // Using another, more reliable slideshow model
    const replicateOutput = await replicate.run(
      "another-ai-artist/tiktok-video-generator:1a6033285347262c585f1a3a411da703957452d352b2f67606346a0767c9c0d5",
      {
        input: {
          image_urls: imageUrls.join(','), // This model uses a comma separator
          audio_url: audioUrl,
        }
      }
    );

    const generatedVideoUrl = (replicateOutput as string[])?.[0];
    if (!generatedVideoUrl) {
      throw new Error("Replicate did not return a video URL.");
    }
    console.log(`[compile-full-video] Replicate generated video URL: ${generatedVideoUrl}`);

    // 3. Download the video
    const videoResponse = await fetch(generatedVideoUrl);
    if (!videoResponse.ok) throw new Error(`Failed to download generated video from ${generatedVideoUrl}`);
    const videoBlob = await videoResponse.blob();

    // 4. Upload to Supabase Storage
    const filePath = `full_video_${storyId}_${Date.now()}.mp4`;
    console.log(`[compile-full-video] Uploading video to storage at: ${filePath}`);
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from('story-videos')
      .upload(filePath, videoBlob, { contentType: 'video/mp4', upsert: false });

    if (uploadError) throw new Error(`Failed to upload video to storage: ${uploadError.message}`);
    
    // 5. Get public URL and update story
    const { data: { publicUrl } } = supabaseAdmin.storage.from('story-videos').getPublicUrl(uploadData.path);
    console.log(`[compile-full-video] Compilation complete. Final URL: ${publicUrl}`);
    
    await updateVideoStatus(supabaseAdmin, storyId, 'completed', publicUrl);

    return new Response(JSON.stringify({ success: true, videoUrl: publicUrl }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error("[compile-full-video] Main function error:", error);
    if (storyId) {
      await updateVideoStatus(supabaseAdmin, storyId, 'failed');
    }
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
