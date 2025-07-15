
-- Remove columns from old, broken video features
ALTER TABLE public.stories
DROP COLUMN IF EXISTS replicate_prediction_id,
DROP COLUMN IF EXISTS replicate_video_url,
DROP COLUMN IF EXISTS replicate_video_status,
DROP COLUMN IF EXISTS video_compilation_status,
DROP COLUMN IF EXISTS video_url,
DROP COLUMN IF EXISTS animated_video_status;

-- Add new columns for Shotstack video generation
ALTER TABLE public.stories
ADD COLUMN shotstack_render_id TEXT,
ADD COLUMN shotstack_video_url TEXT,
ADD COLUMN shotstack_status TEXT NOT NULL DEFAULT 'not_started';
