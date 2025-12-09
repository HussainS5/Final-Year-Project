-- User Profiles and Resume Upload System
-- Run this script in your Supabase SQL Editor to set up the database

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE,
  full_name text NOT NULL DEFAULT '',
  email text UNIQUE,
  phone text DEFAULT '',
  location text DEFAULT '',
  current_title text DEFAULT '',
  experience_years integer DEFAULT 0,
  bio text DEFAULT '',
  skills jsonb DEFAULT '[]'::jsonb,
  education jsonb DEFAULT '[]'::jsonb,
  work_experience jsonb DEFAULT '[]'::jsonb,
  avatar_url text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create resumes table
CREATE TABLE IF NOT EXISTS resumes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  file_name text NOT NULL,
  file_size integer DEFAULT 0,
  file_type text DEFAULT '',
  file_url text DEFAULT '',
  parsed_data jsonb DEFAULT '{}'::jsonb,
  upload_date timestamptz DEFAULT now(),
  status text DEFAULT 'uploaded' CHECK (status IN ('uploaded', 'processing', 'parsed', 'error'))
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE resumes ENABLE ROW LEVEL SECURITY;

-- Profiles policies (allowing public access for demo)
DROP POLICY IF EXISTS "Anyone can view profiles" ON profiles;
CREATE POLICY "Anyone can view profiles"
  ON profiles FOR SELECT
  TO public
  USING (true);

DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  TO public
  WITH CHECK (true);

DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

-- Resumes policies (allowing public access for demo)
DROP POLICY IF EXISTS "Anyone can view resumes" ON resumes;
CREATE POLICY "Anyone can view resumes"
  ON resumes FOR SELECT
  TO public
  USING (true);

DROP POLICY IF EXISTS "Users can insert resumes" ON resumes;
CREATE POLICY "Users can insert resumes"
  ON resumes FOR INSERT
  TO public
  WITH CHECK (true);

DROP POLICY IF EXISTS "Users can update resumes" ON resumes;
CREATE POLICY "Users can update resumes"
  ON resumes FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Users can delete resumes" ON resumes;
CREATE POLICY "Users can delete resumes"
  ON resumes FOR DELETE
  TO public
  USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_resumes_profile_id ON resumes(profile_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for profiles
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
