
-- Security Fix 1: Consolidate and Fix RLS Policies
-- Remove redundant policies and ensure comprehensive coverage

-- Drop existing redundant policies on stories table
DROP POLICY IF EXISTS "Public stories are viewable by everyone" ON public.stories;
DROP POLICY IF EXISTS "Users can view their own stories" ON public.stories;
DROP POLICY IF EXISTS "Users can insert their own stories" ON public.stories;
DROP POLICY IF EXISTS "Users can update their own stories" ON public.stories;
DROP POLICY IF EXISTS "Users can delete their own stories" ON public.stories;

-- Create comprehensive RLS policies for stories table
CREATE POLICY "Allow public read access to stories"
ON public.stories FOR SELECT USING (
  is_public = true OR auth.uid() = user_id OR user_id IS NULL
);

CREATE POLICY "Allow authenticated users to create stories"
ON public.stories FOR INSERT WITH CHECK (
  auth.uid() = user_id OR (auth.uid() IS NULL AND user_id IS NULL)
);

CREATE POLICY "Allow users to update their own stories"
ON public.stories FOR UPDATE USING (
  auth.uid() = user_id OR (auth.uid() IS NULL AND user_id IS NULL)
) WITH CHECK (
  auth.uid() = user_id OR (auth.uid() IS NULL AND user_id IS NULL)
);

CREATE POLICY "Allow users to delete their own stories"
ON public.stories FOR DELETE USING (
  auth.uid() = user_id OR (auth.uid() IS NULL AND user_id IS NULL)
);

-- Add input validation function for story content
CREATE OR REPLACE FUNCTION public.validate_story_content()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  -- Validate title length
  IF LENGTH(NEW.title) > 200 THEN
    RAISE EXCEPTION 'Story title cannot exceed 200 characters';
  END IF;
  
  -- Validate description length
  IF NEW.description IS NOT NULL AND LENGTH(NEW.description) > 1000 THEN
    RAISE EXCEPTION 'Story description cannot exceed 1000 characters';
  END IF;
  
  -- Basic XSS prevention - reject obvious script tags
  IF NEW.title ~* '<script|javascript:|vbscript:|onload=|onerror=' THEN
    RAISE EXCEPTION 'Invalid characters detected in story title';
  END IF;
  
  IF NEW.description IS NOT NULL AND NEW.description ~* '<script|javascript:|vbscript:|onload=|onerror=' THEN
    RAISE EXCEPTION 'Invalid characters detected in story description';
  END IF;
  
  RETURN NEW;
END;
$$;

-- Add validation trigger for stories
DROP TRIGGER IF EXISTS validate_story_content_trigger ON public.stories;
CREATE TRIGGER validate_story_content_trigger
  BEFORE INSERT OR UPDATE ON public.stories
  FOR EACH ROW EXECUTE FUNCTION public.validate_story_content();

-- Add input validation for story segments
CREATE OR REPLACE FUNCTION public.validate_segment_content()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  -- Validate segment text length
  IF LENGTH(NEW.segment_text) > 5000 THEN
    RAISE EXCEPTION 'Story segment cannot exceed 5000 characters';
  END IF;
  
  -- Validate choice text length
  IF NEW.choice_text IS NOT NULL AND LENGTH(NEW.choice_text) > 500 THEN
    RAISE EXCEPTION 'Choice text cannot exceed 500 characters';
  END IF;
  
  -- Basic XSS prevention
  IF NEW.segment_text ~* '<script|javascript:|vbscript:|onload=|onerror=' THEN
    RAISE EXCEPTION 'Invalid characters detected in segment text';
  END IF;
  
  IF NEW.choice_text IS NOT NULL AND NEW.choice_text ~* '<script|javascript:|vbscript:|onload=|onerror=' THEN
    RAISE EXCEPTION 'Invalid characters detected in choice text';
  END IF;
  
  -- Validate choices array
  IF NEW.choices IS NOT NULL THEN
    DECLARE
      choice_item TEXT;
    BEGIN
      FOREACH choice_item IN ARRAY NEW.choices
      LOOP
        IF LENGTH(choice_item) > 200 THEN
          RAISE EXCEPTION 'Individual choice cannot exceed 200 characters';
        END IF;
        IF choice_item ~* '<script|javascript:|vbscript:|onload=|onerror=' THEN
          RAISE EXCEPTION 'Invalid characters detected in choice options';
        END IF;
      END LOOP;
    END;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Add validation trigger for story segments
DROP TRIGGER IF EXISTS validate_segment_content_trigger ON public.story_segments;
CREATE TRIGGER validate_segment_content_trigger
  BEFORE INSERT OR UPDATE ON public.story_segments
  FOR EACH ROW EXECUTE FUNCTION public.validate_segment_content();

-- Create audit log table for security monitoring
CREATE TABLE IF NOT EXISTS public.security_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  table_name TEXT NOT NULL,
  record_id UUID,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on audit log
ALTER TABLE public.security_audit_log ENABLE ROW LEVEL SECURITY;

-- Only allow reading audit logs for admin purposes (implement admin check as needed)
CREATE POLICY "Restrict audit log access"
ON public.security_audit_log FOR SELECT USING (false);

-- Create function to log security events
CREATE OR REPLACE FUNCTION public.log_security_event(
  p_action TEXT,
  p_table_name TEXT,
  p_record_id UUID DEFAULT NULL,
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.security_audit_log (
    user_id,
    action,
    table_name,
    record_id,
    ip_address,
    user_agent
  ) VALUES (
    auth.uid(),
    p_action,
    p_table_name,
    p_record_id,
    p_ip_address,
    p_user_agent
  );
END;
$$;
