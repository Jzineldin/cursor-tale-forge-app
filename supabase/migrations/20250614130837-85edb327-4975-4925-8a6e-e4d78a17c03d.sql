
-- Create a table to store the stories
CREATE TABLE public.stories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create a table to store individual story segments
CREATE TABLE public.story_segments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID NOT NULL REFERENCES public.stories(id) ON DELETE CASCADE,
  parent_segment_id UUID REFERENCES public.story_segments(id) ON DELETE SET NULL,
  triggering_choice_text TEXT,
  segment_text TEXT NOT NULL,
  image_url TEXT NOT NULL,
  choices TEXT[] NOT NULL,
  is_end BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add comments to explain the purpose of the tables and columns
COMMENT ON TABLE public.stories IS 'Stores the main story sessions.';
COMMENT ON TABLE public.story_segments IS 'Stores individual parts of a story, forming a narrative tree.';
COMMENT ON COLUMN public.story_segments.parent_segment_id IS 'The segment from which this segment was generated.';
COMMENT ON COLUMN public.story_segments.triggering_choice_text IS 'The user choice that led to the creation of this segment.';

