-- Storage policies for the branding assets bucket
-- This allows authenticated users to upload, read, and delete files in the bucket
-- and allows public read access for displaying logos on forms
--
-- IMPORTANT: Replace 'brand' with your actual bucket name if different
-- The bucket name should match NEXT_PUBLIC_STORAGE_BRAND_BUCKET in your .env file
-- Default bucket name: 'brand'

-- Drop existing policies if they exist (to allow re-running this script)
DROP POLICY IF EXISTS "Users can upload to brand bucket" ON storage.objects;
DROP POLICY IF EXISTS "Public can read brand bucket" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete from brand bucket" ON storage.objects;
DROP POLICY IF EXISTS "Users can update brand bucket files" ON storage.objects;

-- Policy: Allow authenticated users to upload files to brand bucket
CREATE POLICY "Users can upload to brand bucket"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'brand');

-- Policy: Allow public read access to brand bucket (for displaying logos on forms)
CREATE POLICY "Public can read brand bucket"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'brand');

-- Policy: Allow authenticated users to delete files from brand bucket
CREATE POLICY "Users can delete from brand bucket"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'brand');

-- Policy: Allow authenticated users to update files in brand bucket
CREATE POLICY "Users can update brand bucket files"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'brand');

-- Note: If your bucket name is different from 'brand', replace all instances of 'brand' 
-- in the above policies with your actual bucket name before running this script.
