
ALTER TABLE public.stories ADD COLUMN title TEXT;
COMMENT ON COLUMN public.stories.title IS 'The title of the story, often derived from the initial prompt.';
