const express = require('express');
const router = express.Router();
const db = require('../config/db');

// PUT /api/users/:userId - Update user personal info
router.put('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { first_name, last_name, phone_number, current_city, linkedin_url, github_url } = req.body;

    const result = await db.query(
      `UPDATE users 
       SET first_name = COALESCE($1, first_name),
           last_name = COALESCE($2, last_name),
           phone_number = COALESCE($3, phone_number),
           current_city = COALESCE($4, current_city),
           linkedin_url = COALESCE($5, linkedin_url),
           github_url = COALESCE($6, github_url),
           updated_at = CURRENT_TIMESTAMP
       WHERE user_id = $7
       RETURNING user_id, email, first_name, last_name, phone_number, current_city, linkedin_url, github_url`,
      [first_name, last_name, phone_number, current_city, linkedin_url, github_url, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'User updated successfully', user: result.rows[0] });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Failed to update user', details: error.message });
  }
});

module.exports = router;

