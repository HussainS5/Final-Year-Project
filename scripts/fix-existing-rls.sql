-- Fix Existing RLS Policies for Resumes Table
-- Run this in Supabase SQL Editor to fix the "policy already exists" error

-- First, drop all existing policies
DROP POLICY IF EXISTS "Allow authenticated inserts" ON resumes;
DROP POLICY IF EXISTS "Allow authenticated reads" ON resumes;
DROP POLICY IF EXISTS "Allow authenticated updates" ON resumes;
DROP POLICY IF EXISTS "Allow public inserts" ON resumes;
DROP POLICY IF EXISTS "Allow users to insert own resumes" ON resumes;
DROP POLICY IF EXISTS "Allow users to read own resumes" ON resumes;
DROP POLICY IF EXISTS "Allow users to update own resumes" ON resumes;

-- Now create the policies fresh
-- Allow authenticated users to insert resumes
CREATE POLICY "Allow authenticated inserts" ON resumes
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Allow authenticated users to read resumes
CREATE POLICY "Allow authenticated reads" ON resumes
FOR SELECT
TO authenticated
USING (true);

-- Allow authenticated users to update resumes
CREATE POLICY "Allow authenticated updates" ON resumes
FOR UPDATE
TO authenticated
USING (true);

-- Verify RLS is enabled
ALTER TABLE resumes ENABLE ROW LEVEL SECURITY;

-- Check if policies were created (this will show in the results)
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'resumes';

