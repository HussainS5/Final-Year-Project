-- Fix Row Level Security (RLS) Policies for Resumes Table
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard → SQL Editor

-- First, check if RLS is enabled (it might not be)
ALTER TABLE resumes ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Allow public inserts" ON resumes;
DROP POLICY IF EXISTS "Allow authenticated inserts" ON resumes;
DROP POLICY IF EXISTS "Allow users to insert own resumes" ON resumes;
DROP POLICY IF EXISTS "Allow users to read own resumes" ON resumes;
DROP POLICY IF EXISTS "Allow users to update own resumes" ON resumes;

-- Option 1: Allow public inserts (for testing - simplest)
-- Uncomment this if you want anyone to upload resumes:
-- CREATE POLICY "Allow public inserts" ON resumes
-- FOR INSERT
-- TO public
-- WITH CHECK (true);

-- Option 2: Allow authenticated users to insert (recommended)
-- This allows any logged-in user to insert resumes
CREATE POLICY "Allow authenticated inserts" ON resumes
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Allow users to read their own resumes
CREATE POLICY "Allow users to read own resumes" ON resumes
FOR SELECT
TO authenticated
USING (true);  -- Change to: USING (auth.uid()::text = user_id::text) for stricter security

-- Allow users to update their own resumes
CREATE POLICY "Allow users to update own resumes" ON resumes
FOR UPDATE
TO authenticated
USING (true);  -- Change to: USING (auth.uid()::text = user_id::text) for stricter security

-- If you're not using Supabase Auth and want to disable RLS temporarily:
-- ALTER TABLE resumes DISABLE ROW LEVEL SECURITY;

