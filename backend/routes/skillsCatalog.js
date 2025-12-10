const express = require('express');
const router = express.Router();
const db = require('../config/db');

// GET /api/skills-catalog/search?name={skillName} - Search skill by name
router.get('/search', async (req, res) => {
  try {
    const { name } = req.query;

    if (!name) {
      return res.status(400).json({ error: 'name query parameter is required' });
    }

    const result = await db.query(
      `SELECT skill_id, skill_name, skill_category, demand_score, is_trending
       FROM skills_catalog
       WHERE LOWER(skill_name) = LOWER($1)
       LIMIT 1`,
      [name]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Skill not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error searching skill:', error);
    res.status(500).json({ error: 'Failed to search skill', details: error.message });
  }
});

// POST /api/skills-catalog - Insert new skill or return existing
router.post('/', async (req, res) => {
  try {
    const { skill_name, skill_category } = req.body;

    if (!skill_name) {
      return res.status(400).json({ error: 'skill_name is required' });
    }

    // Check if skill already exists
    const existingResult = await db.query(
      'SELECT skill_id FROM skills_catalog WHERE LOWER(skill_name) = LOWER($1)',
      [skill_name]
    );

    if (existingResult.rows.length > 0) {
      // Return existing skill
      const skillResult = await db.query(
        'SELECT * FROM skills_catalog WHERE skill_id = $1',
        [existingResult.rows[0].skill_id]
      );
      return res.json({ message: 'Skill already exists', skill: skillResult.rows[0] });
    }

    // Create new skill
    const result = await db.query(
      `INSERT INTO skills_catalog (skill_name, skill_category)
       VALUES ($1, $2)
       RETURNING *`,
      [skill_name, skill_category || 'technical']
    );

    res.status(201).json({ message: 'Skill created successfully', skill: result.rows[0] });
  } catch (error) {
    if (error.code === '23505') {
      // Unique constraint violation
      const existingResult = await db.query(
        'SELECT * FROM skills_catalog WHERE LOWER(skill_name) = LOWER($1)',
        [req.body.skill_name]
      );
      return res.json({ message: 'Skill already exists', skill: existingResult.rows[0] });
    }
    console.error('Error creating skill:', error);
    res.status(500).json({ error: 'Failed to create skill', details: error.message });
  }
});

module.exports = router;

