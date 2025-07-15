
import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";
import { BUCKET_NAME } from './config.ts';

export async function updateSegmentStatus(segmentId: string, status: 'in_progress' | 'completed' | 'failed', supabaseAdmin: SupabaseClient) {
    console.log(`Updating segment ${segmentId} status to '${status}'.`);
    const { error } = await supabaseAdmin
        .from('story_segments')
        .update({ animated_video_status: status })
        .eq('id', segmentId);
    if (error) {
        console.error(`Failed to update segment ${segmentId} status to ${status}:`, error);
    }
}

export async function getSegmentDetails(segmentId: string, supabaseAdmin: SupabaseClient) {
    console.log(`Fetching details for segment ${segmentId}.`);
    const { data: segment, error: segmentError } = await supabaseAdmin
        .from('story_segments')
        .select('id, image_url, story_id, segment_text')
        .eq('id', segmentId)
        .single();

    if (segmentError || !segment) {
        throw new Error(`Failed to fetch segment ${segmentId}: ${segmentError?.message}`);
    }
    console.log(`Fetched segment. Image URL: ${segment.image_url}`);
    if (!segment.image_url || segment.image_url.includes('placeholder.svg')) {
        throw new Error(`Segment ${segmentId} does not have a valid generated image to animate.`);
    }

    return segment;
}

export async function downloadAndUploadVideo(segment: { id: string, story_id: string }, videoUrl: string, supabaseAdmin: SupabaseClient) {
    console.log(`Animation complete for segment ${segment.id}. Fetching video from: ${videoUrl}`);
    const videoResponse = await fetch(videoUrl);
    if (!videoResponse.ok) {
        throw new Error(`Failed to download animated video from ${videoUrl}: ${videoResponse.statusText}`);
    }
    const videoBlob = await videoResponse.blob();
    console.log(`Downloaded video blob for segment ${segment.id}. Size: ${videoBlob.size}`);

    const filePath = `${segment.story_id}/${segment.id}.mp4`;
    console.log(`Uploading video to storage at path: ${filePath}`);
    await supabaseAdmin.storage
      .from(BUCKET_NAME)
      .upload(filePath, videoBlob, {
        contentType: 'video/mp4',
        upsert: true,
      });

    const { data: { publicUrl } } = supabaseAdmin.storage
      .from(BUCKET_NAME)
      .getPublicUrl(filePath);

    return publicUrl;
}

export async function finalizeSegment(segmentId: string, publicUrl: string, supabaseAdmin: SupabaseClient) {
    console.log(`Updating segment ${segmentId} status to 'completed' with URL: ${publicUrl}`);
    await supabaseAdmin
      .from('story_segments')
      .update({
        animated_video_url: publicUrl,
        animated_video_status: 'completed'
      })
      .eq('id', segmentId);
}

export async function handleFailure(segmentId: string, supabaseAdmin: SupabaseClient) {
    await updateSegmentStatus(segmentId, 'failed', supabaseAdmin);

    const { data: segmentForStoryId } = await supabaseAdmin
        .from('story_segments')
        .select('story_id')
        .eq('id', segmentId)
        .single();
    
    if (segmentForStoryId) {
        await supabaseAdmin
            .from('stories')
            .update({ animated_video_status: 'failed' })
            .eq('id', segmentForStoryId.story_id);
    }
}
