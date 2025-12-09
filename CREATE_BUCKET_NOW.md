# ⚠️ URGENT: Create Storage Bucket NOW

## The Error
```
"Bucket not found" - Status 404
Request: POST /storage/v1/object/resumes/9/1765305208424.pdf
```

## Quick Fix (2 minutes)

### Method 1: Supabase Dashboard ⭐ EASIEST

1. **Open Supabase Dashboard**
   - Go to: https://supabase.com/dashboard
   - Select your project: `cdqppolfiyhkvcqhkivy`

2. **Create Bucket**
   - Click **"Storage"** in the left sidebar
   - Click the **"New bucket"** button (top right)
   - **Bucket name**: Type `resumes` (exactly, lowercase)
   - **Public bucket**: ✅ Check this box
   - Click **"Create bucket"**

3. **Verify**
   - You should see `resumes` in the buckets list
   - Try uploading a resume again

### Method 2: SQL Editor (1 minute)

1. **Open SQL Editor**
   - In Supabase Dashboard → Click **"SQL Editor"** (left sidebar)
   - Click **"New query"**

2. **Copy and Paste This SQL:**
   ```sql
   INSERT INTO storage.buckets (id, name, public)
   VALUES ('resumes', 'resumes', true)
   ON CONFLICT (id) DO NOTHING;
   ```

3. **Run It**
   - Click the **"Run"** button (or press `Ctrl+Enter`)
   - You should see "Success. No rows returned"

4. **Verify**
   - Go to **Storage** → **Buckets**
   - You should see `resumes` listed
   - Try uploading a resume again

## Why This Happens

The code tries to upload to bucket `resumes`, but it doesn't exist yet. You only need to create it **once**.

## After Creating

Once the bucket exists:
- ✅ Resume uploads will work
- ✅ Files will be stored at: `resumes/{user_id}/{timestamp}.pdf`
- ✅ Backend can download files for parsing

## Still Not Working?

1. **Check bucket name**: Must be exactly `resumes` (lowercase)
2. **Check if bucket is public**: Should be checked
3. **Refresh browser**: Clear cache and try again
4. **Check browser console**: Look for other errors

---

**Once you create the bucket, the upload will work immediately!** 🚀

