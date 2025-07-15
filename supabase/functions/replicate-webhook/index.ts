
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const updateStoryOnWebhook = async (supabaseAdmin: SupabaseClient, prediction: any) => {
    const predictionId = prediction.id;
    if (!predictionId) {
        console.error("Webhook received without prediction ID.");
        return;
    }

    const { data: story, error: findError } = await supabaseAdmin
        .from('stories')
        .select('id')
        .eq('replicate_prediction_id', predictionId)
        .single();
    
    if (findError || !story) {
        console.error(`Webhook received for unknown prediction ID: ${predictionId}.`, findError);
        return;
    }
    
    const storyId = story.id;
    let status = 'failed';
    let videoUrl = null;

    if (prediction.status === 'succeeded') {
        status = 'completed';
        videoUrl = prediction.output[0]; // Output is an array of URLs
        console.log(`Replicate video completed for story ${storyId}. URL: ${videoUrl}`);
    } else {
        console.error(`Replicate video failed for story ${storyId}. Error: ${prediction.error}`);
    }

    const { error: updateError } = await supabaseAdmin
        .from('stories')
        .update({
            replicate_video_status: status,
            replicate_video_url: videoUrl,
        })
        .eq('id', storyId);

    if (updateError) {
        console.error(`Failed to update story ${storyId} from webhook:`, updateError);
    }
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: corsHeaders });
  }
    
  try {
    const supabaseAdmin = createClient(
        Deno.env.get('SUPABASE_URL')!,
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );
    
    const payload = await req.json();
    console.log("Received Replicate webhook:", JSON.stringify(payload, null, 2));
    
    // Using waitUntil to process the webhook in the background
    (globalThis as any).EdgeRuntime.waitUntil(updateStoryOnWebhook(supabaseAdmin, payload));

    return new Response(JSON.stringify({ success: true }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' }});

  } catch (error) {
    console.error('Error processing Replicate webhook:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500, headers: corsHeaders });
  }
});
