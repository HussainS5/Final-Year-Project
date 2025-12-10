/**
 * Migration script to move existing users from users table to Supabase Auth
 * Run this once to migrate existing users
 * 
 * Usage: cd backend && node scripts/migrate-existing-users.js
 */

const db = require('../config/db');
const { supabaseAdmin } = require('../config/supabase');

async function migrateUsers() {
  try {
    console.log('Fetching existing users from users table...');
    const result = await db.query('SELECT user_id, email, password_hash, first_name, last_name FROM users WHERE password_hash != $1', ['supabase_auth']);
    
    console.log(`Found ${result.rows.length} users to migrate`);

    if (result.rows.length === 0) {
      console.log('No users to migrate. All users are already using Supabase Auth.');
      return;
    }

    for (const user of result.rows) {
      try {
        // Check if user already exists in Supabase Auth by email
        let existingAuthUser = null;
        try {
          const { data: usersByEmail } = await supabaseAdmin.auth.admin.listUsers();
          existingAuthUser = usersByEmail.users.find(u => u.email === user.email);
        } catch (err) {
          console.log(`  ⚠ Could not check existing users: ${err.message}`);
        }
        
        if (existingAuthUser) {
          console.log(`✓ User ${user.email} already exists in Supabase Auth (UUID: ${existingAuthUser.id}), marking as migrated...`);
          await db.query('UPDATE users SET password_hash = $1 WHERE user_id = $2', ['supabase_auth', user.user_id]);
          continue;
        }

        // Create user in Supabase Auth
        // Note: Supabase Auth will generate a UUID
        // We'll keep the INTEGER user_id in users table and link via email
        const tempPassword = `TempPass${Date.now()}${Math.floor(Math.random() * 1000)}`;
        const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
          email: user.email,
          password: tempPassword,
          email_confirm: true,
          user_metadata: {
            first_name: user.first_name || '',
            last_name: user.last_name || '',
            migrated: true,
            old_user_id: user.user_id.toString() // Store old INTEGER ID for reference
          }
        });

        if (authError) {
          console.error(`❌ Error migrating user ${user.email}:`, authError.message);
          // Check if it's a duplicate email error
          if (authError.message.includes('already registered') || authError.message.includes('already exists')) {
            console.log(`  → User already exists, marking as migrated...`);
            await db.query('UPDATE users SET password_hash = $1 WHERE user_id = $2', ['supabase_auth', user.user_id]);
          }
          continue;
        }

        const newUserId = authUser.user.id; // UUID from Supabase Auth

        // Mark as migrated in users table
        // Note: We keep INTEGER user_id, Supabase Auth has UUID
        // The sync trigger will handle new users going forward
        try {
          await db.query(
            `UPDATE users SET password_hash = $1 WHERE user_id = $2`,
            ['supabase_auth', user.user_id]
          );
          
          console.log(`✓ Migrated user ${user.email}`);
          console.log(`  → Users table ID: ${user.user_id} (INTEGER)`);
          console.log(`  → Supabase Auth UUID: ${newUserId}`);
        } catch (updateError) {
          console.error(`Error updating user ${user.email} in database:`, updateError.message);
          // Delete the Supabase Auth user if DB update fails
          try {
            await supabaseAdmin.auth.admin.deleteUser(newUserId);
          } catch (deleteError) {
            // Ignore delete errors
          }
          continue;
        }
        
        // Send password reset email
        try {
          await supabaseAdmin.auth.admin.generateLink({
            type: 'recovery',
            email: user.email
          });
          console.log(`  → Password reset email sent to ${user.email}`);
        } catch (emailError) {
          console.log(`  ⚠ Could not send password reset email to ${user.email}`);
        }

      } catch (error) {
        console.error(`Error migrating user ${user.email}:`, error.message);
      }
    }

    console.log('\n✅ Migration completed!');
    console.log('📧 Note: Migrated users will need to reset their passwords via email.');
    console.log('   They can use the "Forgot Password" link on the login page.');
    
  } catch (error) {
    console.error('❌ Migration error:', error);
  } finally {
    // Don't close the pool as it's shared
    process.exit(0);
  }
}

migrateUsers();

