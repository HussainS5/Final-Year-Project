-- Fix RLS Policies for resumes TABLE (not storage)
-- Storage is working, but database insert is failing
-- Run this in Supabase SQL Editor

-- First, check if RLS is enabled
ALTER TABLE resumes ENABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies to start fresh
DROP POLICY IF EXISTS "Allow public inserts" ON resumes;
DROP POLICY IF EXISTS "Allow authenticated inserts" ON resumes;
DROP POLICY IF EXISTS "Allow users to insert own resumes" ON resumes;
DROP POLICY IF EXISTS "Allow authenticated reads" ON resumes;
DROP POLICY IF EXISTS "Allow users to read own resumes" ON resumes;
DROP POLICY IF EXISTS "Allow authenticated updates" ON resumes;
DROP POLICY IF EXISTS "Allow users to update own resumes" ON resumes;

-- Create policies that allow inserts (since you're not using Supabase Auth)
-- Option 1: Allow public inserts (simplest for now)
CREATE POLICY "Allow public inserts" ON resumes
FOR INSERT
TO public
WITH CHECK (true);

-- Option 2: Also allow authenticated (if you add auth later)
CREATE POLICY "Allow authenticated inserts" ON resumes
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Allow reads
CREATE POLICY "Allow public reads" ON resumes
FOR SELECT
TO public
USING (true);

CREATE POLICY "Allow authenticated reads" ON resumes
FOR SELECT
TO authenticated
USING (true);

-- Allow updates
CREATE POLICY "Allow public updates" ON resumes
FOR UPDATE
TO public
USING (true);

CREATE POLICY "Allow authenticated updates" ON resumes
FOR UPDATE
TO authenticated
USING (true);

-- Verify policies were created
SELECT 
    policyname,
    cmd,
    roles,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'resumes';

