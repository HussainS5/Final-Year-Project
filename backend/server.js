const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const db = require('./config/db');

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/profile', require('./routes/profile'));
app.use('/api/skills', require('./routes/skills'));
app.use('/api/jobs', require('./routes/jobs'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/chat', require('./routes/chat'));
app.use('/api/resumes', require('./routes/resumes'));
app.use('/api/users', require('./routes/users'));
app.use('/api/education', require('./routes/education'));
app.use('/api/work-experience', require('./routes/workExperience'));
app.use('/api/user-skills', require('./routes/userSkills'));
app.use('/api/skills-catalog', require('./routes/skillsCatalog'));
app.use('/api/ats', require('./routes/ats'));
app.use('/api/email', require('./routes/email'));

// Test route
app.get('/api/health', async (req, res) => {
    try {
        const result = await db.query('SELECT NOW()');
        res.json({ status: 'ok', time: result.rows[0].now });
    } catch (err) {
        console.error(err);
        res.status(500).json({ status: 'error', message: err.message });
    }
});

// Profile API endpoint
app.get('/api/profile/:userId', async (req, res) => {
  const { userId } = req.params;
  
  try {
    // Fetch user basic info
    const userResult = await db.query(
      'SELECT user_id, email, first_name, last_name, phone_number, date_of_birth, current_city, bio, linkedin_url, github_url, profile_picture_url, account_status FROM users WHERE user_id = $1',
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = userResult.rows[0];

    // Fetch user skills with skill details
    const skillsResult = await db.query(
      `SELECT us.user_skill_id, us.proficiency_level, us.years_of_experience, us.source,
              sc.skill_id, sc.skill_name, sc.skill_category, sc.demand_score, sc.is_trending
       FROM user_skills us
       JOIN skills_catalog sc ON us.skill_id = sc.skill_id
       WHERE us.user_id = $1
       ORDER BY us.proficiency_level DESC, us.years_of_experience DESC`,
      [userId]
    );

    // Fetch education
    const educationResult = await db.query(
      `SELECT education_id, degree_type, degree_title, institution_name, field_of_study,
              start_date, end_date, is_current, grade_cgpa
       FROM education
       WHERE user_id = $1
       ORDER BY start_date DESC`,
      [userId]
    );

    // Fetch work experience
    const workResult = await db.query(
      `SELECT experience_id, job_title, company_name, employment_type,
              start_date, end_date, is_current, description
       FROM work_experience
       WHERE user_id = $1
       ORDER BY start_date DESC`,
      [userId]
    );

    // Fetch resumes
    const resumesResult = await db.query(
      `SELECT resume_id, file_name, file_type, parsing_status, upload_date, is_active
       FROM resumes
       WHERE user_id = $1 AND is_active = true
       ORDER BY upload_date DESC`,
      [userId]
    );

    // Fetch achievements
    const achievementsResult = await db.query(
      `SELECT achievement_id, achievement_type, title, description, badge_url, points_earned, earned_at
       FROM achievements
       WHERE user_id = $1
       ORDER BY earned_at DESC`,
      [userId]
    );

    // Construct complete profile
    const profile = {
      user: user,
      skills: skillsResult.rows,
      education: educationResult.rows,
      workExperience: workResult.rows,
      resumes: resumesResult.rows,
      achievements: achievementsResult.rows,
      stats: {
        totalSkills: skillsResult.rows.length,
        totalEducation: educationResult.rows.length,
        totalExperience: workResult.rows.length,
        totalAchievements: achievementsResult.rows.length
      }
    };

    res.json(profile);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ error: 'Failed to fetch profile data' });
  }
});

// Get user skills only
app.get('/api/profile/:userId/skills', async (req, res) => {
  const { userId } = req.params;
  
  try {
    const result = await db.query(
      `SELECT us.user_skill_id, us.proficiency_level, us.years_of_experience, us.source,
              sc.skill_id, sc.skill_name, sc.skill_category, sc.demand_score, sc.is_trending
       FROM user_skills us
       JOIN skills_catalog sc ON us.skill_id = sc.skill_id
       WHERE us.user_id = $1
       ORDER BY us.proficiency_level DESC, us.years_of_experience DESC`,
      [userId]
    );
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching skills:', error);
    res.status(500).json({ error: 'Failed to fetch skills' });
  }
});

// Get user education only
app.get('/api/profile/:userId/education', async (req, res) => {
  const { userId } = req.params;
  
  try {
    const result = await db.query(
      `SELECT education_id, degree_type, degree_title, institution_name, field_of_study,
              start_date, end_date, is_current, grade_cgpa
       FROM education
       WHERE user_id = $1
       ORDER BY start_date DESC`,
      [userId]
    );
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching education:', error);
    res.status(500).json({ error: 'Failed to fetch education' });
  }
});

// Get user work experience only
app.get('/api/profile/:userId/experience', async (req, res) => {
  const { userId } = req.params;
  
  try {
    const result = await db.query(
      `SELECT experience_id, job_title, company_name, employment_type,
              start_date, end_date, is_current, description
       FROM work_experience
       WHERE user_id = $1
       ORDER BY start_date DESC`,
      [userId]
    );
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching experience:', error);
    res.status(500).json({ error: 'Failed to fetch experience' });
  }
});

// Update user basic info
app.put('/api/profile/:userId', async (req, res) => {
  const { userId } = req.params;
  const { 
    first_name, 
    last_name, 
    phone_number, 
    date_of_birth, 
    current_city, 
    bio, 
    linkedin_url, 
    github_url,
    profile_picture_url 
  } = req.body;
  
  try {
    const result = await db.query(
      `UPDATE users 
       SET first_name = COALESCE($1, first_name),
           last_name = COALESCE($2, last_name),
           phone_number = COALESCE($3, phone_number),
           date_of_birth = COALESCE($4, date_of_birth),
           current_city = COALESCE($5, current_city),
           bio = COALESCE($6, bio),
           linkedin_url = COALESCE($7, linkedin_url),
           github_url = COALESCE($8, github_url),
           profile_picture_url = COALESCE($9, profile_picture_url),
           updated_at = CURRENT_TIMESTAMP
       WHERE user_id = $10
       RETURNING user_id, email, first_name, last_name, phone_number, date_of_birth, 
                 current_city, bio, linkedin_url, github_url, profile_picture_url`,
      [first_name, last_name, phone_number, date_of_birth, current_city, bio, 
       linkedin_url, github_url, profile_picture_url, userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ message: 'Profile updated successfully', user: result.rows[0] });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Add new education
app.post('/api/profile/:userId/education', async (req, res) => {
  const { userId } = req.params;
  const { 
    degree_type, 
    degree_title, 
    institution_name, 
    field_of_study, 
    start_date, 
    end_date, 
    is_current, 
    grade_cgpa 
  } = req.body;
  
  try {
    const result = await db.query(
      `INSERT INTO education (user_id, degree_type, degree_title, institution_name, 
                              field_of_study, start_date, end_date, is_current, grade_cgpa)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [userId, degree_type, degree_title, institution_name, field_of_study, 
       start_date, end_date || null, is_current || false, grade_cgpa || null]
    );
    
    res.status(201).json({ message: 'Education added successfully', education: result.rows[0] });
  } catch (error) {
    console.error('Error adding education:', error);
    res.status(500).json({ error: 'Failed to add education' });
  }
});

// Update education
app.put('/api/profile/:userId/education/:educationId', async (req, res) => {
  const { userId, educationId } = req.params;
  const { 
    degree_type, 
    degree_title, 
    institution_name, 
    field_of_study, 
    start_date, 
    end_date, 
    is_current, 
    grade_cgpa 
  } = req.body;
  
  try {
    const result = await db.query(
      `UPDATE education 
       SET degree_type = COALESCE($1, degree_type),
           degree_title = COALESCE($2, degree_title),
           institution_name = COALESCE($3, institution_name),
           field_of_study = COALESCE($4, field_of_study),
           start_date = COALESCE($5, start_date),
           end_date = $6,
           is_current = COALESCE($7, is_current),
           grade_cgpa = $8
       WHERE education_id = $9 AND user_id = $10
       RETURNING *`,
      [degree_type, degree_title, institution_name, field_of_study, start_date, 
       end_date, is_current, grade_cgpa, educationId, userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Education record not found' });
    }
    
    res.json({ message: 'Education updated successfully', education: result.rows[0] });
  } catch (error) {
    console.error('Error updating education:', error);
    res.status(500).json({ error: 'Failed to update education' });
  }
});

// Delete education
app.delete('/api/profile/:userId/education/:educationId', async (req, res) => {
  const { userId, educationId } = req.params;
  
  try {
    const result = await db.query(
      'DELETE FROM education WHERE education_id = $1 AND user_id = $2 RETURNING education_id',
      [educationId, userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Education record not found' });
    }
    
    res.json({ message: 'Education deleted successfully' });
  } catch (error) {
    console.error('Error deleting education:', error);
    res.status(500).json({ error: 'Failed to delete education' });
  }
});

// Add work experience
app.post('/api/profile/:userId/experience', async (req, res) => {
  const { userId } = req.params;
  const { 
    job_title, 
    company_name, 
    employment_type, 
    start_date, 
    end_date, 
    is_current, 
    description 
  } = req.body;
  
  try {
    const result = await db.query(
      `INSERT INTO work_experience (user_id, job_title, company_name, employment_type, 
                                    start_date, end_date, is_current, description)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [userId, job_title, company_name, employment_type, start_date, 
       end_date || null, is_current || false, description || null]
    );
    
    res.status(201).json({ message: 'Experience added successfully', experience: result.rows[0] });
  } catch (error) {
    console.error('Error adding experience:', error);
    res.status(500).json({ error: 'Failed to add experience' });
  }
});

// Update work experience
app.put('/api/profile/:userId/experience/:experienceId', async (req, res) => {
  const { userId, experienceId } = req.params;
  const { 
    job_title, 
    company_name, 
    employment_type, 
    start_date, 
    end_date, 
    is_current, 
    description 
  } = req.body;
  
  try {
    const result = await db.query(
      `UPDATE work_experience 
       SET job_title = COALESCE($1, job_title),
           company_name = COALESCE($2, company_name),
           employment_type = COALESCE($3, employment_type),
           start_date = COALESCE($4, start_date),
           end_date = $5,
           is_current = COALESCE($6, is_current),
           description = $7
       WHERE experience_id = $8 AND user_id = $9
       RETURNING *`,
      [job_title, company_name, employment_type, start_date, end_date, 
       is_current, description, experienceId, userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Experience record not found' });
    }
    
    res.json({ message: 'Experience updated successfully', experience: result.rows[0] });
  } catch (error) {
    console.error('Error updating experience:', error);
    res.status(500).json({ error: 'Failed to update experience' });
  }
});

// Delete work experience
app.delete('/api/profile/:userId/experience/:experienceId', async (req, res) => {
  const { userId, experienceId } = req.params;
  
  try {
    const result = await db.query(
      'DELETE FROM work_experience WHERE experience_id = $1 AND user_id = $2 RETURNING experience_id',
      [experienceId, userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Experience record not found' });
    }
    
    res.json({ message: 'Experience deleted successfully' });
  } catch (error) {
    console.error('Error deleting experience:', error);
    res.status(500).json({ error: 'Failed to delete experience' });
  }
});

// Add user skill
app.post('/api/profile/:userId/skills', async (req, res) => {
  const { userId } = req.params;
  const { skill_id, proficiency_level, years_of_experience } = req.body;
  
  try {
    const result = await db.query(
      `INSERT INTO user_skills (user_id, skill_id, proficiency_level, years_of_experience, source)
       VALUES ($1, $2, $3, $4, 'manual_entry')
       RETURNING user_skill_id, user_id, skill_id, proficiency_level, years_of_experience, source`,
      [userId, skill_id, proficiency_level, years_of_experience || 0]
    );
    
    // Get skill details
    const skillDetails = await db.query(
      'SELECT skill_id, skill_name, skill_category FROM skills_catalog WHERE skill_id = $1',
      [skill_id]
    );
    
    res.status(201).json({ 
      message: 'Skill added successfully', 
      skill: { ...result.rows[0], ...skillDetails.rows[0] }
    });
  } catch (error) {
    if (error.code === '23505') { // Unique constraint violation
      return res.status(400).json({ error: 'Skill already exists for this user' });
    }
    console.error('Error adding skill:', error);
    res.status(500).json({ error: 'Failed to add skill' });
  }
});

// Update user skill
app.put('/api/profile/:userId/skills/:userSkillId', async (req, res) => {
  const { userId, userSkillId } = req.params;
  const { proficiency_level, years_of_experience } = req.body;
  
  try {
    const result = await db.query(
      `UPDATE user_skills 
       SET proficiency_level = COALESCE($1, proficiency_level),
           years_of_experience = COALESCE($2, years_of_experience)
       WHERE user_skill_id = $3 AND user_id = $4
       RETURNING *`,
      [proficiency_level, years_of_experience, userSkillId, userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Skill not found' });
    }
    
    res.json({ message: 'Skill updated successfully', skill: result.rows[0] });
  } catch (error) {
    console.error('Error updating skill:', error);
    res.status(500).json({ error: 'Failed to update skill' });
  }
});

// Delete user skill
app.delete('/api/profile/:userId/skills/:userSkillId', async (req, res) => {
  const { userId, userSkillId } = req.params;
  
  try {
    const result = await db.query(
      'DELETE FROM user_skills WHERE user_skill_id = $1 AND user_id = $2 RETURNING user_skill_id',
      [userSkillId, userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Skill not found' });
    }
    
    res.json({ message: 'Skill deleted successfully' });
  } catch (error) {
    console.error('Error deleting skill:', error);
    res.status(500).json({ error: 'Failed to delete skill' });
  }
});

// Get all skills catalog (for dropdown)
app.get('/api/skills-catalog', async (req, res) => {
  try {
    const result = await db.query(
      `SELECT skill_id, skill_name, skill_category, demand_score, is_trending
       FROM skills_catalog
       ORDER BY skill_name ASC`
    );
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching skills catalog:', error);
    res.status(500).json({ error: 'Failed to fetch skills catalog' });
  }
});

// Search skills by name
app.get('/api/skills-catalog/search', async (req, res) => {
  const { query } = req.query;
  
  try {
    const result = await db.query(
      `SELECT skill_id, skill_name, skill_category, demand_score, is_trending
       FROM skills_catalog
       WHERE skill_name ILIKE $1
       ORDER BY demand_score DESC, skill_name ASC
       LIMIT 20`,
      [`%${query}%`]
    );
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error searching skills:', error);
    res.status(500).json({ error: 'Failed to search skills' });
  }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
