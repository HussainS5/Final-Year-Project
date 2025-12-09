# Fix: Database RLS Policy for resumes Table

## The Problem
✅ **Storage upload is working!** (200 OK)
❌ **Database insert is failing** (401 Unauthorized)

Error:
```
"new row violates row-level security policy for table \"resumes\""
```

This means the `resumes` **database table** needs RLS policies.

## Quick Fix

Run this SQL in Supabase SQL Editor:

```sql
-- Enable RLS
ALTER TABLE resumes ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Allow public inserts" ON resumes;
DROP POLICY IF EXISTS "Allow authenticated inserts" ON resumes;

-- Allow public inserts (since you're not using Supabase Auth)
CREATE POLICY "Allow public inserts" ON resumes
FOR INSERT
TO public
WITH CHECK (true);

-- Allow public reads
CREATE POLICY "Allow public reads" ON resumes
FOR SELECT
TO public
USING (true);

-- Allow public updates
CREATE POLICY "Allow public updates" ON resumes
FOR UPDATE
TO public
USING (true);
```

## Complete Solution

Run this full SQL:

```sql
-- Enable RLS
ALTER TABLE resumes ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DROP POLICY IF EXISTS "Allow public inserts" ON resumes;
DROP POLICY IF EXISTS "Allow authenticated inserts" ON resumes;
DROP POLICY IF EXISTS "Allow public reads" ON resumes;
DROP POLICY IF EXISTS "Allow authenticated reads" ON resumes;
DROP POLICY IF EXISTS "Allow public updates" ON resumes;
DROP POLICY IF EXISTS "Allow authenticated updates" ON resumes;

-- Create public policies (for testing without auth)
CREATE POLICY "Allow public inserts" ON resumes
FOR INSERT
TO public
WITH CHECK (true);

CREATE POLICY "Allow public reads" ON resumes
FOR SELECT
TO public
USING (true);

CREATE POLICY "Allow public updates" ON resumes
FOR UPDATE
TO public
USING (true);

-- Also create authenticated policies (for future use)
CREATE POLICY "Allow authenticated inserts" ON resumes
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Allow authenticated reads" ON resumes
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Allow authenticated updates" ON resumes
FOR UPDATE
TO authenticated
USING (true);
```

## Step-by-Step

1. **Go to Supabase Dashboard**
   - https://supabase.com/dashboard
   - Select your project

2. **Open SQL Editor**
   - Click "SQL Editor" → "New query"

3. **Copy and Paste the SQL Above**

4. **Run It**
   - Click "Run" (or press `Ctrl+Enter`)
   - Should see "Success"

5. **Try Uploading Again**
   - Both storage AND database should work now!

## What's Happening

1. ✅ **Storage upload** - Working (200 OK)
2. ❌ **Database insert** - Failing (needs RLS policies)
3. After fix: ✅ Both should work!

## Verify Policies

To check what policies exist:

```sql
SELECT 
    policyname,
    cmd,
    roles
FROM pg_policies
WHERE tablename = 'resumes';
```

## After Running

Once you run the SQL:
- ✅ Storage uploads will work (already working)
- ✅ Database inserts will work (will work after this)
- ✅ Resume upload flow will complete successfully!

## Complete Script

I've created: `scripts/fix-resumes-table-rls.sql`

This script includes all necessary database RLS policies.

