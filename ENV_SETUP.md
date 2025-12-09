# Environment Variables Setup Guide

## Quick Fix for Current Error

You're getting this error because `SUPABASE_ANON_KEY` is missing from your backend `.env` file.

### Step 1: Find Your Supabase Anon Key

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Go to **Settings** → **API**
4. Copy the **anon/public** key (it starts with `eyJ...`)

### Step 2: Add to Backend .env File

Create or edit `Final-Year-Project/backend/.env` and add:

```env
# Database Connection
DATABASE_URL=postgresql://postgres.cdqppolfiyhkvcqhkivy:12345@aws-1-ap-south-1.pooler.supabase.com:5432/postgres

# Gemini API Key (you already have this)
GEMINI_API_KEY=AIzaSyDIpF...

# Supabase Configuration (ADD THIS!)
SUPABASE_URL=https://cdqppolfiyhkvcqhkivy.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkcXBwb2xmaXloa3ZjcWhraXZ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUyMTEwMjEsImV4cCI6MjA4MDc4NzAyMX0.YOUR_FULL_KEY_HERE

# Server Port
PORT=5000
```

### Step 3: Restart Your Server

After adding the key, restart your backend server:
```bash
cd backend
node server.js
```

## Complete Environment Variables Checklist

### Backend (.env in `backend/` folder)
- ✅ `DATABASE_URL` - PostgreSQL connection string
- ✅ `GEMINI_API_KEY` - Your Gemini API key
- ❌ `SUPABASE_URL` - Your Supabase project URL
- ❌ `SUPABASE_ANON_KEY` - Your Supabase anon/public key (MISSING!)
- ✅ `PORT` - Server port (optional, defaults to 5000)

### Frontend (.env.local in root folder)
- ❌ `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- ❌ `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anon/public key

## Where to Find Supabase Keys

1. **Supabase Dashboard**: https://supabase.com/dashboard
2. Select your project
3. Go to **Settings** → **API**
4. You'll see:
   - **Project URL** → Use for `SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → Use for `SUPABASE_ANON_KEY` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Example .env Files

### backend/.env
```env
DATABASE_URL=postgresql://postgres.cdqppolfiyhkvcqhkivy:12345@aws-1-ap-south-1.pooler.supabase.com:5432/postgres
GEMINI_API_KEY=AIzaSyDIpF...
SUPABASE_URL=https://cdqppolfiyhkvcqhkivy.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkcXBwb2xmaXloa3ZjcWhraXZ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUyMTEwMjEsImV4cCI6MjA4MDc4NzAyMX0.YOUR_FULL_KEY
PORT=5000
```

### .env.local (root folder)
```env
NEXT_PUBLIC_SUPABASE_URL=https://cdqppolfiyhkvcqhkivy.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkcXBwb2xmaXloa3ZjcWhraXZ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUyMTEwMjEsImV4cCI6MjA4MDc4NzAyMX0.YOUR_FULL_KEY
```

## After Setup

Once you've added the `SUPABASE_ANON_KEY` to your backend `.env` file, restart the server and the error should be resolved!

