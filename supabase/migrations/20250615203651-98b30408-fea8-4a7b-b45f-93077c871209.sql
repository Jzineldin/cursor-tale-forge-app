
-- Temporarily disable the login requirement by adding permissive RLS policies.
-- These policies can be dropped later to restore the original login requirement.

-- 1. Allow creating stories without a user account.
CREATE POLICY "Allow anonymous story creation"
ON public.stories FOR INSERT WITH CHECK (user_id IS NULL);

-- 2. Allow anyone to read stories that don't have an owner.
CREATE POLICY "Allow anonymous story reading"
ON public.stories FOR SELECT USING (user_id IS NULL);

-- 3. Allow creating story segments for anonymous stories.
CREATE POLICY "Allow anonymous segment creation"
ON public.story_segments FOR INSERT WITH CHECK (
    (SELECT user_id FROM public.stories WHERE id = story_id) IS NULL
);

-- 4. Allow anyone to read story segments belonging to anonymous stories.
CREATE POLICY "Allow anonymous segment reading"
ON public.story_segments FOR SELECT USING (
    (SELECT user_id FROM public.stories WHERE id = story_id) IS NULL
);
