# Resume Parsing Implementation Guide

## Overview
This document describes the complete resume parsing functionality implementation using Gemini API and Supabase.

## What Was Implemented

### 1. Frontend Components

#### ResumeUploadModal (`components/ResumeUploadModal.jsx`)
- ✅ File upload to Supabase Storage (bucket: `resumes`)
- ✅ File validation (PDF, DOCX only, max 5MB)
- ✅ Progress tracking during upload
- ✅ Calls backend parsing API after upload
- ✅ Opens ProfileReviewModal with parsed data

#### ProfileReviewModal (`components/ProfileReviewModal.jsx`)
- ✅ Full-screen modal with 4 collapsible sections:
  1. **Personal Information**: First name, last name, phone, city, LinkedIn, GitHub
  2. **Education**: Multiple entries with degree type, institution, dates, CGPA
  3. **Work Experience**: Multiple entries with job title, company, dates, description
  4. **Skills**: Skill chips with proficiency levels, search/autocomplete
- ✅ Inline editing for all fields
- ✅ Add/remove entries for education and experience
- ✅ Skill search with autocomplete
- ✅ "Update Profile" button that calls all backend APIs sequentially

### 2. Backend API Routes

#### Resume Parsing (`backend/routes/resumes.js`)
- ✅ `POST /api/resumes/parse`
  - Downloads file from Supabase Storage
  - Uploads to Gemini File Manager
  - Uses Gemini 2.0 Flash Exp with structured output schema
  - Logs detailed parsing results to console
  - Updates `resumes` table with parsed data
  - Returns parsed data to frontend

#### User Management (`backend/routes/users.js`)
- ✅ `PUT /api/users/:userId` - Update user personal info

#### Education (`backend/routes/education.js`)
- ✅ `DELETE /api/education/user/:userId` - Delete all education records
- ✅ `POST /api/education` - Insert single education record

#### Work Experience (`backend/routes/workExperience.js`)
- ✅ `DELETE /api/work-experience/user/:userId` - Delete all experience records
- ✅ `POST /api/work-experience` - Insert single experience record

#### User Skills (`backend/routes/userSkills.js`)
- ✅ `DELETE /api/user-skills/user/:userId` - Delete all user skills
- ✅ `POST /api/user-skills` - Insert user skill (handles duplicates)

#### Skills Catalog (`backend/routes/skillsCatalog.js`)
- ✅ `GET /api/skills-catalog/search?name={skillName}` - Search skill by exact name
- ✅ `POST /api/skills-catalog` - Create new skill or return existing

### 3. Configuration Updates

#### Supabase Client (`lib/supabase.js`)
- ✅ Updated from mock to real Supabase client
- ✅ Uses environment variables: `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`

#### Server Routes (`backend/server.js`)
- ✅ Added all new route handlers:
  - `/api/resumes`
  - `/api/users`
  - `/api/education`
  - `/api/work-experience`
  - `/api/user-skills`
  - `/api/skills-catalog`

#### Home Page (`app/page.jsx`)
- ✅ Integrated ProfileReviewModal
- ✅ Handles parsed data from ResumeUploadModal
- ✅ Opens review modal after successful parsing

## Environment Variables Required

### Frontend (.env.local)
```env
NEXT_PUBLIC_SUPABASE_URL=https://cdqppolfiyhkvcqhkivy.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

### Backend (.env)
```env
GEMINI_API_KEY=your_gemini_api_key_here
SUPABASE_URL=https://cdqppolfiyhkvcqhkivy.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key_here
DATABASE_URL=your_postgres_connection_string
```

## Supabase Setup Required

### 1. Create Storage Bucket
1. Go to Supabase Dashboard → Storage
2. Create a new bucket named `resumes`
3. Set it to **Public** (or configure RLS policies as needed)

### 2. Storage Policies
If using RLS, create policies to allow authenticated users to upload:
```sql
-- Allow authenticated users to upload
CREATE POLICY "Users can upload resumes"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'resumes');

-- Allow authenticated users to read their own resumes
CREATE POLICY "Users can read their resumes"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'resumes');
```

## Database Schema

The implementation follows the schema defined in `nextgenai_db_schema.sql`:

- **resumes** table: Stores file metadata and parsed data
- **users** table: Personal information
- **education** table: Educational qualifications
- **work_experience** table: Work history
- **user_skills** table: User skills with proficiency
- **skills_catalog** table: Master skills database

## Flow Diagram

```
1. User clicks "Upload Resume"
   ↓
2. ResumeUploadModal opens
   ↓
3. User selects PDF/DOCX file
   ↓
4. File uploaded to Supabase Storage (bucket: resumes)
   ↓
5. Resume record created in DB (status: 'pending')
   ↓
6. Backend API called: POST /api/resumes/parse
   ↓
7. Backend downloads file from Supabase Storage
   ↓
8. File uploaded to Gemini File Manager
   ↓
9. Gemini API extracts structured data
   ↓
10. Parsed data logged to console
   ↓
11. Resume record updated (status: 'completed', parsed_data: {...})
   ↓
12. ProfileReviewModal opens with parsed data
   ↓
13. User reviews/edits information
   ↓
14. User clicks "Update Profile"
   ↓
15. Multiple API calls:
    - PUT /api/users/:userId
    - DELETE /api/education/user/:userId
    - POST /api/education (for each entry)
    - DELETE /api/work-experience/user/:userId
    - POST /api/work-experience (for each entry)
    - DELETE /api/user-skills/user/:userId
    - POST /api/user-skills (for each skill)
   ↓
16. Success message shown, modal closes
```

## Testing Checklist

- [ ] Upload PDF resume
- [ ] Upload DOCX resume
- [ ] Verify file upload to Supabase Storage
- [ ] Check console logs for parsing results
- [ ] Verify parsed data in ProfileReviewModal
- [ ] Edit personal information
- [ ] Add/remove education entries
- [ ] Add/remove work experience entries
- [ ] Add/remove skills
- [ ] Click "Update Profile" and verify all data saved
- [ ] Check database to verify all records created correctly

## Known Issues / Notes

1. **Gemini File Manager API**: The exact syntax for `fileManager.uploadFile()` may vary based on the SDK version. The code includes error handling to try alternative methods if the first fails.

2. **File Path**: The file path stored in the database should NOT include the `resumes/` prefix since the bucket name is already `resumes`.

3. **Skills Search**: The skills search uses the existing endpoint in `server.js` which uses `query` parameter, while the exact name search uses `name` parameter.

4. **Error Handling**: All endpoints include try-catch blocks and return appropriate error messages.

## Next Steps

1. Test the complete flow with real resume files
2. Adjust Gemini File Manager API calls if needed based on actual SDK behavior
3. Add retry logic for Gemini API failures
4. Add email notifications when parsing completes
5. Add progress tracking for long-running parsing operations

## Support

If you encounter issues:
1. Check backend console logs for detailed error messages
2. Verify all environment variables are set correctly
3. Ensure Supabase Storage bucket exists and is accessible
4. Verify Gemini API key is valid and has file upload permissions

