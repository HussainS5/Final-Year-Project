# Fix: Storage "403 Unauthorized" Error

## The Problem
You're getting a **403 error** when trying to upload files to Supabase Storage:
```
Request URL: .../storage/v1/object/resumes/9/1765306178031.pdf
Status: 403 Unauthorized
"new row violates row-level security policy"
```

**This is a STORAGE policy issue, not a database table issue!**

## Quick Fix

Run this SQL in Supabase SQL Editor:

```sql
-- Allow public uploads to resumes bucket
CREATE POLICY "Allow public uploads"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'resumes');

-- Allow public reads from resumes bucket
CREATE POLICY "Allow public reads"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'resumes');
```

## Complete Solution (Recommended)

Run this complete SQL script:

```sql
-- Drop existing policies first
DROP POLICY IF EXISTS "Allow public uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow public reads" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated reads" ON storage.objects;

-- Allow public uploads (for testing)
CREATE POLICY "Allow public uploads"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'resumes');

-- Allow public reads
CREATE POLICY "Allow public reads"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'resumes');

-- Allow authenticated uploads
CREATE POLICY "Allow authenticated uploads"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'resumes');

-- Allow authenticated reads
CREATE POLICY "Allow authenticated reads"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'resumes');

-- Make sure bucket is public
UPDATE storage.buckets
SET public = true
WHERE id = 'resumes';
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
   - The 403 error should be gone!

## Important Notes

- **Storage policies** are different from **database RLS policies**
- Storage policies control file uploads/downloads
- Database RLS policies control table inserts/reads
- You need BOTH working for resume uploads to work

## Verify Storage Policies

To see what storage policies exist:

```sql
SELECT 
    policyname,
    cmd,
    roles,
    qual,
    with_check
FROM pg_policies
WHERE schemaname = 'storage' AND tablename = 'objects';
```

## After Running

Once you run the SQL:
- ✅ File uploads to Storage will work
- ✅ The 403 error will be resolved
- ✅ Resume uploads should complete successfully

## Complete Script

I've created: `scripts/fix-storage-policies.sql`

This script includes all necessary storage policies.

