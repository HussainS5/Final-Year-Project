# Fix: "policy already exists" Error

## The Problem
You're getting:
```
ERROR: 42710: policy "Allow authenticated inserts" for table "resumes" already exists
```

This means the policy exists but might be misconfigured or conflicting.

## Solution: Drop and Recreate

Run this SQL in Supabase SQL Editor:

```sql
-- Drop all existing policies first
DROP POLICY IF EXISTS "Allow authenticated inserts" ON resumes;
DROP POLICY IF EXISTS "Allow authenticated reads" ON resumes;
DROP POLICY IF EXISTS "Allow authenticated updates" ON resumes;
DROP POLICY IF EXISTS "Allow public inserts" ON resumes;

-- Now create them fresh
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

-- Make sure RLS is enabled
ALTER TABLE resumes ENABLE ROW LEVEL SECURITY;
```

## Step-by-Step

1. **Go to Supabase Dashboard**
   - https://supabase.com/dashboard
   - Select your project

2. **Open SQL Editor**
   - Click "SQL Editor" → "New query"

3. **Copy the SQL Above and Run It**

4. **Verify**
   - You should see "Success" message
   - Try uploading a resume again

## Alternative: Check Existing Policies

If you want to see what policies exist first:

```sql
SELECT 
    policyname,
    cmd,
    roles,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'resumes';
```

This will show you all existing policies so you can see what's there.

## Complete Script

I've created a complete script at: `scripts/fix-existing-rls.sql`

This script:
- Drops all existing policies
- Creates fresh policies
- Verifies RLS is enabled
- Shows you what policies exist

## After Running

Once you run the SQL:
- ✅ The "policy already exists" error will be gone
- ✅ The 403 error should be resolved
- ✅ Resume uploads should work

