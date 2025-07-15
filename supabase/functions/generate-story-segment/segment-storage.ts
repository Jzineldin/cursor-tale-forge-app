
export async function saveStorySegment(
  supabaseClient: any,
  storyId: string,
  parentSegmentId: string | undefined,
  storyResult: any,
  choiceText: string | undefined,
  audioUrl: string | null,
  audioStatus: string,
  skipImage: boolean
) {
  const wordCount = storyResult.segmentText?.split(/\s+/).filter((word: string) => word.length > 0).length || 0;

  console.log('💾 Saving segment to database with story_id:', storyId);
  const { data: segment, error } = await supabaseClient
    .from('story_segments')
    .insert({
      story_id: storyId,
      parent_segment_id: parentSegmentId,
      segment_text: storyResult.segmentText,
      image_url: null,
      audio_url: audioUrl,
      choices: storyResult.choices || [],
      triggering_choice_text: choiceText,
      is_end: storyResult.isEnd || false,
      image_generation_status: skipImage ? 'not_started' : 'pending',
      word_count: wordCount,
      audio_generation_status: audioStatus
    })
    .select()
    .single();

  if (error) {
    console.error('❌ Database error:', error);
    throw new Error(`Database error: ${error.message}`);
  }

  console.log('✅ Successfully created segment:', segment.id);
  return segment;
}
