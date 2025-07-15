
-- Fix the validate_segment_content() function to use the correct column name
CREATE OR REPLACE FUNCTION public.validate_segment_content()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  -- Validate segment text length
  IF LENGTH(NEW.segment_text) > 5000 THEN
    RAISE EXCEPTION 'Story segment cannot exceed 5000 characters';
  END IF;
  
  -- Validate triggering choice text length (fixed column name)
  IF NEW.triggering_choice_text IS NOT NULL AND LENGTH(NEW.triggering_choice_text) > 500 THEN
    RAISE EXCEPTION 'Triggering choice text cannot exceed 500 characters';
  END IF;
  
  -- Basic XSS prevention
  IF NEW.segment_text ~* '<script|javascript:|vbscript:|onload=|onerror=' THEN
    RAISE EXCEPTION 'Invalid characters detected in segment text';
  END IF;
  
  IF NEW.triggering_choice_text IS NOT NULL AND NEW.triggering_choice_text ~* '<script|javascript:|vbscript:|onload=|onerror=' THEN
    RAISE EXCEPTION 'Invalid characters detected in triggering choice text';
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
