
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getSegmentDetails, updateSegmentStatus, downloadAndUploadVideo, finalizeSegment, handleFailure } from './supabase-ops.ts';
import { startAnimation, pollForCompletion } from './replicate-ops.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

serve(async (req) => {
  console.log("animate-story-segment function started.");
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  let segmentId: string | null = null;

  try {
    const body = await req.json();
    segmentId = body.segmentId;

    if (!segmentId) {
      console.error("animate-story-segment error: Missing segmentId in request body.");
      return new Response(JSON.stringify({ error: "Missing segmentId" }), { status: 400 });
    }

    console.log(`animate-story-segment: Processing segmentId: ${segmentId}`);

    await updateSegmentStatus(segmentId, 'in_progress', supabaseAdmin);

    const segment = await getSegmentDetails(segmentId, supabaseAdmin);
    
    const initialPrediction = await startAnimation(segment.image_url!);
    
    const videoUrl = await pollForCompletion(initialPrediction);

    const publicUrl = await downloadAndUploadVideo(segment, videoUrl, supabaseAdmin);

    await finalizeSegment(segment.id, publicUrl, supabaseAdmin);

    console.log(`animate-story-segment: Successfully processed segment ${segmentId}.`);
    return new Response(JSON.stringify({ success: true, publicUrl }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error(`Error in animate-story-segment for ${segmentId}:`, error);
    const errorDetails = {
      message: error.message,
      stack: error.stack,
      cause: error.cause,
      name: error.name,
    };
    console.error(`Stringified error details: ${JSON.stringify(errorDetails, null, 2)}`);
    
    if (segmentId) {
        await handleFailure(segmentId, supabaseAdmin);
    }
    
    return new Response(JSON.stringify({ error: { message: error.message } }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
