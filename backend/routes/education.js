const express = require('express');
const router = express.Router();
const db = require('../config/db');

// DELETE /api/education/user/:userId - Delete all education records for user
router.delete('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    await db.query('DELETE FROM education WHERE user_id = $1', [userId]);

    res.json({ message: 'Education records deleted successfully' });
  } catch (error) {
    console.error('Error deleting education:', error);
    res.status(500).json({ error: 'Failed to delete education records', details: error.message });
  }
});

// POST /api/education - Insert single education record
router.post('/', async (req, res) => {
  try {
    const {
      user_id,
      degree_type,
      degree_title,
      institution_name,
      field_of_study,
      start_date,
      end_date,
      is_current,
      grade_cgpa,
    } = req.body;

    if (!user_id || !degree_title || !institution_name) {
      return res.status(400).json({ error: 'user_id, degree_title, and institution_name are required' });
    }

    // Replace missing dates with current date to satisfy DATE columns
    const today = new Date().toISOString().split('T')[0];
    const startDateValue = start_date || today;
    const endDateValue = end_date || today;

    const result = await db.query(
      `INSERT INTO education (user_id, degree_type, degree_title, institution_name, 
                              field_of_study, start_date, end_date, is_current, grade_cgpa)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [
        user_id,
        degree_type || 'bachelors',
        degree_title,
        institution_name,
        field_of_study || null,
        startDateValue,
        endDateValue,
        is_current || false,
        grade_cgpa || null,
      ]
    );

    res.status(201).json({ message: 'Education added successfully', education: result.rows[0] });
  } catch (error) {
    console.error('Error adding education:', error);
    res.status(500).json({ error: 'Failed to add education', details: error.message });
  }
});

module.exports = router;

