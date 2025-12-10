const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Helper function to calculate profile completeness
function calculateProfileStrength(user, education, experience, skills) {
    let score = 0;
    const maxScore = 100;

    // Basic info (30 points)
    if (user.first_name) score += 5;
    if (user.last_name) score += 5;
    if (user.email) score += 5;
    if (user.phone_number) score += 5;
    if (user.bio) score += 5;
    if (user.profile_picture_url) score += 5;

    // Education (20 points)
    if (education.length > 0) score += 20;

    // Experience (30 points)
    if (experience.length > 0) score += 15;
    if (experience.some(exp => exp.is_current)) score += 15;

    // Skills (20 points)
    if (skills.length > 0) score += 10;
    if (skills.length >= 5) score += 10;

    return Math.min(score, maxScore);
}

// GET /api/dashboard/:userId
router.get('/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        console.log('Fetching dashboard data for userId:', userId);

        // Fetch user profile
        const userRes = await db.query('SELECT * FROM users WHERE user_id = $1', [userId]);
        if (userRes.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        const user = userRes.rows[0];

        // Fetch education
        const eduRes = await db.query('SELECT * FROM education WHERE user_id = $1', [userId]);

        // Fetch work experience
        const expRes = await db.query('SELECT * FROM work_experience WHERE user_id = $1', [userId]);

        // Fetch skills
        const skillsRes = await db.query(`
            SELECT s.skill_name 
            FROM user_skills us
            JOIN skills_catalog s ON us.skill_id = s.skill_id
            WHERE us.user_id = $1
        `, [userId]);

        // Calculate profile strength
        const profileStrength = calculateProfileStrength(
            user, 
            eduRes.rows, 
            expRes.rows, 
            skillsRes.rows
        );

        // Fetch active applications count
        const appsRes = await db.query(
            'SELECT COUNT(*) FROM applications WHERE user_id = $1 AND status NOT IN (\'rejected\', \'withdrawn\')',
            [userId]
        );
        const activeApplications = parseInt(appsRes.rows[0].count);

        // Fetch interviews scheduled
        const interviewsRes = await db.query(
            "SELECT COUNT(*) FROM applications WHERE user_id = $1 AND status = 'interview'",
            [userId]
        );
        const interviewsScheduled = parseInt(interviewsRes.rows[0].count);

        // Calculate match ranking (mock for now, but based on real data)
        const totalUsersRes = await db.query('SELECT COUNT(*) FROM users');
        const totalUsers = parseInt(totalUsersRes.rows[0].count);
        const rank = Math.ceil((profileStrength / 100) * 20); // Top X%
        const matchRanking = `Top ${rank}%`;

        // Fetch user skills for matching
        const userSkills = skillsRes.rows.map(s => s.skill_name.toLowerCase());

        // Fetch recommended jobs from recommendations table or match based on skills
        const recsRes = await db.query(`
            SELECT r.*, j.job_title, j.company_name, j.job_location, j.job_type, 
                   j.salary_min, j.salary_max, j.job_description, j.required_skills
            FROM recommendations r
            JOIN job_postings j ON r.entity_id = j.job_id
            WHERE r.user_id = $1 AND r.entity_type = 'job'
            ORDER BY r.match_score DESC
            LIMIT 10
        `, [userId]);

        let recommendedJobs = [];
        
        if (recsRes.rows.length > 0) {
            recommendedJobs = recsRes.rows;
        } else {
            // If no recommendations, fetch recent jobs and calculate match score
            const recentJobsRes = await db.query(
                `SELECT job_id, job_title, company_name, job_location, job_type, 
                        salary_min, salary_max, job_description, required_skills, posted_date 
                 FROM job_postings 
                 WHERE is_active = true 
                 ORDER BY posted_date DESC 
                 LIMIT 10`
            );
            
            recommendedJobs = recentJobsRes.rows.map(job => {
                // Simple skill matching
                let matchScore = 0.5; // Base score
                
                if (job.required_skills && userSkills.length > 0) {
                    // Parse required_skills if it's a JSONB array
                    let jobSkills = [];
                    try {
                        if (typeof job.required_skills === 'string') {
                            jobSkills = JSON.parse(job.required_skills);
                        } else if (Array.isArray(job.required_skills)) {
                            jobSkills = job.required_skills;
                        }
                        
                        if (Array.isArray(jobSkills)) {
                            jobSkills = jobSkills.map(s => s.toLowerCase());
                            const matchedSkills = jobSkills.filter(js => 
                                userSkills.some(us => us.includes(js) || js.includes(us))
                            );
                            matchScore = Math.min(0.95, 0.5 + (matchedSkills.length / jobSkills.length) * 0.5);
                        }
                    } catch (err) {
                        console.error('Error parsing required_skills:', err);
                    }
                }
                
                return {
                    ...job,
                    match_score: matchScore
                };
            });

            // Sort by match score
            recommendedJobs.sort((a, b) => b.match_score - a.match_score);
        }

        const dashboardData = {
            profileStrength,
            activeApplications,
            interviewsScheduled,
            matchRanking,
            skillsCount: skillsRes.rows.length,
            recommendedJobs: recommendedJobs.map(job => {
                // Format salary range
                let salary = 'Not specified';
                if (job.salary_min && job.salary_max) {
                    salary = `$${job.salary_min} - $${job.salary_max}`;
                } else if (job.salary_min) {
                    salary = `$${job.salary_min}+`;
                }
                
                // Format required skills
                let requiredSkills = '';
                if (job.required_skills) {
                    try {
                        if (typeof job.required_skills === 'string') {
                            requiredSkills = job.required_skills;
                        } else if (Array.isArray(job.required_skills)) {
                            requiredSkills = job.required_skills.join(', ');
                        }
                    } catch (err) {
                        console.error('Error formatting required_skills:', err);
                    }
                }
                
                return {
                    id: job.job_id || job.entity_id,
                    title: job.job_title,
                    company: job.company_name,
                    location: job.job_location || 'Remote',
                    jobType: job.job_type || 'full_time',
                    salary: salary,
                    description: job.job_description,
                    requiredSkills: requiredSkills,
                    matchScore: Math.round((job.match_score || 0.5) * 100)
                };
            })
        };

        console.log('Dashboard data:', dashboardData);
        res.json(dashboardData);
    } catch (err) {
        console.error('Error fetching dashboard:', err);
        res.status(500).json({ error: 'Internal server error', details: err.message });
    }
});

module.exports = router;
