const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { supabaseAdmin } = require('../config/supabase');

// POST /api/auth/signup - Now uses Supabase Auth
router.post('/signup', async (req, res) => {
    try {
        const { email, password, full_name } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        // Split full_name into first and last name
        const nameParts = full_name ? full_name.split(' ') : [''];
        const firstName = nameParts[0];
        const lastName = nameParts.slice(1).join(' ') || '';

        // Create user in Supabase Auth
        const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true, // Auto-confirm email
            user_metadata: {
                full_name,
                first_name: firstName,
                last_name: lastName
            }
        });

        if (authError) {
            console.error('Supabase Auth signup error:', authError);
            return res.status(400).json({ error: authError.message || 'Failed to create user' });
        }

        // Sync to users table (link by email since user_id types differ: UUID vs INTEGER)
        try {
            const existingUser = await db.query('SELECT * FROM users WHERE email = $1', [email]);
            if (existingUser.rows.length === 0) {
                // Create new user record with auto-increment INTEGER user_id
                await db.query(
                    `INSERT INTO users (email, password_hash, first_name, last_name) 
                     VALUES ($1, $2, $3, $4)`,
                    [email, 'supabase_auth', firstName, lastName]
                );
            } else {
                // User already exists, just update password_hash
                await db.query(
                    `UPDATE users SET password_hash = $1, first_name = $2, last_name = $3 WHERE email = $4`,
                    ['supabase_auth', firstName, lastName, email]
                );
            }
        } catch (syncError) {
            console.error('Error syncing to users table:', syncError);
            // Don't fail signup if sync fails, user is already in Supabase Auth
        }

        // Get the created user from users table to return INTEGER user_id
        const userResult = await db.query('SELECT * FROM users WHERE email = $1', [email]);
        const dbUser = userResult.rows[0];

        res.status(201).json({
            message: 'User created successfully',
            user: {
                user_id: dbUser?.user_id || null,
                email: authUser.user.email,
                full_name: `${firstName} ${lastName}`.trim()
            },
            session: authUser.session // Supabase session with JWT tokens
        });
    } catch (err) {
        console.error('Signup error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// POST /api/auth/login - Now uses Supabase Auth
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        // Authenticate with Supabase Auth
        const { data: authData, error: authError } = await supabaseAdmin.auth.signInWithPassword({
            email,
            password
        });

        if (authError || !authData.user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Sync to users table if not exists (link by email since user_id types differ)
        try {
          const existingUser = await db.query('SELECT * FROM users WHERE email = $1', [authData.user.email]);
          if (existingUser.rows.length === 0) {
            // User doesn't exist, create new record with auto-increment INTEGER user_id
            await db.query(
              `INSERT INTO users (email, password_hash, first_name, last_name) 
               VALUES ($1, $2, $3, $4)`,
              [
                authData.user.email,
                'supabase_auth',
                authData.user.user_metadata?.first_name || '',
                authData.user.user_metadata?.last_name || ''
              ]
            );
          } else {
            // User exists, just update password_hash to mark as migrated
            await db.query(
              `UPDATE users SET password_hash = $1 WHERE email = $2`,
              ['supabase_auth', authData.user.email]
            );
          }
        } catch (syncError) {
          console.error('Error syncing to users table:', syncError);
          // Continue even if sync fails
        }

        // Get user from users table for full profile (link by email since user_id types differ)
        const userResult = await db.query('SELECT * FROM users WHERE email = $1', [authData.user.email]);
        const user = userResult.rows[0] || {
          user_id: null, // Will be set by database auto-increment
          email: authData.user.email,
          first_name: authData.user.user_metadata?.first_name || '',
          last_name: authData.user.user_metadata?.last_name || ''
        };

        // Check if 2FA is enabled from user metadata
        const mfaEnabled = authData.user.user_metadata?.mfa_enabled || false;

        res.json({
            message: 'Login successful',
            user: {
                user_id: user.user_id,
                email: user.email,
                full_name: `${user.first_name} ${user.last_name}`.trim(),
                current_job: user.bio ? user.bio.split('.')[0] : '',
                user_metadata: {
                  mfa_enabled: mfaEnabled
                }
            },
            session: authData.session // Supabase session with JWT tokens
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// GET /api/auth/user-by-email/:email - Get INTEGER user_id by email
router.get('/user-by-email/:email', async (req, res) => {
    try {
        const { email } = req.params;
        
        const userResult = await db.query('SELECT user_id, email, first_name, last_name FROM users WHERE email = $1', [email]);
        
        if (userResult.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        res.json({ user_id: userResult.rows[0].user_id });
    } catch (err) {
        console.error('Error fetching user by email:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
