# Quick Fix: "Bucket not found" Error

## The Problem
When you click "Upload Resume", you get: **"Bucket not found"**

This happens because the Supabase Storage bucket `resumes` doesn't exist yet.

## Quick Solution (Choose One)

### Option 1: Using Supabase Dashboard (2 minutes) ⭐ RECOMMENDED

1. **Go to Supabase Dashboard**
   - Visit: https://supabase.com/dashboard
   - Select your project

2. **Create Storage Bucket**
   - Click **Storage** in left sidebar
   - Click **New bucket** button
   - **Name**: `resumes` (exactly this, lowercase)
   - **Public bucket**: ✅ Check this box
   - Click **Create bucket**

3. **Done!** Try uploading again.

### Option 2: Using SQL Editor (1 minute)

1. **Go to SQL Editor**
   - In Supabase Dashboard → **SQL Editor** (left sidebar)
   - Click **New query**

2. **Copy and paste this SQL**:
   ```sql
   INSERT INTO storage.buckets (id, name, public)
   VALUES ('resumes', 'resumes', true)
   ON CONFLICT (id) DO NOTHING;
   ```

3. **Click Run** (or press Ctrl+Enter)

4. **Done!** Try uploading again.

## Verify It Works

After creating the bucket:

1. Go to **Storage** → **Buckets**
2. You should see `resumes` listed
3. Try uploading a resume file again
4. The error should be gone!

## Still Having Issues?

- Make sure bucket name is exactly `resumes` (lowercase, no spaces)
- Make sure bucket is set to **Public** (or add RLS policies)
- Check browser console for more detailed errors
- Restart your Next.js dev server

