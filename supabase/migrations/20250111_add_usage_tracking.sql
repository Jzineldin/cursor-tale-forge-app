-- Create table for tracking audio generations
CREATE TABLE IF NOT EXISTS audio_generations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  story_id UUID REFERENCES stories(id) ON DELETE CASCADE,
  segment_id UUID REFERENCES story_segments(id) ON DELETE CASCADE,
  character_count INTEGER NOT NULL,
  voice TEXT NOT NULL,
  model TEXT DEFAULT 'tts-1',
  provider TEXT DEFAULT 'openai',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Add model tracking to story_segments
ALTER TABLE story_segments 
ADD COLUMN IF NOT EXISTS model_used TEXT,
ADD COLUMN IF NOT EXISTS provider_used TEXT,
ADD COLUMN IF NOT EXISTS input_tokens INTEGER,
ADD COLUMN IF NOT EXISTS output_tokens INTEGER;

-- Create index for efficient querying
CREATE INDEX IF NOT EXISTS idx_audio_generations_created_at ON audio_generations(created_at);
CREATE INDEX IF NOT EXISTS idx_audio_generations_user_id ON audio_generations(user_id);
CREATE INDEX IF NOT EXISTS idx_story_segments_model_used ON story_segments(model_used);
CREATE INDEX IF NOT EXISTS idx_story_segments_provider_used ON story_segments(provider_used);

-- Add RLS policies
ALTER TABLE audio_generations ENABLE ROW LEVEL SECURITY;

-- Users can only see their own audio generations
CREATE POLICY "Users can view own audio generations" ON audio_generations
  FOR SELECT USING (auth.uid() = user_id);

-- Users can create audio generations for their own stories
CREATE POLICY "Users can create audio generations" ON audio_generations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Admin can see all audio generations
CREATE POLICY "Admin can view all audio generations" ON audio_generations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  ); 