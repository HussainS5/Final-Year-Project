/*
  # Update Profiles Table with Enhanced Fields

  1. Changes to profiles table
    - Add `profile_picture` (text) - URL to profile picture
    - Add `first_name` (text) - User's first name
    - Add `last_name` (text) - User's last name
    - Add `phone_number` (text) - User's phone number
    - Add `date_of_birth` (date) - User's date of birth
    - Add `current_city` (text) - User's current city
    - Add `linkedin_url` (text) - LinkedIn profile URL
    - Add `github_url` (text) - GitHub profile URL
    - Add `account_status` (text) - Account status (active, inactive, pending)
    - Add `current_job` (text) - Current job title/position
    - Add `dream_job` (text) - Dream job or career goal
    - Add `years_of_experience` (integer) - Total years of experience
    - Add `preferred_location` (text) - Preferred job location
    - Add `salary_expectation` (text) - Salary expectation range

  2. Notes
    - All new fields are optional (nullable or with defaults)
    - Maintains backward compatibility with existing data
    - Uses CHECK constraint for account_status values
*/

-- Add new columns to profiles table
DO $$
BEGIN
  -- Profile picture
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'profile_picture'
  ) THEN
    ALTER TABLE profiles ADD COLUMN profile_picture text DEFAULT '';
  END IF;

  -- First name
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'first_name'
  ) THEN
    ALTER TABLE profiles ADD COLUMN first_name text DEFAULT '';
  END IF;

  -- Last name
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'last_name'
  ) THEN
    ALTER TABLE profiles ADD COLUMN last_name text DEFAULT '';
  END IF;

  -- Phone number
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'phone_number'
  ) THEN
    ALTER TABLE profiles ADD COLUMN phone_number text DEFAULT '';
  END IF;

  -- Date of birth
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'date_of_birth'
  ) THEN
    ALTER TABLE profiles ADD COLUMN date_of_birth date;
  END IF;

  -- Current city
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'current_city'
  ) THEN
    ALTER TABLE profiles ADD COLUMN current_city text DEFAULT '';
  END IF;

  -- LinkedIn URL
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'linkedin_url'
  ) THEN
    ALTER TABLE profiles ADD COLUMN linkedin_url text DEFAULT '';
  END IF;

  -- GitHub URL
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'github_url'
  ) THEN
    ALTER TABLE profiles ADD COLUMN github_url text DEFAULT '';
  END IF;

  -- Account status
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'account_status'
  ) THEN
    ALTER TABLE profiles ADD COLUMN account_status text DEFAULT 'active'
      CHECK (account_status IN ('active', 'inactive', 'pending', 'suspended'));
  END IF;

  -- Current job
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'current_job'
  ) THEN
    ALTER TABLE profiles ADD COLUMN current_job text DEFAULT '';
  END IF;

  -- Dream job
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'dream_job'
  ) THEN
    ALTER TABLE profiles ADD COLUMN dream_job text DEFAULT '';
  END IF;

  -- Years of experience
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'years_of_experience'
  ) THEN
    ALTER TABLE profiles ADD COLUMN years_of_experience integer DEFAULT 0;
  END IF;

  -- Preferred location
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'preferred_location'
  ) THEN
    ALTER TABLE profiles ADD COLUMN preferred_location text DEFAULT '';
  END IF;

  -- Salary expectation
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'salary_expectation'
  ) THEN
    ALTER TABLE profiles ADD COLUMN salary_expectation text DEFAULT '';
  END IF;
END $$;

-- Create index for account_status for filtering
CREATE INDEX IF NOT EXISTS idx_profiles_account_status ON profiles(account_status);
