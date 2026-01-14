-- Add customization fields to forms table
ALTER TABLE forms 
ADD COLUMN IF NOT EXISTS theme TEXT DEFAULT 'light' CHECK (theme IN ('light', 'dark', 'auto')),
ADD COLUMN IF NOT EXISTS layout TEXT DEFAULT 'centered' CHECK (layout IN ('centered', 'wide', 'full')),
ADD COLUMN IF NOT EXISTS font_family TEXT DEFAULT 'inter',
ADD COLUMN IF NOT EXISTS background_color TEXT DEFAULT '#ffffff',
ADD COLUMN IF NOT EXISTS button_style TEXT DEFAULT 'default' CHECK (button_style IN ('default', 'rounded', 'pill', 'outline')),
ADD COLUMN IF NOT EXISTS button_color TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS show_progress BOOLEAN DEFAULT true,
-- Branding and Contact fields
ADD COLUMN IF NOT EXISTS company_name TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS company_logo_url TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS contact_email TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS contact_phone TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS website_url TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS show_branding BOOLEAN DEFAULT false;

-- Add index for theme if needed
CREATE INDEX IF NOT EXISTS idx_forms_theme ON forms(theme);
