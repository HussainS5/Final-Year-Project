# Fix: "new row violates row-level security policy" Error

## The Problem
You're getting a **403 Unauthorized** error:
```
"new row violates row-level security policy"
```

This happens because the `resumes` table has Row Level Security (RLS) enabled, but there are no policies allowing inserts.

## Quick Fix (Choose One)

### Option 1: Allow Public Inserts (Simplest for Testing)

Run this SQL in Supabase SQL Editor:

```sql
-- Enable RLS
ALTER TABLE resumes ENABLE ROW LEVEL SECURITY;

-- Allow public inserts
CREATE POLICY "Allow public inserts" ON resumes
FOR INSERT
TO public
WITH CHECK (true);
```

### Option 2: Allow Authenticated Users (Recommended)

Run this SQL:

```sql
-- Enable RLS
ALTER TABLE resumes ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to insert
CREATE POLICY "Allow authenticated inserts" ON resumes
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Allow authenticated users to read
CREATE POLICY "Allow authenticated reads" ON resumes
FOR SELECT
TO authenticated
USING (true);

-- Allow authenticated users to update
CREATE POLICY "Allow authenticated updates" ON resumes
FOR UPDATE
TO authenticated
USING (true);
```

### Option 3: Disable RLS Temporarily (Quick Test)

If you just want to test quickly:

```sql
ALTER TABLE resumes DISABLE ROW LEVEL SECURITY;
```

**⚠️ Warning:** Only use this for testing. Re-enable RLS for production.

## Step-by-Step Instructions

1. **Go to Supabase Dashboard**
   - Visit: https://supabase.com/dashboard
   - Select your project

2. **Open SQL Editor**
   - Click **"SQL Editor"** in the left sidebar
   - Click **"New query"**

3. **Copy and Paste One of the SQL Options Above**

4. **Run the SQL**
   - Click **"Run"** button (or press `Ctrl+Enter`)
   - You should see "Success"

5. **Try Uploading Again**
   - The 403 error should be gone
   - Resume upload should work

## Complete SQL Script

I've created a complete script at: `scripts/fix-rls-policies.sql`

You can copy the entire file and run it in SQL Editor.

## Verify It Works

After running the SQL:
1. Try uploading a resume again
2. Check the `resumes` table in Supabase
3. You should see your resume record

## For Production

In production, you should use stricter policies:

```sql
-- Only allow users to insert their own resumes
CREATE POLICY "Users insert own resumes" ON resumes
FOR INSERT
TO authenticated
WITH CHECK (auth.uid()::text = user_id::text);

-- Only allow users to read their own resumes
CREATE POLICY "Users read own resumes" ON resumes
FOR SELECT
TO authenticated
USING (auth.uid()::text = user_id::text);
```

But for now, the simpler policies above will work for testing.

