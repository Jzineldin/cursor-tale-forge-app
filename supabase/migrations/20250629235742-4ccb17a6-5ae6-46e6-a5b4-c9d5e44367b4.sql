
-- Only create handle_new_user function if it doesn't exist
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name')
  ON CONFLICT (id) DO NOTHING;  -- Don't fail if profile already exists
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Only create trigger if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT FROM pg_trigger 
        WHERE tgname = 'on_auth_user_created'
    ) THEN
        CREATE TRIGGER on_auth_user_created
          AFTER INSERT ON auth.users
          FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
    END IF;
END $$;

-- Only create handle_updated_at function if it doesn't exist
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers only if they don't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT FROM pg_trigger 
        WHERE tgname = 'handle_updated_at' AND tgrelid = 'public.profiles'::regclass
    ) THEN
        CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.profiles
          FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
    END IF;
    
    IF NOT EXISTS (
        SELECT FROM pg_trigger 
        WHERE tgname = 'handle_updated_at' AND tgrelid = 'public.stories'::regclass
    ) THEN
        CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.stories
          FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
    END IF;
END $$;
