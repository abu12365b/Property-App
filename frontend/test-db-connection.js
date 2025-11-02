// test-db-connection.js
// Run this script to test your database connection: node test-db-connection.js
require('dotenv').config({ path: '.env.local' });

const { PrismaClient } = require('@prisma/client');

async function testConnection() {
  const prisma = new PrismaClient();
  
  try {
    console.log('Testing database connection...');
    console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Set ✓' : 'Missing ✗');
    console.log('DIRECT_URL:', process.env.DIRECT_URL ? 'Set ✓' : 'Missing ✗');
    
    // Test the connection
    await prisma.$connect();
    console.log('✓ Database connection successful!');
    
    // Try a simple query
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('✓ Test query successful:', result);
    
  } catch (error) {
    console.error('✗ Database connection failed:');
    console.error('Error:', error.message);
    
    if (error.message.includes('Authentication failed')) {
      console.log('\n🔧 Fix: Update your database password in .env.local');
      console.log('   1. Go to https://supabase.com/dashboard/project/wihbgmcknjofyrvfqefe/settings/database');
      console.log('   2. Get your database password');
      console.log('   3. Replace [YOUR_PASSWORD] in DATABASE_URL and DIRECT_URL');
    }
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();