const express = require('express');
const router = express.Router();
const db = require('../config/db');

// DELETE /api/user-skills/user/:userId - Delete all user_skills records for user
router.delete('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    await db.query('DELETE FROM user_skills WHERE user_id = $1', [userId]);

    res.json({ message: 'User skills deleted successfully' });
  } catch (error) {
    console.error('Error deleting user skills:', error);
    res.status(500).json({ error: 'Failed to delete user skills', details: error.message });
  }
});

// POST /api/user-skills - Insert user skill with constraint handling
router.post('/', async (req, res) => {
  try {
    const { user_id, skill_id, proficiency_level, years_of_experience, source } = req.body;

    if (!user_id || !skill_id) {
      return res.status(400).json({ error: 'user_id and skill_id are required' });
    }

    const result = await db.query(
      `INSERT INTO user_skills (user_id, skill_id, proficiency_level, years_of_experience, source)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (user_id, skill_id) DO NOTHING
       RETURNING *`,
      [
        user_id,
        skill_id,
        proficiency_level || 'intermediate',
        years_of_experience || 0,
        source || 'manual_entry',
      ]
    );

    if (result.rows.length === 0) {
      // Skill already exists for this user
      return res.status(200).json({ message: 'Skill already exists for this user' });
    }

    res.status(201).json({ message: 'User skill added successfully', userSkill: result.rows[0] });
  } catch (error) {
    console.error('Error adding user skill:', error);
    res.status(500).json({ error: 'Failed to add user skill', details: error.message });
  }
});

module.exports = router;

