const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Helper to format salary
const formatSalary = (min, max) => {
    if (!min && !max) return 'Negotiable';
    const formatK = (num) => num >= 1000 ? `$${Math.round(num / 1000)}k` : `$${num}`;
    if (min && max) return `${formatK(min)} - ${formatK(max)}`;
    if (min) return `From ${formatK(min)}`;
    return `Up to ${formatK(max)}`;
};

// Helper to format posted date
const formatPostedDate = (date) => {
    if (!date) return 'Recently';
    const days = Math.floor((new Date() - new Date(date)) / (1000 * 60 * 60 * 24));
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
    return `${Math.floor(days / 30)} months ago`;
};

// GET /api/jobs
router.get('/', async (req, res) => {
    try {
        const { search, type, location } = req.query;

        let query = `
      SELECT 
        job_id as id,
        job_title as title,
        company_name as company,
        job_location as location,
        salary_min,
        salary_max,
        job_type as type,
        posted_date,
        job_description as description,
        required_skills as skills
      FROM job_postings
      WHERE is_active = true
    `;

        const params = [];
        let paramCount = 1;

        if (search) {
            query += ` AND (LOWER(job_title) LIKE $${paramCount} OR LOWER(company_name) LIKE $${paramCount})`;
            params.push(`%${search.toLowerCase()}%`);
            paramCount++;
        }

        if (type) {
            // Handle multiple types if needed, for now simple exact match or list
            // If type is comma separated
            const types = type.split(',');
            if (types.length > 0) {
                query += ` AND job_type = ANY($${paramCount}::text[])`;
                params.push(types);
                paramCount++;
            }
        }

        if (location) {
            const locations = location.split(',');
            if (locations.length > 0) {
                query += ` AND job_location = ANY($${paramCount}::text[])`;
                params.push(locations);
                paramCount++;
            }
        }

        query += ` ORDER BY posted_date DESC`;

        const result = await db.query(query, params);

        const jobs = result.rows.map(job => ({
            id: job.id,
            title: job.title,
            company: job.company,
            location: job.location,
            salary: formatSalary(job.salary_min, job.salary_max),
            type: job.type === 'full_time' ? 'Full-time' :
                job.type === 'part_time' ? 'Part-time' :
                    job.type.charAt(0).toUpperCase() + job.type.slice(1),
            matchScore: Math.floor(Math.random() * (98 - 70) + 70), // Mock match score for now as we don't have user context yet
            description: job.description,
            skills: job.skills || [],
            posted: formatPostedDate(job.posted_date)
        }));

        res.json(jobs);
    } catch (err) {
        console.error('Error fetching jobs:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// GET /api/jobs/:id
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await db.query('SELECT * FROM job_postings WHERE job_id = $1', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Job not found' });
        }

        const job = result.rows[0];
        const formattedJob = {
            id: job.job_id,
            title: job.job_title,
            company: job.company_name,
            location: job.job_location,
            salary: formatSalary(job.salary_min, job.salary_max),
            type: job.job_type,
            matchScore: 95, // Mock
            description: job.job_description,
            skills: job.required_skills || [],
            posted: formatPostedDate(job.posted_date),
            fullDetails: job // Include raw data if needed
        };

        res.json(formattedJob);
    } catch (err) {
        console.error('Error fetching job:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
