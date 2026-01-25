-- ============================================================================
-- SQL Script to Update form_questions Type Constraint to Include "rating"
-- ============================================================================
-- This script updates the check constraint on form_questions.type to allow
-- the new "rating" question type.
-- ============================================================================

-- First, drop the existing constraint
ALTER TABLE public.form_questions 
DROP CONSTRAINT IF EXISTS form_questions_type_check;

-- Add the updated constraint that includes "rating"
ALTER TABLE public.form_questions 
ADD CONSTRAINT form_questions_type_check 
CHECK (type IN ('single_choice', 'multiple_choice', 'short_text', 'long_text', 'rating'));

-- Verify the constraint was added
DO $$
BEGIN
    RAISE NOTICE 'Constraint updated successfully!';
    RAISE NOTICE 'Allowed question types: single_choice, multiple_choice, short_text, long_text, rating';
END $$;
