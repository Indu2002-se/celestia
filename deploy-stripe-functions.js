#!/usr/bin/env node

/**
 * Stripe Payment Functions Deployment Script
 * Deploys all Stripe-related Edge Functions to Supabase
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const FUNCTIONS = [
  'create-payment-intent',
  'stripe-webhook',
  'confirm-payment'
];

const SUPABASE_PROJECT_REF = 'mocdyrlqznqaulkwfkgi';

console.log('🚀 Deploying Stripe Payment Functions to Supabase...\n');

// Check if Supabase CLI is installed
try {
  execSync('supabase --version', { stdio: 'ignore' });
} catch (error) {
  console.error('❌ Supabase CLI not found. Please install it first:');
  console.error('   npm install -g supabase');
  console.error('   or visit: https://supabase.com/docs/guides/cli');
  process.exit(1);
}

// Check if user is logged in
try {
  execSync('supabase status', { stdio: 'ignore' });
} catch (error) {
  console.error('❌ Not logged in to Supabase. Please run:');
  console.error('   supabase login');
  process.exit(1);
}

// Deploy each function
FUNCTIONS.forEach((functionName) => {
  const functionPath = path.join(__dirname, 'supabase', 'functions', functionName);
  
  if (!fs.existsSync(functionPath)) {
    console.error(`❌ Function ${functionName} not found at ${functionPath}`);
    return;
  }
  
  console.log(`📦 Deploying ${functionName}...`);
  
  try {
    execSync(`supabase functions deploy ${functionName} --project-ref ${SUPABASE_PROJECT_REF}`, {
      stdio: 'inherit',
      cwd: __dirname
    });
    console.log(`✅ ${functionName} deployed successfully!\n`);
  } catch (error) {
    console.error(`❌ Failed to deploy ${functionName}:`, error.message);
  }
});

console.log('🎉 Deployment complete!');
console.log('\n📋 Next steps:');
console.log('1. Set environment variables in Supabase dashboard');
console.log('2. Configure Stripe webhooks');
console.log('3. Test payment flow with test cards');
console.log('\n📖 See STRIPE_SECURITY_GUIDE.md for detailed setup instructions');
