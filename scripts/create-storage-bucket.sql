-- Create the resumes storage bucket in Supabase
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard → SQL Editor

-- Create the bucket (if it doesn't exist)
INSERT INTO storage.buckets (id, name, public)
VALUES ('resumes', 'resumes', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload files
CREATE POLICY "Allow authenticated uploads"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'resumes');

-- Allow authenticated users to read files
CREATE POLICY "Allow authenticated reads"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'resumes');

-- Allow authenticated users to delete their own files
CREATE POLICY "Allow authenticated deletes"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'resumes');

-- Allow public access (for testing - remove in production)
-- If you want public access, uncomment these:
-- CREATE POLICY "Allow public uploads"
-- ON storage.objects FOR INSERT
-- TO public
-- WITH CHECK (bucket_id = 'resumes');

-- CREATE POLICY "Allow public reads"
-- ON storage.objects FOR SELECT
-- TO public
-- USING (bucket_id = 'resumes');

