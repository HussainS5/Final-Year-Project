const express = require('express');
const router = express.Router();
const db = require('../config/db');

// GET /api/profile/:userId
// GET /api/profile/:userId
router.get('/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        console.log('GET /api/profile/:userId called with userId:', userId);

        // Fetch basic user info
        const userRes = await db.query('SELECT * FROM users WHERE user_id = $1', [userId]);
        if (userRes.rows.length === 0) {
            console.log('User not found with userId:', userId);
            return res.status(404).json({ error: 'User not found' });
        }
        const user = userRes.rows[0];
        console.log('User found:', {
            user_id: user.user_id,
            first_name: user.first_name,
            last_name: user.last_name,
            email: user.email,
            phone_number: user.phone_number,
            date_of_birth: user.date_of_birth,
            current_city: user.current_city,
            profile_picture_url: user.profile_picture_url
        });

        // Fetch education
        const eduRes = await db.query('SELECT * FROM education WHERE user_id = $1', [userId]);

        // Fetch work experience
        const expRes = await db.query('SELECT * FROM work_experience WHERE user_id = $1 ORDER BY start_date DESC', [userId]);

        // Fetch skills
        const skillsRes = await db.query(`
      SELECT s.skill_name 
      FROM user_skills us
      JOIN skills_catalog s ON us.skill_id = s.skill_id
      WHERE us.user_id = $1
    `, [userId]);

        // Derive current job from work experience
        const currentJobEntry = expRes.rows.find(w => w.is_current);
        const currentJobTitle = currentJobEntry ? currentJobEntry.job_title : '';

        // Derive years of experience (sum of all work experience durations) or keep it simplified
        // The schema has years_of_experience in user_skills, but not on users table according to provided text.
        // However, the actual DB inspection showed it MIGHT be there in the extra columns, but we are ignoring them.
        // We will omit years_of_experience from the user profile object if it's not in our target schema logic, 
        // OR we can calculate it. For now, we'll omit it to be safe as per "schema compliance".

        const profile = {
            id: user.user_id,
            user_id: user.user_id,
            first_name: user.first_name,
            last_name: user.last_name,
            email: user.email,
            phone_number: user.phone_number,
            date_of_birth: user.date_of_birth ? new Date(user.date_of_birth).toISOString().split('T')[0] : null,
            current_city: user.current_city,
            bio: user.bio,
            linkedin_url: user.linkedin_url,
            github_url: user.github_url,
            profile_picture: user.profile_picture_url,
            account_status: user.account_status,

            // Derived/Computed fields
            current_job: currentJobTitle,

            education: eduRes.rows.map(e => ({
                id: e.education_id,
                degree: e.degree_title,
                institution: e.institution_name,
                start_date: e.start_date ? e.start_date.toISOString().split('T')[0] : null,
                end_date: e.end_date ? e.end_date.toISOString().split('T')[0] : null,
                year: e.end_date ? new Date(e.end_date).getFullYear().toString() : 'Present'
            })),
            work_experience: expRes.rows.map(w => ({
                id: w.experience_id,
                title: w.job_title,
                company: w.company_name,
                start_date: w.start_date ? w.start_date.toISOString().split('T')[0] : null,
                end_date: w.end_date ? w.end_date.toISOString().split('T')[0] : null,
                is_current: w.is_current || false,
                duration: w.start_date ? `${new Date(w.start_date).getFullYear()} - ${w.end_date ? new Date(w.end_date).getFullYear() : 'Present'}` : '',
                description: w.description
            })),
            skills: skillsRes.rows.map(s => s.skill_name)
        };

        console.log('Returning profile data:', profile);
        res.json(profile);
    } catch (err) {
        console.error('Error fetching profile:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// PUT /api/profile/:userId
router.put('/:userId', async (req, res) => {
    const client = await db.pool.connect();
    try {
        await client.query('BEGIN');
        const { userId } = req.params;
        console.log('PUT /api/profile/:userId called with userId:', userId);
        console.log('Request body:', JSON.stringify(req.body, null, 2));
        
        const {
            first_name, last_name, phone_number, date_of_birth,
            current_city, bio, linkedin_url, github_url, profile_picture,
            current_job, dream_job, years_of_experience, preferred_location, salary_expectation,
            education, work_experience
        } = req.body;

        // 1. Update User Basic Info
        const userQuery = `
      UPDATE users 
      SET first_name = $1, last_name = $2, phone_number = $3, 
          date_of_birth = $4, current_city = $5, bio = $6, 
          linkedin_url = $7, github_url = $8, profile_picture_url = $9,
          updated_at = CURRENT_TIMESTAMP
      WHERE user_id = $10
      RETURNING *
    `;

        const userValues = [
            first_name || null, 
            last_name || null, 
            phone_number || null, 
            date_of_birth || null,
            current_city || null, 
            bio || null, 
            linkedin_url || null, 
            github_url || null, 
            profile_picture || null,
            userId
        ];

        console.log('Updating user with values:', userValues);
        const userResult = await client.query(userQuery, userValues);

        if (userResult.rows.length === 0) {
            await client.query('ROLLBACK');
            console.log('User not found for userId:', userId);
            return res.status(404).json({ error: 'User not found' });
        }

        console.log('User updated successfully');

        // 2. Update Education (Delete all and re-insert)
        await client.query('DELETE FROM education WHERE user_id = $1', [userId]);
        if (education && Array.isArray(education) && education.length > 0) {
            console.log('Updating education:', education);
            for (const edu of education) {
                if (edu.degree || edu.institution) {
                    // Use date fields directly if provided, otherwise try parsing year
                    let startDate = null;
                    let endDate = null;

                    if (edu.start_date && edu.start_date !== 'null' && edu.start_date !== '') {
                        startDate = edu.start_date;
                    }
                    if (edu.end_date && edu.end_date !== 'null' && edu.end_date !== '') {
                        endDate = edu.end_date;
                    }

                    // Fallback to year field if dates not provided
                    if (!endDate && edu.year && edu.year.toLowerCase() !== 'present') {
                        const year = parseInt(edu.year);
                        if (!isNaN(year) && year > 1900 && year < 2100) {
                            endDate = `${year}-12-31`;
                        }
                    }

                    console.log(`Inserting education - start: ${startDate}, end: ${endDate}`);
                    
                    await client.query(`
                        INSERT INTO education (user_id, degree_title, institution_name, start_date, end_date)
                        VALUES ($1, $2, $3, $4, $5)
                    `, [userId, edu.degree || '', edu.institution || '', startDate, endDate]);
                }
            }
        }

        // 3. Update Work Experience (Delete all and re-insert)
        await client.query('DELETE FROM work_experience WHERE user_id = $1', [userId]);
        if (work_experience && Array.isArray(work_experience) && work_experience.length > 0) {
            console.log('Updating work experience:', work_experience);
            for (const exp of work_experience) {
                if (exp.title || exp.company) {
                    let startDate = null;
                    let endDate = null;
                    let isCurrent = exp.is_current || false;

                    // Use date fields directly if provided (new format)
                    if (exp.start_date && exp.start_date !== 'null' && exp.start_date !== '') {
                        startDate = exp.start_date;
                    }
                    if (exp.end_date && exp.end_date !== 'null' && exp.end_date !== '') {
                        endDate = exp.end_date;
                    }

                    // Fallback: parse duration string if dates not provided (old format)
                    if (!startDate && exp.duration) {
                        const parts = exp.duration.split('-').map(s => s.trim());
                        if (parts.length > 0 && parts[0] && parts[0].toLowerCase() !== 'present') {
                            const year = parseInt(parts[0]);
                            if (!isNaN(year) && year > 1900 && year < 2100) {
                                startDate = `${year}-01-01`;
                            }
                        }
                        if (parts.length > 1 && parts[1]) {
                            if (parts[1].toLowerCase() === 'present') {
                                isCurrent = true;
                            } else {
                                const year = parseInt(parts[1]);
                                if (!isNaN(year) && year > 1900 && year < 2100) {
                                    endDate = `${year}-01-01`;
                                }
                            }
                        }
                    }

                    console.log(`Inserting work experience - start: ${startDate}, end: ${endDate}, current: ${isCurrent}`);
                    
                    await client.query(`
                        INSERT INTO work_experience (user_id, job_title, company_name, start_date, end_date, is_current, description)
                        VALUES ($1, $2, $3, $4, $5, $6, $7)
                    `, [userId, exp.title || '', exp.company || '', startDate, endDate, isCurrent, exp.description || '']);
                }
            }
        }

        await client.query('COMMIT');
        console.log('Profile update committed successfully');
        res.json(userResult.rows[0]);
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Error updating profile:', err);
        console.error('Error stack:', err.stack);
        res.status(500).json({ error: 'Internal server error', details: err.message });
    } finally {
        client.release();
    }
});

// PUT /api/profile/:userId/skills
router.put('/:userId/skills', async (req, res) => {
    try {
        const { userId } = req.params;
        const { skills } = req.body; // Array of skill names

        // First, clear existing skills (simple approach)
        await db.query('DELETE FROM user_skills WHERE user_id = $1', [userId]);

        if (skills && skills.length > 0) {
            for (const skillName of skills) {
                // Find or create skill in catalog
                let skillId;
                const skillRes = await db.query('SELECT skill_id FROM skills_catalog WHERE skill_name = $1', [skillName]);

                if (skillRes.rows.length > 0) {
                    skillId = skillRes.rows[0].skill_id;
                } else {
                    const newSkill = await db.query(
                        'INSERT INTO skills_catalog (skill_name, skill_category) VALUES ($1, $2) RETURNING skill_id',
                        [skillName, 'technical'] // Default category
                    );
                    skillId = newSkill.rows[0].skill_id;
                }

                // Link to user
                await db.query(
                    'INSERT INTO user_skills (user_id, skill_id, proficiency_level) VALUES ($1, $2, $3)',
                    [userId, skillId, 'intermediate'] // Default proficiency
                );
            }
        }

        res.json({ message: 'Skills updated successfully' });
    } catch (err) {
        console.error('Error updating skills:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
