-- ============================================================================
-- SQL Script to Create "Expérience Café – Avis Client" Form
-- ============================================================================
-- This script creates a complete form with 7 questions:
-- Questions 1-5: Single choice questions
-- Question 6: Multiple choice question
-- Question 7: Rating question (5 stars)
--
-- IMPORTANT: 
-- 1. Make sure to run the update_question_type_constraint.sql script FIRST
--    if the "rating" type is not yet allowed in your database
-- 2. Replace 'YOUR_USER_ID_HERE' with your actual user UUID (already done below)
-- ============================================================================

-- First, ensure the constraint allows "rating" type
DO $$
BEGIN
    -- Check if constraint exists and includes rating
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_constraint 
        WHERE conname = 'form_questions_type_check' 
        AND pg_get_constraintdef(oid) LIKE '%rating%'
    ) THEN
        -- Drop existing constraint if it doesn't include rating
        ALTER TABLE public.form_questions 
        DROP CONSTRAINT IF EXISTS form_questions_type_check;
        
        -- Add updated constraint with rating
        ALTER TABLE public.form_questions 
        ADD CONSTRAINT form_questions_type_check 
        CHECK (type IN ('single_choice', 'multiple_choice', 'short_text', 'long_text', 'rating'));
        
        RAISE NOTICE 'Updated constraint to include rating type';
    ELSE
        RAISE NOTICE 'Constraint already includes rating type';
    END IF;
END $$;

-- Now create the form
DO $$
DECLARE
    v_form_id UUID;
    v_section_id UUID;
    v_user_id UUID := '20e85d7b-2476-4487-8500-71eb8fc8b275'; 
BEGIN
    -- ============================================================================
    -- 1. Create the Form
    -- ============================================================================
    INSERT INTO public.forms (
        id,
        user_id,
        title,
        description,
        slug,
        status,
        created_at,
        updated_at,
        background_color,
        button_color,
        button_style,
        color,
        font_family,
        layout,
        show_branding,
        show_progress,
        theme
    )
    VALUES (
        gen_random_uuid(),
        v_user_id,
        '✨ Expérience Café – Avis Client ✨',
        'Évaluez votre expérience avec notre café et laissez-nous vos impressions.',
        'experience-cafe-avis-client',
        'draft', -- Set to 'published' if you want it immediately available
        NOW(),
        NOW(),
        '#ffffff',
        '#3b82f6',
        'default',
        '#3b82f6',
        'inter',
        'centered',
        FALSE,
        TRUE,
        'light'
    )
    RETURNING id INTO v_form_id;

    RAISE NOTICE 'Created Form with ID: %', v_form_id;

    -- ============================================================================
    -- 2. Create Form Section (using Roman numeral I. as per requirements)
    -- ============================================================================
    INSERT INTO public.form_sections (
        id,
        form_id,
        title,
        "order",
        description,
        created_at,
        updated_at
    )
    VALUES (
        gen_random_uuid(),
        v_form_id,
        'Évaluation Détaillée du Café',
        1,
        'Veuillez évaluer les différents aspects de votre expérience.',
        NOW(),
        NOW()
    )
    RETURNING id INTO v_section_id;

    RAISE NOTICE 'Created Section with ID: %', v_section_id;

    -- ============================================================================
    -- 3. Create Questions (Ordered 1-7)
    -- ============================================================================

    -- Question 1: Le Packaging (L'élégance de l'emballage) - single_choice
    INSERT INTO public.form_questions (
        id,
        form_id,
        section_id,
        text,
        type,
        "order",
        required,
        options,
        created_at
    )
    VALUES (
        gen_random_uuid(),
        v_form_id,
        v_section_id,
        'Le Packaging (L''élégance de l''emballage)',
        'single_choice',
        1,
        TRUE,
        '["Excellent", "Satisfaisant", "À améliorer"]'::jsonb,
        NOW()
    );

    -- Question 2: Le Goût (Richesse & Équilibre) - single_choice
    INSERT INTO public.form_questions (
        id,
        form_id,
        section_id,
        text,
        type,
        "order",
        required,
        options,
        created_at
    )
    VALUES (
        gen_random_uuid(),
        v_form_id,
        v_section_id,
        'Le Goût (Richesse & Équilibre)',
        'single_choice',
        2,
        TRUE,
        '["Exceptionnel", "Agréable", "Décevant"]'::jsonb,
        NOW()
    );

    -- Question 3: L'Arôme (Intensité & finesse) - single_choice
    INSERT INTO public.form_questions (
        id,
        form_id,
        section_id,
        text,
        type,
        "order",
        required,
        options,
        created_at
    )
    VALUES (
        gen_random_uuid(),
        v_form_id,
        v_section_id,
        'L''Arôme (Intensité & finesse)',
        'single_choice',
        3,
        TRUE,
        '["Raffiné", "Modéré", "Faible"]'::jsonb,
        NOW()
    );

    -- Question 4: La Torréfaction (Maîtrise & précision) - single_choice
    INSERT INTO public.form_questions (
        id,
        form_id,
        section_id,
        text,
        type,
        "order",
        required,
        options,
        created_at
    )
    VALUES (
        gen_random_uuid(),
        v_form_id,
        v_section_id,
        'La Torréfaction (Maîtrise & précision)',
        'single_choice',
        4,
        TRUE,
        '["Parfaite", "Correcte", "Inadaptée"]'::jsonb,
        NOW()
    );

    -- Question 5: Le Rapport Qualité / Prix - single_choice
    INSERT INTO public.form_questions (
        id,
        form_id,
        section_id,
        text,
        type,
        "order",
        required,
        options,
        created_at
    )
    VALUES (
        gen_random_uuid(),
        v_form_id,
        v_section_id,
        'Le Rapport Qualité / Prix',
        'single_choice',
        5,
        TRUE,
        '["Justifié", "Acceptable", "Élevé"]'::jsonb,
        NOW()
    );

    -- Question 6: Cette expérience vous donne envie de : - multiple_choice
    INSERT INTO public.form_questions (
        id,
        form_id,
        section_id,
        text,
        type,
        "order",
        required,
        options,
        created_at
    )
    VALUES (
        gen_random_uuid(),
        v_form_id,
        v_section_id,
        'Cette expérience vous donne envie de :',
        'multiple_choice',
        6,
        TRUE,
        '["Recommander ce café", "Le racheter", "Le découvrir davantage"]'::jsonb,
        NOW()
    );

    -- Question 7: Note globale - rating (5 stars)
    -- For rating type, store max stars in options as ["5"]
    INSERT INTO public.form_questions (
        id,
        form_id,
        section_id,
        text,
        type,
        "order",
        required,
        options,
        created_at
    )
    VALUES (
        gen_random_uuid(),
        v_form_id,
        v_section_id,
        'Note globale',
        'rating',
        7,
        TRUE,
        '["5"]'::jsonb, -- Max 5 stars for rating
        NOW()
    );

    RAISE NOTICE 'Form created successfully with 7 questions!';
    RAISE NOTICE 'Form ID: %', v_form_id;
    RAISE NOTICE 'Section ID: %', v_section_id;
    RAISE NOTICE '';
    RAISE NOTICE 'To publish the form, run:';
    RAISE NOTICE 'UPDATE public.forms SET status = ''published'' WHERE id = ''%'';', v_form_id;

END $$;
