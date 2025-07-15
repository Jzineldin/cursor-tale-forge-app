
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  try {
    const { id, status, url } = await req.json();

    if (!id || !status) {
      return new Response(JSON.stringify({ error: 'Missing id or status' }), { status: 400 });
    }

    const updates: { shotstack_status: string; shotstack_video_url?: string } = {
      shotstack_status: status
    };

    if (status === 'done' && url) {
      updates.shotstack_video_url = url;
    }
    
    const { error } = await supabaseAdmin
      .from('stories')
      .update(updates)
      .eq('shotstack_render_id', id);

    if (error) {
      console.error(`Webhook: Failed to update story for renderId ${id}:`, error);
      return new Response(JSON.stringify({ error: 'Database update failed' }), { status: 500 });
    }

    return new Response(JSON.stringify({ success: true }), { status: 200 });

  } catch (error) {
    console.error('Error processing Shotstack webhook:', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
});
