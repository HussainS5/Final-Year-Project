const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const db = require('../config/db');

// POST /api/auth/signup
router.post('/signup', async (req, res) => {
    try {
        const { email, password, full_name } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        // Check if user exists
        const userCheck = await db.query('SELECT * FROM users WHERE email = $1', [email]);
        if (userCheck.rows.length > 0) {
            return res.status(400).json({ error: 'User already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        // Insert user
        // Splitting full_name into first and last name for the schema
        const nameParts = full_name ? full_name.split(' ') : [''];
        const firstName = nameParts[0];
        const lastName = nameParts.slice(1).join(' ') || '';

        const newUser = await db.query(
            'INSERT INTO users (email, password_hash, first_name, last_name) VALUES ($1, $2, $3, $4) RETURNING user_id, email, first_name, last_name',
            [email, passwordHash, firstName, lastName]
        );

        const user = newUser.rows[0];

        res.status(201).json({
            message: 'User created successfully',
            user: {
                user_id: user.user_id,
                email: user.email,
                full_name: `${user.first_name} ${user.last_name}`.trim()
            }
        });
    } catch (err) {
        console.error('Signup error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        // Find user
        const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const user = result.rows[0];

        // Verify password
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // In a real app, generate JWT here. For now, just return success.
        res.json({
            message: 'Login successful',
            user: {
                user_id: user.user_id,
                email: user.email,
                full_name: `${user.first_name} ${user.last_name}`.trim(),
                current_job: user.bio ? user.bio.split('.')[0] : '' // Simple extraction
            }
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
