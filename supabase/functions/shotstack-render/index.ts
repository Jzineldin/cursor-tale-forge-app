
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const updateStoryShotstackStatus = async (supabaseAdmin: SupabaseClient, storyId: string, status: string, renderId: string | null = null) => {
  const updates: any = { shotstack_status: status };
  if (renderId) {
    updates.shotstack_render_id = renderId;
  }
  const { error } = await supabaseAdmin.from('stories').update(updates).eq('id', storyId);
  if (error) {
    console.error(`Failed to update story ${storyId} shotstack status to ${status}:`, error);
    throw new Error(`Failed to update story status: ${error.message}`);
  }
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const { storyId } = await req.json();
  if (!storyId) {
    return new Response(JSON.stringify({ error: 'storyId is required' }), { status: 400, headers: corsHeaders });
  }

  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  try {
    const { data: storyData, error: storyError } = await supabaseAdmin
      .from('stories')
      .select('title, full_story_audio_url, story_segments(image_url, audio_duration, created_at)')
      .eq('id', storyId)
      .order('created_at', { referencedTable: 'story_segments', ascending: true })
      .single();

    if (storyError) throw new Error(`Failed to fetch story data: ${storyError.message}`);
    if (!storyData?.full_story_audio_url) throw new Error('Story audio URL is missing.');
    if (!storyData?.story_segments || storyData.story_segments.length === 0) throw new Error('Story segments are missing.');

    const audioDuration = storyData.story_segments.reduce((sum, s) => sum + (s.audio_duration || 0), 0);
    if (audioDuration <= 0) throw new Error('Calculated audio duration is zero or less.');

    const imageUrls = storyData.story_segments.map(s => s.image_url);
    const clipLength = audioDuration / imageUrls.length;

    const SHOTSTACK_API_KEY = Deno.env.get('SHOTSTACK_API_KEY');
    if (!SHOTSTACK_API_KEY) throw new Error("SHOTSTACK_API_KEY is not set.");
    
    const WEBHOOK_URL = `${Deno.env.get('SUPABASE_URL')}/functions/v1/shotstack-webhook`;
    
    const payload = {
      timeline: {
        soundtrack: {
          src: storyData.full_story_audio_url,
          effect: "fadeInFadeOut"
        },
        tracks: [
          {
            clips: imageUrls.map((img, i) => ({
              asset: { type: "image", src: img },
              start: i * clipLength,
              length: clipLength,
              transition: { in: "fade", out: "fade" },
              effect: "zoomIn"
            }))
          }
        ]
      },
      output: {
        format: "mp4",
        resolution: "720"
      },
      callback: WEBHOOK_URL
    };

    const response = await fetch("https://api.shotstack.io/stage/render", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": SHOTSTACK_API_KEY
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorBody = await response.json();
      console.error("Shotstack API error:", errorBody);
      throw new Error(`Shotstack API request failed: ${errorBody.message}`);
    }

    const { response: renderResponse } = await response.json();
    
    await updateStoryShotstackStatus(supabaseAdmin, storyId, 'submitted', renderResponse.id);

    return new Response(JSON.stringify({ success: true, renderId: renderResponse.id }), { status: 200, headers: corsHeaders });

  } catch (error) {
    console.error(`Error in shotstack-render for story ${storyId}:`, error);
    await updateStoryShotstackStatus(supabaseAdmin, storyId, 'failed');
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: corsHeaders });
  }
});
