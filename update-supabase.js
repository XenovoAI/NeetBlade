// Quick script to update Supabase credentials
// Usage: node update-supabase.js YOUR_URL YOUR_KEY

import { readFileSync, writeFileSync } from 'fs';

const args = process.argv.slice(2);

if (args.length < 2) {
  console.log('❌ Usage: node update-supabase.js YOUR_SUPABASE_URL YOUR_ANON_KEY');
  console.log('');
  console.log('Example:');
  console.log('  node update-supabase.js https://xxxxx.supabase.co eyJhbGc...');
  process.exit(1);
}

const [url, key] = args;

// Validate URL
if (!url.startsWith('https://') || !url.includes('.supabase.co')) {
  console.log('❌ Invalid Supabase URL. Should be like: https://xxxxx.supabase.co');
  process.exit(1);
}

// Validate key
if (!key.startsWith('eyJ')) {
  console.log('❌ Invalid anon key. Should start with: eyJ');
  process.exit(1);
}

const envContent = `VITE_SUPABASE_URL=${url}
VITE_SUPABASE_ANON_KEY=${key}
`;

try {
  // Update root .env
  writeFileSync('.env', envContent);
  console.log('✅ Updated .env');

  // Update client/.env
  writeFileSync('client/.env', envContent);
  console.log('✅ Updated client/.env');

  console.log('');
  console.log('🎉 Credentials updated successfully!');
  console.log('');
  console.log('Next steps:');
  console.log('1. Run database migrations in Supabase SQL Editor');
  console.log('2. Restart your dev server: npm run dev');
} catch (error) {
  console.error('❌ Error updating files:', error.message);
  process.exit(1);
}
