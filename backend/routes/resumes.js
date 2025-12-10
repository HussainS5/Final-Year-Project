const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Initialize Gemini API
const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

// Initialize Supabase client for storage
const supabaseUrl = process.env.SUPABASE_URL || 'https://cdqppolfiyhkvcqhkivy.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseKey) {
  console.error('\n❌ ERROR: SUPABASE_ANON_KEY is required!');
  console.error('   Please add this to your backend/.env file:');
  console.error('   SUPABASE_ANON_KEY=your_supabase_anon_key_here\n');
  console.error('   You can find your anon key in Supabase Dashboard → Settings → API');
  throw new Error('SUPABASE_ANON_KEY environment variable is required');
}

console.log('Supabase client initialized:', supabaseUrl ? '✅' : '❌');
const supabase = createClient(supabaseUrl, supabaseKey);

// POST /api/resumes/parse - Parse resume using Gemini API
router.post('/parse', async (req, res) => {
  try {
    const { resume_id, file_path } = req.body;

    if (!resume_id || !file_path) {
      return res.status(400).json({ error: 'resume_id and file_path are required' });
    }

    console.log(`\n========== STARTING RESUME PARSING ==========`);
    console.log(`Resume ID: ${resume_id}`);
    console.log(`File Path: ${file_path}`);

    // Step 1: Download file from Supabase Storage
    console.log('\n📥 Downloading file from Supabase Storage...');
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('resumes')
      .download(file_path);

    if (downloadError) {
      console.error('❌ Error downloading file:', downloadError);
      return res.status(500).json({ error: 'Failed to download file from storage', details: downloadError.message });
    }

    console.log('✅ File downloaded successfully');

    // Step 2: Convert file to buffer and determine MIME type
    const arrayBuffer = await fileData.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const fileExt = file_path.split('.').pop().toLowerCase();
    const mimeType = fileExt === 'pdf' 
      ? 'application/pdf' 
      : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

    console.log(`📄 File Type: ${mimeType}`);

    // Step 3: Use Gemini API with file data directly (no File Manager needed)
    console.log('\n🤖 Calling Gemini API for parsing...');
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
    });

    const schema = {
      type: 'object',
      properties: {
        personal_info: {
          type: 'object',
          properties: {
            first_name: { type: 'string' },
            last_name: { type: 'string' },
            phone_number: { type: 'string' },
            current_city: { type: 'string' },
            linkedin_url: { type: 'string' },
            github_url: { type: 'string' },
          },
        },
        education: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              degree_type: {
                type: 'string',
                enum: ['high_school', 'bachelors', 'masters', 'phd', 'diploma'],
              },
              degree_title: { type: 'string' },
              institution_name: { type: 'string' },
              field_of_study: { type: 'string' },
              start_date: { type: 'string' },
              end_date: { type: 'string' },
              is_current: { type: 'boolean' },
              grade_cgpa: { type: 'number' },
            },
          },
        },
        work_experience: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              job_title: { type: 'string' },
              company_name: { type: 'string' },
              employment_type: {
                type: 'string',
                enum: ['full_time', 'part_time', 'internship', 'freelance'],
              },
              start_date: { type: 'string' },
              end_date: { type: 'string' },
              is_current: { type: 'boolean' },
              description: { type: 'string' },
            },
          },
        },
        skills: {
          type: 'array',
          items: { type: 'string' },
        },
      },
      required: ['personal_info', 'education', 'work_experience', 'skills'],
    };

    // Convert buffer to base64 for Gemini API
    const base64Data = buffer.toString('base64');

    const result = await model.generateContent({
      contents: [
        {
          role: 'user',
          parts: [
            {
              inlineData: {
                data: base64Data,
                mimeType: mimeType,
              },
            },
            {
              text: 'Extract all information from this resume. Return complete structured data matching the schema. Extract all education entries, all work experiences, and all skills mentioned. For dates, use YYYY-MM-DD format. For degree_type, use one of: high_school, bachelors, masters, phd, diploma. For employment_type, use one of: full_time, part_time, internship, freelance.',
            },
          ],
        },
      ],
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: schema,
      },
    });

    const responseText = result.response.text();
    const parsedData = JSON.parse(responseText);

    console.log('\n========== RESUME PARSING RESULTS ==========');
    console.log('✅ Personal Info Extracted:');
    console.log(JSON.stringify(parsedData.personal_info, null, 2));

    console.log(`\n✅ Education Records Found: ${parsedData.education.length}`);
    parsedData.education.forEach((edu, index) => {
      console.log(`\nEducation ${index + 1}:`);
      console.log(`  - Degree: ${edu.degree_title}`);
      console.log(`  - Institution: ${edu.institution_name}`);
      console.log(`  - Field: ${edu.field_of_study}`);
      console.log(`  - Dates: ${edu.start_date} to ${edu.end_date || 'Present'}`);
      console.log(`  - CGPA: ${edu.grade_cgpa || 'N/A'}`);
    });

    console.log(`\n✅ Work Experience Records Found: ${parsedData.work_experience.length}`);
    parsedData.work_experience.forEach((exp, index) => {
      console.log(`\nExperience ${index + 1}:`);
      console.log(`  - Title: ${exp.job_title}`);
      console.log(`  - Company: ${exp.company_name}`);
      console.log(`  - Type: ${exp.employment_type}`);
      console.log(`  - Dates: ${exp.start_date} to ${exp.end_date || 'Present'}`);
    });

    console.log(`\n✅ Skills Extracted: ${parsedData.skills.length}`);
    console.log('Skills:', parsedData.skills.join(', '));
    console.log('\n============================================\n');

    // Step 5: Update resume record in database
    await db.query(
      `UPDATE resumes 
       SET parsing_status = 'completed',
           parsed_data = $1,
           parsed_text = $2
       WHERE resume_id = $3`,
      [JSON.stringify(parsedData), responseText, resume_id]
    );

    console.log('✅ Resume record updated in database');

    // Return parsed data
    res.json({
      success: true,
      message: 'Resume parsed successfully',
      data: parsedData,
      resume_id: resume_id,
    });
  } catch (error) {
    console.error('\n❌ ERROR PARSING RESUME:');
    console.error(error);
    console.error('Stack:', error.stack);

    // Update resume status to failed
    if (req.body.resume_id) {
      try {
        await db.query(
          `UPDATE resumes SET parsing_status = 'failed' WHERE resume_id = $1`,
          [req.body.resume_id]
        );
      } catch (updateError) {
        console.error('Failed to update resume status:', updateError);
      }
    }

    res.status(500).json({
      error: 'Failed to parse resume',
      details: error.message,
    });
  }
});

module.exports = router;

