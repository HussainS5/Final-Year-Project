const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const db = require('../config/db');
require('dotenv').config();

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);
const PRIMARY_MODEL = 'gemini-2.5-flash';
const FALLBACK_MODEL = 'gemini-2.5-flash-lite';

// Helper to safely stringify complex profile data for the prompt
function buildProfileContext(user, education, experience, skills) {
  const parts = [];

  if (user) {
    parts.push(`User: ${user.first_name || ''} ${user.last_name || ''} (${user.email || 'no email'})`);
    if (user.current_city) parts.push(`Location: ${user.current_city}`);
    if (user.bio) parts.push(`Bio: ${user.bio}`);
  }

  if (skills?.length) {
    const skillList = skills
      .map((s) => `${s.skill_name} (level ${s.proficiency_level || 'n/a'}, exp ${s.years_of_experience || 0}y)`)
      .join('; ');
    parts.push(`Skills: ${skillList}`);
  }

  if (experience?.length) {
    const expList = experience
      .map(
        (exp) =>
          `${exp.job_title || 'Role'} at ${exp.company_name || 'Company'} ` +
          `(${exp.start_date || 'start'} - ${exp.is_current ? 'Present' : exp.end_date || 'end'}) ${exp.description || ''}`
      )
      .join(' | ');
    parts.push(`Experience: ${expList}`);
  }

  if (education?.length) {
    const eduList = education
      .map(
        (edu) =>
          `${edu.degree_title || edu.degree_type || 'Degree'} in ${edu.field_of_study || 'Field'} at ${
            edu.institution_name || 'Institution'
          } (${edu.start_date || 'start'} - ${edu.end_date || 'end'})`
      )
      .join(' | ');
    parts.push(`Education: ${eduList}`);
  }

  return parts.join('\n');
}

router.post('/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    if (!apiKey) {
      return res.status(500).json({ error: 'Gemini API key missing on server' });
    }

    // Fetch profile data
    const userRes = await db.query('SELECT * FROM users WHERE user_id = $1', [userId]);
    if (userRes.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    const user = userRes.rows[0];

    const eduRes = await db.query('SELECT * FROM education WHERE user_id = $1 ORDER BY start_date DESC', [userId]);
    const expRes = await db.query('SELECT * FROM work_experience WHERE user_id = $1 ORDER BY start_date DESC', [userId]);
    const skillsRes = await db.query(
      `SELECT us.proficiency_level, us.years_of_experience, sc.skill_name, sc.skill_category
       FROM user_skills us
       JOIN skills_catalog sc ON us.skill_id = sc.skill_id
       WHERE us.user_id = $1
       ORDER BY us.proficiency_level DESC, us.years_of_experience DESC`,
      [userId]
    );

    const profileContext = buildProfileContext(user, eduRes.rows, expRes.rows, skillsRes.rows);

    const prompt = `
You are an ATS evaluator. Using the user's full profile data, produce a JSON-only response.

Return strict JSON with this schema:
{
  "score": number (0-100),
  "summary": string,
  "strengths": string[],
  "gaps": string[],
  "recommendations": string[],
  "keywordsToAdd": string[],
  "breakdown": {
    "skills": number (0-100),
    "experience": number (0-100),
    "education": number (0-100),
    "profileCompleteness": number (0-100)
  }
}

Scoring rules:
- Score fairly based on relevancy, recency, role clarity, quantified impact, and alignment between skills, experience, and education.
- Recommendations should be concrete and actionable.
- keywordsToAdd should be 5-10 targeted terms that improve ATS matching.

User data:
${profileContext}

Respond with JSON only, no markdown, no code fences.`;

    const callModelWithRetry = async (modelId) => {
      let lastError;
      for (let attempt = 1; attempt <= 2; attempt++) {
        try {
          const model = genAI.getGenerativeModel({ model: modelId });
          const result = await model.generateContent(prompt);
          const text = result.response.text().trim();
          return { text, modelId };
        } catch (err) {
          lastError = err;
          const status = err?.status || err?.response?.status;
          if (status === 503) {
            // brief backoff before retry
            await new Promise((r) => setTimeout(r, 800 * attempt));
            continue;
          }
          throw err;
        }
      }
      throw lastError;
    };

    let modelUsed = PRIMARY_MODEL;
    let text;

    try {
      const primary = await callModelWithRetry(PRIMARY_MODEL);
      text = primary.text;
      modelUsed = primary.modelId;
    } catch (primaryErr) {
      const status = primaryErr?.status || primaryErr?.response?.status;
      if (status === 503) {
        // Fallback to lighter model on overload
        const fallback = await callModelWithRetry(FALLBACK_MODEL);
        text = fallback.text;
        modelUsed = fallback.modelId;
      } else {
        throw primaryErr;
      }
    }

    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch (err) {
      console.error('Failed to parse Gemini JSON, raw text:', text);
      return res.status(500).json({ error: 'Failed to parse ATS response', details: err.message });
    }

    // Basic validation and defaults
    const responsePayload = {
      score: Number(parsed.score) || 0,
      summary: parsed.summary || 'No summary available.',
      strengths: Array.isArray(parsed.strengths) ? parsed.strengths : [],
      gaps: Array.isArray(parsed.gaps) ? parsed.gaps : [],
      recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations : [],
      keywordsToAdd: Array.isArray(parsed.keywordsToAdd) ? parsed.keywordsToAdd : [],
      breakdown: {
        skills: Number(parsed?.breakdown?.skills) || 0,
        experience: Number(parsed?.breakdown?.experience) || 0,
        education: Number(parsed?.breakdown?.education) || 0,
        profileCompleteness: Number(parsed?.breakdown?.profileCompleteness) || 0,
      },
      model: modelUsed,
      raw: text,
    };

    // Persist for audit/history
    const insertQuery = `
      INSERT INTO ats_reports
        (user_id, score, summary, strengths, gaps, recommendations, keywords_to_add, breakdown, model_used, raw_response)
      VALUES
        ($1, $2, $3, $4::jsonb, $5::jsonb, $6::jsonb, $7::jsonb, $8::jsonb, $9, $10)
      RETURNING report_id, created_at
    `;

    const insertValues = [
      userId,
      responsePayload.score,
      responsePayload.summary,
      JSON.stringify(responsePayload.strengths),
      JSON.stringify(responsePayload.gaps),
      JSON.stringify(responsePayload.recommendations),
      JSON.stringify(responsePayload.keywordsToAdd),
      JSON.stringify(responsePayload.breakdown),
      responsePayload.model,
      responsePayload.raw,
    ];

    const saved = await db.query(insertQuery, insertValues);

    res.json({
      ...responsePayload,
      reportId: saved.rows[0]?.report_id,
      createdAt: saved.rows[0]?.created_at,
    });
  } catch (error) {
    console.error('Error generating ATS score:', error);

    // Gracefully surface provider overloads to the client
    const status = error?.status || error?.response?.status;
    const statusText = (error?.statusText || error?.response?.statusText || '').toLowerCase();
    if (status === 503 || statusText.includes('service unavailable')) {
      return res.status(503).json({
        error: 'Model temporarily unavailable',
        details: 'Gemini is overloaded. Please retry in a moment.',
      });
    }

    res.status(500).json({ error: 'Failed to generate ATS score', details: error.message });
  }
});

// GET /api/ats/:userId - return latest stored ATS report (no Gemini call)
router.get('/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const atsRes = await db.query(
      `SELECT score, summary, strengths, gaps, recommendations, keywords_to_add, breakdown, model_used, created_at
       FROM ats_reports
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT 1`,
      [userId]
    );

    if (atsRes.rows.length === 0) {
      return res.status(404).json({ error: 'No ATS report found' });
    }

    const row = atsRes.rows[0];
    const parseArr = (val) => {
      if (Array.isArray(val)) return val;
      try {
        const parsed = typeof val === 'string' ? JSON.parse(val) : val;
        return Array.isArray(parsed) ? parsed : [];
      } catch (e) {
        return [];
      }
    };

    res.json({
      score: Number(row.score) || 0,
      summary: row.summary || '',
      strengths: parseArr(row.strengths),
      gaps: parseArr(row.gaps),
      recommendations: parseArr(row.recommendations),
      keywordsToAdd: parseArr(row.keywords_to_add),
      breakdown: row.breakdown || {},
      modelUsed: row.model_used || '',
      createdAt: row.created_at,
    });
  } catch (error) {
    console.error('Error fetching ATS report:', error);
    res.status(500).json({ error: 'Failed to fetch ATS report', details: error.message });
  }
});

module.exports = router;

