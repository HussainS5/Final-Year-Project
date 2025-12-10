/**
 * Migration script - Version 2
 * Temporarily disables sync trigger, migrates users, then re-enables
 * 
 * Usage: cd backend && node scripts/migrate-existing-users-v2.js
 */

const db = require('../config/db');
const { supabaseAdmin } = require('../config/supabase');

async function migrateUsers() {
  try {
    console.log('🔄 Starting migration...\n');

    // Step 1: Temporarily disable sync trigger
    console.log('1. Disabling sync trigger...');
    try {
      await db.query('DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users');
      await db.query('DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users');
      console.log('   ✓ Triggers disabled\n');
    } catch (err) {
      console.log('   ⚠ Could not disable triggers (may not exist):', err.message);
    }

    // Step 2: Fetch existing users
    console.log('2. Fetching existing users...');
    const result = await db.query(
      'SELECT user_id, email, password_hash, first_name, last_name FROM users WHERE password_hash != $1', 
      ['supabase_auth']
    );
    console.log(`   Found ${result.rows.length} users to migrate\n`);

    if (result.rows.length === 0) {
      console.log('✅ No users to migrate. All users are already using Supabase Auth.');
      return;
    }

    // Step 3: Migrate each user
    let successCount = 0;
    let skipCount = 0;
    let errorCount = 0;

    for (const user of result.rows) {
      try {
        // Check if user already exists in Supabase Auth
        const { data: usersList } = await supabaseAdmin.auth.admin.listUsers();
        const existingUser = usersList?.users?.find(u => u.email === user.email);
        
        if (existingUser) {
          console.log(`✓ ${user.email} - Already in Supabase Auth (UUID: ${existingUser.id})`);
          await db.query('UPDATE users SET password_hash = $1 WHERE user_id = $2', ['supabase_auth', user.user_id]);
          skipCount++;
          continue;
        }

        // Create user in Supabase Auth
        const tempPassword = `TempPass${Date.now()}${Math.floor(Math.random() * 10000)}`;
        const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
          email: user.email,
          password: tempPassword,
          email_confirm: true,
          user_metadata: {
            first_name: user.first_name || '',
            last_name: user.last_name || '',
            migrated: true,
            old_user_id: user.user_id.toString()
          }
        });

        if (authError) {
          console.error(`❌ ${user.email} - ${authError.message}`);
          errorCount++;
          continue;
        }

        // Mark as migrated
        await db.query('UPDATE users SET password_hash = $1 WHERE user_id = $2', ['supabase_auth', user.user_id]);
        console.log(`✓ ${user.email} - Created in Supabase Auth (UUID: ${authUser.user.id})`);
        successCount++;

        // Send password reset email
        try {
          await supabaseAdmin.auth.admin.generateLink({
            type: 'recovery',
            email: user.email
          });
        } catch (emailError) {
          // Ignore email errors
        }

      } catch (error) {
        console.error(`❌ ${user.email} - ${error.message}`);
        errorCount++;
      }
    }

    // Step 4: Re-enable sync trigger
    console.log('\n3. Re-enabling sync trigger...');
    try {
      // Recreate triggers (run sync-auth-users.sql manually if needed)
      console.log('   ⚠ Please run scripts/sync-auth-users.sql in Supabase SQL Editor to re-enable triggers');
    } catch (err) {
      console.log('   ⚠ Could not re-enable triggers:', err.message);
    }

    // Summary
    console.log('\n' + '='.repeat(50));
    console.log('📊 Migration Summary:');
    console.log(`   ✅ Successfully migrated: ${successCount}`);
    console.log(`   ⏭️  Already existed (skipped): ${skipCount}`);
    console.log(`   ❌ Errors: ${errorCount}`);
    console.log('='.repeat(50));
    console.log('\n📧 Note: Migrated users need to reset passwords via "Forgot Password"');
    
  } catch (error) {
    console.error('❌ Migration error:', error);
  } finally {
    process.exit(0);
  }
}

migrateUsers();

