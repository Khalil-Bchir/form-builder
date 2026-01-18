-- ============================================================================
-- Create Dummy Form with All Question Types, Multiple Sections, and Responses
-- ============================================================================
-- This script creates a comprehensive test form with:
-- - 4 sections (more than 3)
-- - All question types: short_text, long_text, single_choice, multiple_choice
-- - Multiple choice options for choice questions
-- - Multiple dummy responses with varied answers
-- ============================================================================

DO $$
DECLARE
  v_user_id UUID := '20e85d7b-2476-4487-8500-71eb8fc8b275';
  v_form_id UUID;
  v_section_1_id UUID;
  v_section_2_id UUID;
  v_section_3_id UUID;
  v_section_4_id UUID;
  v_q1_id UUID;
  v_q2_id UUID;
  v_q3_id UUID;
  v_q4_id UUID;
  v_q5_id UUID;
  v_q6_id UUID;
  v_q7_id UUID;
  v_q8_id UUID;
  v_q9_id UUID;
  v_q10_id UUID;
  v_q11_id UUID;
  v_q12_id UUID;
  v_response_id UUID;
BEGIN
  -- ============================================================================
  -- 1. Create the Form
  -- ============================================================================
  INSERT INTO forms (
    id,
    user_id,
    title,
    description,
    slug,
    status,
    theme,
    layout,
    font_family,
    show_progress,
    show_branding,
    created_at,
    updated_at
  ) VALUES (
    gen_random_uuid(),
    v_user_id,
    'Customer Satisfaction Survey - Test Form',
    'A comprehensive survey to test all question types and analytics features',
    'customer-satisfaction-test-' || substr(md5(random()::text), 1, 8),
    'published',
    'light',
    'centered',
    'inter',
    true,
    false,
    NOW() - INTERVAL '30 days',
    NOW() - INTERVAL '30 days'
  )
  RETURNING id INTO v_form_id;
  
  RAISE NOTICE 'Created form with ID: %', v_form_id;
  
  -- ============================================================================
  -- 2. Create Sections (4 sections)
  -- ============================================================================
  
  -- Section 1: Personal Information
  INSERT INTO form_sections (id, form_id, title, description, "order", created_at, updated_at)
  VALUES (
    gen_random_uuid(),
    v_form_id,
    'Personal Information',
    'Please provide your basic contact information',
    1,
    NOW() - INTERVAL '30 days',
    NOW() - INTERVAL '30 days'
  )
  RETURNING id INTO v_section_1_id;
  
  -- Section 2: Product Experience
  INSERT INTO form_sections (id, form_id, title, description, "order", created_at, updated_at)
  VALUES (
    gen_random_uuid(),
    v_form_id,
    'Product Experience',
    'Tell us about your experience with our product',
    2,
    NOW() - INTERVAL '30 days',
    NOW() - INTERVAL '30 days'
  )
  RETURNING id INTO v_section_2_id;
  
  -- Section 3: Service Quality
  INSERT INTO form_sections (id, form_id, title, description, "order", created_at, updated_at)
  VALUES (
    gen_random_uuid(),
    v_form_id,
    'Service Quality',
    'How would you rate our service quality?',
    3,
    NOW() - INTERVAL '30 days',
    NOW() - INTERVAL '30 days'
  )
  RETURNING id INTO v_section_3_id;
  
  -- Section 4: Additional Feedback
  INSERT INTO form_sections (id, form_id, title, description, "order", created_at, updated_at)
  VALUES (
    gen_random_uuid(),
    v_form_id,
    'Additional Feedback',
    'Any additional comments or suggestions?',
    4,
    NOW() - INTERVAL '30 days',
    NOW() - INTERVAL '30 days'
  )
  RETURNING id INTO v_section_4_id;
  
  RAISE NOTICE 'Created 4 sections';
  
  -- ============================================================================
  -- 3. Create Questions (All Types)
  -- ============================================================================
  
  -- SECTION 1: Personal Information
  -- Question 1: Short Text - Full Name
  INSERT INTO form_questions (id, form_id, section_id, type, text, "order", required, options, created_at)
  VALUES (
    gen_random_uuid(),
    v_form_id,
    v_section_1_id,
    'short_text',
    'What is your full name?',
    1,
    true,
    NULL,
    NOW() - INTERVAL '30 days'
  )
  RETURNING id INTO v_q1_id;
  
  -- Question 2: Short Text - Email
  INSERT INTO form_questions (id, form_id, section_id, type, text, "order", required, options, created_at)
  VALUES (
    gen_random_uuid(),
    v_form_id,
    v_section_1_id,
    'short_text',
    'What is your email address?',
    2,
    true,
    NULL,
    NOW() - INTERVAL '30 days'
  )
  RETURNING id INTO v_q2_id;
  
  -- Question 3: Single Choice - Age Range
  INSERT INTO form_questions (id, form_id, section_id, type, text, "order", required, options, created_at)
  VALUES (
    gen_random_uuid(),
    v_form_id,
    v_section_1_id,
    'single_choice',
    'What is your age range?',
    3,
    true,
    '["18-25", "26-35", "36-45", "46-55", "56-65", "65+"]'::jsonb,
    NOW() - INTERVAL '30 days'
  )
  RETURNING id INTO v_q3_id;
  
  -- SECTION 2: Product Experience
  -- Question 4: Single Choice - Product Rating
  INSERT INTO form_questions (id, form_id, section_id, type, text, "order", required, options, created_at)
  VALUES (
    gen_random_uuid(),
    v_form_id,
    v_section_2_id,
    'single_choice',
    'How would you rate our product overall?',
    1,
    true,
    '["Excellent", "Very Good", "Good", "Fair", "Poor"]'::jsonb,
    NOW() - INTERVAL '30 days'
  )
  RETURNING id INTO v_q4_id;
  
  -- Question 5: Multiple Choice - Product Features
  INSERT INTO form_questions (id, form_id, section_id, type, text, "order", required, options, created_at)
  VALUES (
    gen_random_uuid(),
    v_form_id,
    v_section_2_id,
    'multiple_choice',
    'Which features do you find most useful? (Select all that apply)',
    2,
    false,
    '["User-friendly interface", "Fast performance", "Mobile app", "Customer support", "Pricing", "Documentation", "Integration options"]'::jsonb,
    NOW() - INTERVAL '30 days'
  )
  RETURNING id INTO v_q5_id;
  
  -- Question 6: Long Text - Product Experience
  INSERT INTO form_questions (id, form_id, section_id, type, text, "order", required, options, created_at)
  VALUES (
    gen_random_uuid(),
    v_form_id,
    v_section_2_id,
    'long_text',
    'Please describe your overall experience with our product',
    3,
    false,
    NULL,
    NOW() - INTERVAL '30 days'
  )
  RETURNING id INTO v_q6_id;
  
  -- SECTION 3: Service Quality
  -- Question 7: Single Choice - Support Quality
  INSERT INTO form_questions (id, form_id, section_id, type, text, "order", required, options, created_at)
  VALUES (
    gen_random_uuid(),
    v_form_id,
    v_section_3_id,
    'single_choice',
    'How would you rate our customer support?',
    1,
    true,
    '["Excellent", "Very Good", "Good", "Fair", "Poor", "Never used"]'::jsonb,
    NOW() - INTERVAL '30 days'
  )
  RETURNING id INTO v_q7_id;
  
  -- Question 8: Multiple Choice - Support Channels
  INSERT INTO form_questions (id, form_id, section_id, type, text, "order", required, options, created_at)
  VALUES (
    gen_random_uuid(),
    v_form_id,
    v_section_3_id,
    'multiple_choice',
    'Which support channels have you used? (Select all that apply)',
    2,
    false,
    '["Email", "Phone", "Live Chat", "Help Center", "Community Forum", "Social Media"]'::jsonb,
    NOW() - INTERVAL '30 days'
  )
  RETURNING id INTO v_q8_id;
  
  -- Question 9: Short Text - Response Time
  INSERT INTO form_questions (id, form_id, section_id, type, text, "order", required, options, created_at)
  VALUES (
    gen_random_uuid(),
    v_form_id,
    v_section_3_id,
    'short_text',
    'What was the average response time you experienced? (e.g., "2 hours", "1 day")',
    3,
    false,
    NULL,
    NOW() - INTERVAL '30 days'
  )
  RETURNING id INTO v_q9_id;
  
  -- SECTION 4: Additional Feedback
  -- Question 10: Single Choice - Recommendation
  INSERT INTO form_questions (id, form_id, section_id, type, text, "order", required, options, created_at)
  VALUES (
    gen_random_uuid(),
    v_form_id,
    v_section_4_id,
    'single_choice',
    'How likely are you to recommend us to a friend or colleague?',
    1,
    true,
    '["Very Likely", "Likely", "Neutral", "Unlikely", "Very Unlikely"]'::jsonb,
    NOW() - INTERVAL '30 days'
  )
  RETURNING id INTO v_q10_id;
  
  -- Question 11: Multiple Choice - Improvement Areas
  INSERT INTO form_questions (id, form_id, section_id, type, text, "order", required, options, created_at)
  VALUES (
    gen_random_uuid(),
    v_form_id,
    v_section_4_id,
    'multiple_choice',
    'What areas would you like to see improved? (Select all that apply)',
    2,
    false,
    '["User Interface", "Performance", "Features", "Documentation", "Pricing", "Support", "Mobile Experience"]'::jsonb,
    NOW() - INTERVAL '30 days'
  )
  RETURNING id INTO v_q11_id;
  
  -- Question 12: Long Text - Additional Comments
  INSERT INTO form_questions (id, form_id, section_id, type, text, "order", required, options, created_at)
  VALUES (
    gen_random_uuid(),
    v_form_id,
    v_section_4_id,
    'long_text',
    'Do you have any additional comments or suggestions?',
    3,
    false,
    NULL,
    NOW() - INTERVAL '30 days'
  )
  RETURNING id INTO v_q12_id;
  
  RAISE NOTICE 'Created 12 questions (all types)';
  
  -- ============================================================================
  -- 4. Create Dummy Responses and Answers
  -- ============================================================================
  
  -- Response 1: Positive feedback
  INSERT INTO form_responses (id, form_id, source, created_at)
  VALUES (gen_random_uuid(), v_form_id, 'web', NOW() - INTERVAL '25 days')
  RETURNING id INTO v_response_id;
  
  INSERT INTO form_answers (id, response_id, question_id, answer, created_at) VALUES
    (gen_random_uuid(), v_response_id, v_q1_id, 'John Smith', NOW() - INTERVAL '25 days'),
    (gen_random_uuid(), v_response_id, v_q2_id, 'john.smith@example.com', NOW() - INTERVAL '25 days'),
    (gen_random_uuid(), v_response_id, v_q3_id, '26-35', NOW() - INTERVAL '25 days'),
    (gen_random_uuid(), v_response_id, v_q4_id, 'Excellent', NOW() - INTERVAL '25 days'),
    (gen_random_uuid(), v_response_id, v_q5_id, '["User-friendly interface", "Fast performance", "Mobile app"]', NOW() - INTERVAL '25 days'),
    (gen_random_uuid(), v_response_id, v_q6_id, 'I have been using this product for 6 months and it has exceeded my expectations. The interface is intuitive and the performance is outstanding.', NOW() - INTERVAL '25 days'),
    (gen_random_uuid(), v_response_id, v_q7_id, 'Excellent', NOW() - INTERVAL '25 days'),
    (gen_random_uuid(), v_response_id, v_q8_id, '["Email", "Live Chat"]', NOW() - INTERVAL '25 days'),
    (gen_random_uuid(), v_response_id, v_q9_id, '1 hour', NOW() - INTERVAL '25 days'),
    (gen_random_uuid(), v_response_id, v_q10_id, 'Very Likely', NOW() - INTERVAL '25 days'),
    (gen_random_uuid(), v_response_id, v_q11_id, '["Features"]', NOW() - INTERVAL '25 days'),
    (gen_random_uuid(), v_response_id, v_q12_id, 'Keep up the great work!', NOW() - INTERVAL '25 days');
  
  -- Response 2: Mixed feedback
  INSERT INTO form_responses (id, form_id, source, created_at)
  VALUES (gen_random_uuid(), v_form_id, 'web', NOW() - INTERVAL '22 days')
  RETURNING id INTO v_response_id;
  
  INSERT INTO form_answers (id, response_id, question_id, answer, created_at) VALUES
    (gen_random_uuid(), v_response_id, v_q1_id, 'Sarah Johnson', NOW() - INTERVAL '22 days'),
    (gen_random_uuid(), v_response_id, v_q2_id, 'sarah.j@example.com', NOW() - INTERVAL '22 days'),
    (gen_random_uuid(), v_response_id, v_q3_id, '36-45', NOW() - INTERVAL '22 days'),
    (gen_random_uuid(), v_response_id, v_q4_id, 'Good', NOW() - INTERVAL '22 days'),
    (gen_random_uuid(), v_response_id, v_q5_id, '["Customer support", "Pricing"]', NOW() - INTERVAL '22 days'),
    (gen_random_uuid(), v_response_id, v_q6_id, 'The product is decent but could use some improvements in the mobile experience.', NOW() - INTERVAL '22 days'),
    (gen_random_uuid(), v_response_id, v_q7_id, 'Good', NOW() - INTERVAL '22 days'),
    (gen_random_uuid(), v_response_id, v_q8_id, '["Phone", "Help Center"]', NOW() - INTERVAL '22 days'),
    (gen_random_uuid(), v_response_id, v_q9_id, '4 hours', NOW() - INTERVAL '22 days'),
    (gen_random_uuid(), v_response_id, v_q10_id, 'Likely', NOW() - INTERVAL '22 days'),
    (gen_random_uuid(), v_response_id, v_q11_id, '["Mobile Experience", "Performance"]', NOW() - INTERVAL '22 days'),
    (gen_random_uuid(), v_response_id, v_q12_id, 'Would love to see better mobile optimization.', NOW() - INTERVAL '22 days');
  
  -- Response 3: Negative feedback
  INSERT INTO form_responses (id, form_id, source, created_at)
  VALUES (gen_random_uuid(), v_form_id, 'qr', NOW() - INTERVAL '20 days')
  RETURNING id INTO v_response_id;
  
  INSERT INTO form_answers (id, response_id, question_id, answer, created_at) VALUES
    (gen_random_uuid(), v_response_id, v_q1_id, 'Michael Brown', NOW() - INTERVAL '20 days'),
    (gen_random_uuid(), v_response_id, v_q2_id, 'm.brown@example.com', NOW() - INTERVAL '20 days'),
    (gen_random_uuid(), v_response_id, v_q3_id, '46-55', NOW() - INTERVAL '20 days'),
    (gen_random_uuid(), v_response_id, v_q4_id, 'Fair', NOW() - INTERVAL '20 days'),
    (gen_random_uuid(), v_response_id, v_q5_id, '["Documentation"]', NOW() - INTERVAL '20 days'),
    (gen_random_uuid(), v_response_id, v_q6_id, 'I found the product difficult to use initially. The documentation could be more comprehensive.', NOW() - INTERVAL '20 days'),
    (gen_random_uuid(), v_response_id, v_q7_id, 'Fair', NOW() - INTERVAL '20 days'),
    (gen_random_uuid(), v_response_id, v_q8_id, '["Email"]', NOW() - INTERVAL '20 days'),
    (gen_random_uuid(), v_response_id, v_q9_id, '2 days', NOW() - INTERVAL '20 days'),
    (gen_random_uuid(), v_response_id, v_q10_id, 'Neutral', NOW() - INTERVAL '20 days'),
    (gen_random_uuid(), v_response_id, v_q11_id, '["Documentation", "User Interface"]', NOW() - INTERVAL '20 days'),
    (gen_random_uuid(), v_response_id, v_q12_id, 'Please improve the documentation and make the UI more intuitive.', NOW() - INTERVAL '20 days');
  
  -- Response 4: Very positive
  INSERT INTO form_responses (id, form_id, source, created_at)
  VALUES (gen_random_uuid(), v_form_id, 'web', NOW() - INTERVAL '18 days')
  RETURNING id INTO v_response_id;
  
  INSERT INTO form_answers (id, response_id, question_id, answer, created_at) VALUES
    (gen_random_uuid(), v_response_id, v_q1_id, 'Emily Davis', NOW() - INTERVAL '18 days'),
    (gen_random_uuid(), v_response_id, v_q2_id, 'emily.davis@example.com', NOW() - INTERVAL '18 days'),
    (gen_random_uuid(), v_response_id, v_q3_id, '26-35', NOW() - INTERVAL '18 days'),
    (gen_random_uuid(), v_response_id, v_q4_id, 'Excellent', NOW() - INTERVAL '18 days'),
    (gen_random_uuid(), v_response_id, v_q5_id, '["User-friendly interface", "Fast performance", "Mobile app", "Customer support", "Integration options"]', NOW() - INTERVAL '18 days'),
    (gen_random_uuid(), v_response_id, v_q6_id, 'This is the best product I have used in years. Everything works perfectly and the customer support is top-notch!', NOW() - INTERVAL '18 days'),
    (gen_random_uuid(), v_response_id, v_q7_id, 'Excellent', NOW() - INTERVAL '18 days'),
    (gen_random_uuid(), v_response_id, v_q8_id, '["Email", "Live Chat", "Phone"]', NOW() - INTERVAL '18 days'),
    (gen_random_uuid(), v_response_id, v_q9_id, '30 minutes', NOW() - INTERVAL '18 days'),
    (gen_random_uuid(), v_response_id, v_q10_id, 'Very Likely', NOW() - INTERVAL '18 days'),
    (gen_random_uuid(), v_response_id, v_q11_id, '[]', NOW() - INTERVAL '18 days'),
    (gen_random_uuid(), v_response_id, v_q12_id, 'No suggestions, everything is perfect!', NOW() - INTERVAL '18 days');
  
  -- Response 5: Average feedback
  INSERT INTO form_responses (id, form_id, source, created_at)
  VALUES (gen_random_uuid(), v_form_id, 'qr', NOW() - INTERVAL '15 days')
  RETURNING id INTO v_response_id;
  
  INSERT INTO form_answers (id, response_id, question_id, answer, created_at) VALUES
    (gen_random_uuid(), v_response_id, v_q1_id, 'David Wilson', NOW() - INTERVAL '15 days'),
    (gen_random_uuid(), v_response_id, v_q2_id, 'd.wilson@example.com', NOW() - INTERVAL '15 days'),
    (gen_random_uuid(), v_response_id, v_q3_id, '36-45', NOW() - INTERVAL '15 days'),
    (gen_random_uuid(), v_response_id, v_q4_id, 'Very Good', NOW() - INTERVAL '15 days'),
    (gen_random_uuid(), v_response_id, v_q5_id, '["Fast performance", "Pricing"]', NOW() - INTERVAL '15 days'),
    (gen_random_uuid(), v_response_id, v_q6_id, 'Good product overall, meets my needs.', NOW() - INTERVAL '15 days'),
    (gen_random_uuid(), v_response_id, v_q7_id, 'Very Good', NOW() - INTERVAL '15 days'),
    (gen_random_uuid(), v_response_id, v_q8_id, '["Live Chat"]', NOW() - INTERVAL '15 days'),
    (gen_random_uuid(), v_response_id, v_q9_id, '3 hours', NOW() - INTERVAL '15 days'),
    (gen_random_uuid(), v_response_id, v_q10_id, 'Likely', NOW() - INTERVAL '15 days'),
    (gen_random_uuid(), v_response_id, v_q11_id, '["Pricing"]', NOW() - INTERVAL '15 days'),
    (gen_random_uuid(), v_response_id, v_q12_id, 'Consider offering more flexible pricing plans.', NOW() - INTERVAL '15 days');
  
  -- Response 6: Recent positive
  INSERT INTO form_responses (id, form_id, source, created_at)
  VALUES (gen_random_uuid(), v_form_id, 'web', NOW() - INTERVAL '10 days')
  RETURNING id INTO v_response_id;
  
  INSERT INTO form_answers (id, response_id, question_id, answer, created_at) VALUES
    (gen_random_uuid(), v_response_id, v_q1_id, 'Lisa Anderson', NOW() - INTERVAL '10 days'),
    (gen_random_uuid(), v_response_id, v_q2_id, 'lisa.a@example.com', NOW() - INTERVAL '10 days'),
    (gen_random_uuid(), v_response_id, v_q3_id, '18-25', NOW() - INTERVAL '10 days'),
    (gen_random_uuid(), v_response_id, v_q4_id, 'Very Good', NOW() - INTERVAL '10 days'),
    (gen_random_uuid(), v_response_id, v_q5_id, '["User-friendly interface", "Mobile app", "Integration options"]', NOW() - INTERVAL '10 days'),
    (gen_random_uuid(), v_response_id, v_q6_id, 'Really enjoying the product, especially the mobile app!', NOW() - INTERVAL '10 days'),
    (gen_random_uuid(), v_response_id, v_q7_id, 'Very Good', NOW() - INTERVAL '10 days'),
    (gen_random_uuid(), v_response_id, v_q8_id, '["Live Chat", "Community Forum"]', NOW() - INTERVAL '10 days'),
    (gen_random_uuid(), v_response_id, v_q9_id, '2 hours', NOW() - INTERVAL '10 days'),
    (gen_random_uuid(), v_response_id, v_q10_id, 'Very Likely', NOW() - INTERVAL '10 days'),
    (gen_random_uuid(), v_response_id, v_q11_id, '["Mobile Experience"]', NOW() - INTERVAL '10 days'),
    (gen_random_uuid(), v_response_id, v_q12_id, 'The mobile app is great but could use a few more features.', NOW() - INTERVAL '10 days');
  
  -- Response 7: Very recent
  INSERT INTO form_responses (id, form_id, source, created_at)
  VALUES (gen_random_uuid(), v_form_id, 'qr', NOW() - INTERVAL '5 days')
  RETURNING id INTO v_response_id;
  
  INSERT INTO form_answers (id, response_id, question_id, answer, created_at) VALUES
    (gen_random_uuid(), v_response_id, v_q1_id, 'Robert Taylor', NOW() - INTERVAL '5 days'),
    (gen_random_uuid(), v_response_id, v_q2_id, 'robert.t@example.com', NOW() - INTERVAL '5 days'),
    (gen_random_uuid(), v_response_id, v_q3_id, '56-65', NOW() - INTERVAL '5 days'),
    (gen_random_uuid(), v_response_id, v_q4_id, 'Good', NOW() - INTERVAL '5 days'),
    (gen_random_uuid(), v_response_id, v_q5_id, '["Customer support", "Documentation"]', NOW() - INTERVAL '5 days'),
    (gen_random_uuid(), v_response_id, v_q6_id, 'Solid product with good documentation.', NOW() - INTERVAL '5 days'),
    (gen_random_uuid(), v_response_id, v_q7_id, 'Good', NOW() - INTERVAL '5 days'),
    (gen_random_uuid(), v_response_id, v_q8_id, '["Help Center"]', NOW() - INTERVAL '5 days'),
    (gen_random_uuid(), v_response_id, v_q9_id, '1 day', NOW() - INTERVAL '5 days'),
    (gen_random_uuid(), v_response_id, v_q10_id, 'Neutral', NOW() - INTERVAL '5 days'),
    (gen_random_uuid(), v_response_id, v_q11_id, '["Features"]', NOW() - INTERVAL '5 days'),
    (gen_random_uuid(), v_response_id, v_q12_id, 'Would like to see more advanced features.', NOW() - INTERVAL '5 days');
  
  -- Response 8: Most recent
  INSERT INTO form_responses (id, form_id, source, created_at)
  VALUES (gen_random_uuid(), v_form_id, 'web', NOW() - INTERVAL '1 day')
  RETURNING id INTO v_response_id;
  
  INSERT INTO form_answers (id, response_id, question_id, answer, created_at) VALUES
    (gen_random_uuid(), v_response_id, v_q1_id, 'Jennifer Martinez', NOW() - INTERVAL '1 day'),
    (gen_random_uuid(), v_response_id, v_q2_id, 'j.martinez@example.com', NOW() - INTERVAL '1 day'),
    (gen_random_uuid(), v_response_id, v_q3_id, '26-35', NOW() - INTERVAL '1 day'),
    (gen_random_uuid(), v_response_id, v_q4_id, 'Excellent', NOW() - INTERVAL '1 day'),
    (gen_random_uuid(), v_response_id, v_q5_id, '["User-friendly interface", "Fast performance", "Mobile app", "Customer support"]', NOW() - INTERVAL '1 day'),
    (gen_random_uuid(), v_response_id, v_q6_id, 'Amazing product! I use it daily and it has improved my workflow significantly.', NOW() - INTERVAL '1 day'),
    (gen_random_uuid(), v_response_id, v_q7_id, 'Excellent', NOW() - INTERVAL '1 day'),
    (gen_random_uuid(), v_response_id, v_q8_id, '["Email", "Live Chat", "Phone", "Help Center"]', NOW() - INTERVAL '1 day'),
    (gen_random_uuid(), v_response_id, v_q9_id, '45 minutes', NOW() - INTERVAL '1 day'),
    (gen_random_uuid(), v_response_id, v_q10_id, 'Very Likely', NOW() - INTERVAL '1 day'),
    (gen_random_uuid(), v_response_id, v_q11_id, '[]', NOW() - INTERVAL '1 day'),
    (gen_random_uuid(), v_response_id, v_q12_id, 'This product is perfect for my needs. Thank you!', NOW() - INTERVAL '1 day');
  
  RAISE NOTICE 'Created 8 responses with answers';
  RAISE NOTICE 'Form creation completed successfully!';
  RAISE NOTICE 'Form ID: %', v_form_id;
  
END $$;

-- ============================================================================
-- Summary Query
-- ============================================================================
SELECT 
  'Form created successfully!' as status,
  f.id as form_id,
  f.title as form_title,
  f.slug as form_slug,
  (SELECT COUNT(*) FROM form_sections WHERE form_id = f.id) as total_sections,
  (SELECT COUNT(*) FROM form_questions WHERE form_id = f.id) as total_questions,
  (SELECT COUNT(*) FROM form_responses WHERE form_id = f.id) as total_responses,
  (SELECT COUNT(*) FROM form_answers WHERE response_id IN (SELECT id FROM form_responses WHERE form_id = f.id)) as total_answers
FROM forms f
WHERE f.user_id = '20e85d7b-2476-4487-8500-71eb8fc8b275'::uuid
ORDER BY f.created_at DESC
LIMIT 1;
