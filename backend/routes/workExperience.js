const express = require('express');
const router = express.Router();
const db = require('../config/db');

// DELETE /api/work-experience/user/:userId - Delete all work experience records for user
router.delete('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    await db.query('DELETE FROM work_experience WHERE user_id = $1', [userId]);

    res.json({ message: 'Work experience records deleted successfully' });
  } catch (error) {
    console.error('Error deleting work experience:', error);
    res.status(500).json({ error: 'Failed to delete work experience records', details: error.message });
  }
});

// POST /api/work-experience - Insert single work experience record
router.post('/', async (req, res) => {
  try {
    const {
      user_id,
      job_title,
      company_name,
      employment_type,
      start_date,
      end_date,
      is_current,
      description,
    } = req.body;

    if (!user_id || !job_title || !company_name || !start_date) {
      return res.status(400).json({
        error: 'user_id, job_title, company_name, and start_date are required',
      });
    }

    // Set end_date to today if it's null, undefined, string "null", or if is_current is true
    const today = new Date().toISOString().split('T')[0];
    let endDateValue;
    if (is_current || !end_date || end_date === 'null' || end_date === null) {
      endDateValue = today;
    } else {
      endDateValue = end_date;
    }

    const result = await db.query(
      `INSERT INTO work_experience (user_id, job_title, company_name, employment_type, 
                                    start_date, end_date, is_current, description)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        user_id,
        job_title,
        company_name,
        employment_type || 'full_time',
        start_date,
        endDateValue,
        is_current || false,
        description || null,
      ]
    );

    res.status(201).json({ message: 'Work experience added successfully', experience: result.rows[0] });
  } catch (error) {
    console.error('Error adding work experience:', error);
    res.status(500).json({ error: 'Failed to add work experience', details: error.message });
  }
});

module.exports = router;

