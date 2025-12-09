# Database Setup Instructions

## Setup Supabase Database

The resume upload functionality requires database tables to be created in Supabase.

### Step 1: Access Supabase SQL Editor

1. Go to your Supabase project dashboard: https://0ec90b57d6e95fcbda19832f.supabase.co
2. Navigate to the SQL Editor in the left sidebar
3. Create a new query

### Step 2: Run the Database Script

Copy and paste the SQL from `scripts/setup-database.sql` into the SQL Editor and execute it.

This will create:
- **profiles table**: Stores user profile information extracted from resumes
- **resumes table**: Stores resume metadata and parsed data
- **RLS policies**: Enables Row Level Security for data protection
- **Indexes**: Optimizes query performance
- **Triggers**: Auto-updates timestamps

### Step 3: Verify Tables

After running the script, verify the tables were created:
1. Go to "Table Editor" in Supabase
2. You should see `profiles` and `resumes` tables

## How the Upload Flow Works

1. User clicks "Upload Resume" button on Home page or Profile page
2. Modal opens where user can drag & drop or browse for PDF/DOC/DOCX file
3. File is validated (type and size checks)
4. Mock data extraction simulates AI parsing (ready for real AI integration later)
5. Profile is created in `profiles` table with extracted data
6. Resume metadata is stored in `resumes` table
7. Profile ID is saved to localStorage
8. User is redirected to Profile page showing their information

## Features Implemented

✅ Resume upload modal with drag & drop
✅ File validation (PDF, DOC, DOCX, max 5MB)
✅ Upload progress indicator
✅ Profile auto-creation from resume data
✅ Profile page with complete information display
✅ Profile tab in navigation
✅ Database integration with Supabase
✅ Mock data parsing (ready for AI integration)

## Next Steps (AI Integration)

The current implementation uses mock data. To integrate real AI parsing:

1. Replace mock data in `ResumeUploadModal.jsx` with actual file upload to storage
2. Send file to AI parsing service (OpenAI, custom ML model, etc.)
3. Extract structured data from resume
4. Store parsed data in the same database format

The database schema is already designed to support this workflow!
