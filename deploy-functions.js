const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const functionsDir = path.join(__dirname, 'supabase', 'functions');
const functionsToSkip = ['_shared']; // Skip directories that aren't functions

// Check if Supabase CLI is installed
try {
  execSync('supabase --version', { stdio: 'ignore' });
} catch (error) {
  console.error('\x1b[31mError: Supabase CLI is not installed or not in PATH\x1b[0m');
  console.log('Please install it by following instructions at:');
  console.log('https://supabase.com/docs/guides/cli');
  process.exit(1);
}

// Get all function directories
const functionDirs = fs.readdirSync(functionsDir)
  .filter(dir => {
    const stats = fs.statSync(path.join(functionsDir, dir));
    return stats.isDirectory() && !functionsToSkip.includes(dir);
  });

if (functionDirs.length === 0) {
  console.log('No functions found to deploy.');
  process.exit(0);
}

console.log(`\x1b[36mFound ${functionDirs.length} function(s) to deploy:\x1b[0m`);
functionDirs.forEach(dir => console.log(`- ${dir}`));

// Deploy each function
let successCount = 0;
let failCount = 0;

functionDirs.forEach(functionName => {
  console.log(`\n\x1b[36mDeploying function: ${functionName}...\x1b[0m`);
  
  try {
    execSync(`supabase functions deploy ${functionName}`, { 
      stdio: 'inherit',
      cwd: __dirname
    });
    console.log(`\x1b[32mSuccessfully deployed function: ${functionName}\x1b[0m`);
    successCount++;
  } catch (error) {
    console.error(`\x1b[31mFailed to deploy function: ${functionName}\x1b[0m`);
    failCount++;
  }
});

// Summary
console.log('\n\x1b[36m=== Deployment Summary ===\x1b[0m');
console.log(`Total functions: ${functionDirs.length}`);
console.log(`\x1b[32mSuccessfully deployed: ${successCount}\x1b[0m`);
if (failCount > 0) {
  console.log(`\x1b[31mFailed to deploy: ${failCount}\x1b[0m`);
}

// Instructions for testing
if (successCount > 0) {
  console.log('\n\x1b[36mTo test the deployed functions, you can use:\x1b[0m');
  console.log('supabase functions serve --no-verify-jwt');
  console.log('\n\x1b[36mOr invoke a specific function:\x1b[0m');
  console.log(`curl -i --location --request POST 'http://localhost:54321/functions/v1/send-confirmation-email' \\
  --header 'Authorization: Bearer YOUR_ANON_KEY' \\
  --header 'Content-Type: application/json' \\
  --data-raw '{
    "booking_id": "123",
    "email": "test@example.com",
    "name": "Test User",
    "event_title": "Test Event",
    "event_date": "2023-12-31T19:00:00",
    "event_location": "Test Venue",
    "quantity": 2,
    "reference_number": "CEL-ABC123",
    "total_amount": 29.98
  }'`);
} 