# Supabase Storage Bucket Setup Guide

## Error: "Bucket not found"

This error occurs because the `resumes` storage bucket doesn't exist in your Supabase project yet.

## Solution: Create the Storage Bucket

### Option 1: Using Supabase Dashboard (Easiest)

1. **Go to Supabase Dashboard**
   - Visit: https://supabase.com/dashboard
   - Select your project

2. **Navigate to Storage**
   - Click on **Storage** in the left sidebar
   - Click **New bucket** button

3. **Create the Bucket**
   - **Name**: `resumes` (exactly this name, lowercase)
   - **Public bucket**: ✅ Check this box (or configure RLS policies)
   - Click **Create bucket**

4. **Configure Bucket Settings** (Optional but Recommended)
   - Go to **Policies** tab
   - Create policies to allow uploads:
     - **Policy Name**: "Allow authenticated uploads"
     - **Allowed operation**: INSERT
     - **Target roles**: authenticated
     - **Policy definition**: 
       ```sql
       (bucket_id = 'resumes')
       ```

### Option 2: Using SQL Editor

1. **Go to SQL Editor** in Supabase Dashboard
2. **Run this SQL**:

```sql
-- Create the resumes bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('resumes', 'resumes', true)
ON CONFLICT (id) DO NOTHING;

-- Create policy for authenticated users to upload
CREATE POLICY "Allow authenticated uploads"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'resumes');

-- Create policy for authenticated users to read their own files
CREATE POLICY "Allow authenticated reads"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'resumes');

-- Create policy for authenticated users to delete their own files
CREATE POLICY "Allow authenticated deletes"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'resumes');
```

### Option 3: Make Bucket Public (Simplest for Testing)

If you want to make it completely public (for testing only):

1. Create bucket named `resumes`
2. Set it to **Public**
3. No policies needed (but not recommended for production)

## Verify Bucket Creation

After creating the bucket:

1. Go to **Storage** → **Buckets**
2. You should see `resumes` bucket listed
3. Try uploading a file manually to test

## Test the Upload Again

Once the bucket is created:

1. Restart your Next.js dev server if needed
2. Try uploading a resume again
3. The "bucket not found" error should be resolved

## Troubleshooting

### Still getting "bucket not found"?

1. **Check bucket name**: Must be exactly `resumes` (lowercase, no spaces)
2. **Check Supabase project**: Make sure you're using the correct project
3. **Check environment variables**: Verify `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are correct
4. **Check browser console**: Look for more detailed error messages

### Permission Errors?

If you get permission errors after creating the bucket:

1. Make sure the bucket is set to **Public** OR
2. Add proper RLS policies (see Option 2 above)
3. Verify your Supabase anon key has the correct permissions

## Next Steps

After creating the bucket:
- ✅ Resume uploads should work
- ✅ Files will be stored in `resumes/{user_id}/{timestamp}.pdf`
- ✅ Backend can download files for parsing

