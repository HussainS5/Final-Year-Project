// Script to create Supabase Storage bucket
// Run this once: node scripts/create-bucket.js

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://cdqppolfiyhkvcqhkivy.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseKey) {
  console.error('❌ NEXT_PUBLIC_SUPABASE_ANON_KEY not found in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function createBucket() {
  console.log('🔧 Creating resumes bucket...');
  console.log('Supabase URL:', supabaseUrl);

  try {
    // Note: Creating buckets via the client requires service role key
    // For anon key, we need to use the REST API or SQL
    
    // Try to list buckets first to check if it exists
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error('❌ Error listing buckets:', listError);
      console.log('\n📝 You need to create the bucket manually:');
      console.log('   1. Go to: https://supabase.com/dashboard');
      console.log('   2. Select your project');
      console.log('   3. Go to Storage → New bucket');
      console.log('   4. Name: resumes');
      console.log('   5. Check "Public bucket"');
      console.log('   6. Click Create\n');
      return;
    }

    const resumesBucket = buckets?.find(b => b.id === 'resumes');
    
    if (resumesBucket) {
      console.log('✅ Bucket "resumes" already exists!');
      return;
    }

    console.log('⚠️  Bucket creation via client requires service role key.');
    console.log('📝 Please create the bucket manually:\n');
    console.log('   Option 1: Supabase Dashboard');
    console.log('   1. Go to: https://supabase.com/dashboard');
    console.log('   2. Select your project');
    console.log('   3. Click "Storage" in left sidebar');
    console.log('   4. Click "New bucket"');
    console.log('   5. Name: resumes');
    console.log('   6. Check "Public bucket"');
    console.log('   7. Click "Create bucket"\n');
    
    console.log('   Option 2: SQL Editor');
    console.log('   1. Go to SQL Editor in Supabase Dashboard');
    console.log('   2. Run this SQL:');
    console.log(`
      INSERT INTO storage.buckets (id, name, public)
      VALUES ('resumes', 'resumes', true)
      ON CONFLICT (id) DO NOTHING;
    `);
    console.log('   3. Click "Run"\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

createBucket();

