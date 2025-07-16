import { generateImage, uploadImageToStorage } from "./image.ts";
import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

export async function processImageGeneration(
  segmentId: string,
  storyId: string,
  imagePrompt: string,
  supabaseAdmin: SupabaseClient,
  supabaseClient: SupabaseClient,
  visualContext?: any
) {
  try {
    if (!imagePrompt || imagePrompt.trim() === '') {
      console.log('❌ No image prompt provided, skipping image generation');
      await supabaseAdmin
        .from('story_segments')
        .update({ image_generation_status: 'failed' })
        .eq('id', segmentId);
      return;
    }

    // Update status to in_progress
    console.log('📝 Setting image status to in_progress...');
    const { error: statusError } = await supabaseAdmin
      .from('story_segments')
      .update({ image_generation_status: 'in_progress' })
      .eq('id', segmentId);

    if (statusError) {
      console.error('❌ Failed to update status to in_progress:', statusError);
    } else {
      console.log('✅ Successfully updated status to in_progress');
    }

    console.log('🚀 Generating image with DALL-E-3...');
    const startTime = Date.now();
    
    // Generate image using dynamic provider selection
    const imageBlob = await generateImage(imagePrompt, supabaseAdmin);
    
    const generationTime = Date.now() - startTime;
    console.log(`⏱️ Image generation took: ${generationTime}ms`);
    
    if (!imageBlob) {
      console.error('❌ Failed to generate image with DALL-E-3');
      console.log('📝 Updating status to failed...');
      await supabaseAdmin
        .from('story_segments')
        .update({ image_generation_status: 'failed' })
        .eq('id', segmentId);
      return;
    }

    console.log('📤 Image generated successfully, uploading to storage...');
    console.log('📊 Image blob details:', {
      size: imageBlob.size,
      type: imageBlob.type
    });
    const uploadStartTime = Date.now();
    
    const imageUrl = await uploadImageToStorage(imageBlob, supabaseAdmin);
    
    const uploadTime = Date.now() - uploadStartTime;
    console.log(`⏱️ Image upload took: ${uploadTime}ms`);
    
    console.log('💾 Updating segment with image URL...', imageUrl);
    const { error: updateError } = await supabaseAdmin
      .from('story_segments')
      .update({ 
        image_url: imageUrl,
        image_generation_status: 'completed'
      })
      .eq('id', segmentId);

    if (updateError) {
      console.error('❌ Failed to update segment with image URL:', updateError);
      return;
    }

    // Check if this is the first segment and update story thumbnail if needed
    console.log('🎯 Checking if this is the first segment to update story thumbnail...');
    const { data: segmentData, error: segmentError } = await supabaseAdmin
      .from('story_segments')
      .select('parent_segment_id, story_id')
      .eq('id', segmentId)
      .single();

    if (!segmentError && segmentData && segmentData.parent_segment_id === null) {
      console.log('📸 This is the first segment, updating story thumbnail...');
      const { error: thumbnailError } = await supabaseAdmin
        .from('stories')
        .update({ thumbnail_url: imageUrl })
        .eq('id', segmentData.story_id);

      if (thumbnailError) {
        console.error('❌ Failed to update story thumbnail:', thumbnailError);
      } else {
        console.log('✅ Story thumbnail updated successfully');
      }
    }

    const totalTime = Date.now() - startTime;
    console.log(`✅ Image background task completed successfully for segment ${segmentId}`);
    console.log(`⏱️ Total time: ${totalTime}ms`);
    console.log(`🖼️ Final image URL: ${imageUrl}`);
    
  } catch (error) {
    console.error(`❌ Image background task failed for segment ${segmentId}:`, error);
    console.error('❌ Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    
    // Update status to failed
    try {
      await supabaseAdmin
        .from('story_segments')
        .update({ image_generation_status: 'failed' })
        .eq('id', segmentId);
    } catch (statusError) {
      console.error('❌ Failed to update image generation status to failed:', statusError);
    }
  }
}

// Keep the old function name as an alias for backwards compatibility
export const generateAndUpdateImage = processImageGeneration;
