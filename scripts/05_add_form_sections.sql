-- Add form_sections table
CREATE TABLE IF NOT EXISTS form_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id UUID NOT NULL REFERENCES forms(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  "order" INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT unique_section_order_per_form UNIQUE (form_id, "order")
);

-- Add section_id column to form_questions
ALTER TABLE form_questions 
ADD COLUMN IF NOT EXISTS section_id UUID REFERENCES form_sections(id) ON DELETE SET NULL;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_form_sections_form_id ON form_sections(form_id);
CREATE INDEX IF NOT EXISTS idx_form_sections_order ON form_sections(form_id, "order");
CREATE INDEX IF NOT EXISTS idx_form_questions_section_id ON form_questions(section_id);

-- Add RLS policies for form_sections
ALTER TABLE form_sections ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view sections for their own forms
CREATE POLICY "Users can view their own form sections"
  ON form_sections
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM forms
      WHERE forms.id = form_sections.form_id
      AND forms.user_id = auth.uid()
    )
  );

-- Policy: Users can insert sections for their own forms
CREATE POLICY "Users can insert sections for their own forms"
  ON form_sections
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM forms
      WHERE forms.id = form_sections.form_id
      AND forms.user_id = auth.uid()
    )
  );

-- Policy: Users can update sections for their own forms
CREATE POLICY "Users can update sections for their own forms"
  ON form_sections
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM forms
      WHERE forms.id = form_sections.form_id
      AND forms.user_id = auth.uid()
    )
  );

-- Policy: Users can delete sections for their own forms
CREATE POLICY "Users can delete sections for their own forms"
  ON form_sections
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM forms
      WHERE forms.id = form_sections.form_id
      AND forms.user_id = auth.uid()
    )
  );

-- Policy: Public can view sections for published forms
CREATE POLICY "Public can view sections for published forms"
  ON form_sections
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM forms
      WHERE forms.id = form_sections.form_id
      AND forms.status = 'published'
    )
  );
