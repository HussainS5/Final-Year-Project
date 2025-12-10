/**
 * Set default password for all migrated users
 * This allows them to login immediately without password reset
 * 
 * Usage: cd backend && node scripts/set-default-password.js
 */

const { supabaseAdmin } = require('../config/supabase');

const DEFAULT_PASSWORD = '123456'; // Default password (minimum 6 chars required by Supabase)

async function setDefaultPasswords() {
  try {
    console.log('🔐 Setting default password for migrated users...\n');
    console.log(`Default password: ${DEFAULT_PASSWORD}\n`);

    // Get all users from Supabase Auth
    const { data: usersList, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (listError) {
      console.error('❌ Error fetching users:', listError.message);
      return;
    }

    if (!usersList?.users || usersList.users.length === 0) {
      console.log('No users found in Supabase Auth');
      return;
    }

    console.log(`Found ${usersList.users.length} users\n`);

    let successCount = 0;
    let errorCount = 0;

    for (const user of usersList.users) {
      try {
        // Check if user is migrated (has migrated metadata)
        const isMigrated = user.user_metadata?.migrated === true;
        
        if (isMigrated) {
          // Update password for migrated users
          const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
            user.id,
            { password: DEFAULT_PASSWORD }
          );

          if (updateError) {
            console.error(`❌ ${user.email} - ${updateError.message}`);
            errorCount++;
          } else {
            console.log(`✓ ${user.email} - Password set to default`);
            successCount++;
          }
        } else {
          // For new users, also set default password (optional)
          const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
            user.id,
            { password: DEFAULT_PASSWORD }
          );

          if (updateError) {
            console.error(`❌ ${user.email} - ${updateError.message}`);
            errorCount++;
          } else {
            console.log(`✓ ${user.email} - Password set to default`);
            successCount++;
          }
        }
      } catch (error) {
        console.error(`❌ ${user.email} - ${error.message}`);
        errorCount++;
      }
    }

    console.log('\n' + '='.repeat(50));
    console.log('📊 Summary:');
    console.log(`   ✅ Successfully updated: ${successCount}`);
    console.log(`   ❌ Errors: ${errorCount}`);
    console.log('='.repeat(50));
    console.log(`\n🔑 All users can now login with password: ${DEFAULT_PASSWORD}`);
    console.log('⚠️  IMPORTANT: Change this password in production!');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    process.exit(0);
  }
}

setDefaultPasswords();

