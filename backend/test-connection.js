const { Pool } = require('pg');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// PostgreSQL Configuration
const PG_CONFIG = {
  user: process.env.PG_USER || 'postgres',
  host: process.env.PG_HOST || 'localhost',
  database: process.env.PG_DATABASE || 'citbif',
  password: process.env.PG_PASSWORD || '',
  port: parseInt(process.env.PG_PORT || '5432'),
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
};

console.log('🔍 Testing PostgreSQL Connection...');
console.log('Configuration:', {
  host: PG_CONFIG.host,
  port: PG_CONFIG.port,
  database: PG_CONFIG.database,
  user: PG_CONFIG.user,
  ssl: PG_CONFIG.ssl
});

const pool = new Pool(PG_CONFIG);

async function testConnection() {
  try {
    console.log('\n📡 Attempting to connect to PostgreSQL...');
    
    // Test basic connection
    const client = await pool.connect();
    console.log('✅ Successfully connected to PostgreSQL!');
    
    // Test database query
    const result = await client.query('SELECT version(), current_database(), current_user');
    console.log('\n📊 Database Information:');
    console.log('  PostgreSQL Version:', result.rows[0].version.split(' ')[0] + ' ' + result.rows[0].version.split(' ')[1]);
    console.log('  Current Database:', result.rows[0].current_database);
    console.log('  Current User:', result.rows[0].current_user);
    
    // Check if our target database exists
    const dbCheck = await client.query('SELECT 1 FROM pg_database WHERE datname = $1', [PG_CONFIG.database]);
    if (dbCheck.rowCount > 0) {
      console.log('✅ Target database exists');
    } else {
      console.log('⚠️  Target database does not exist');
    }
    
    client.release();
    
    // Test Prisma connection
    console.log('\n🔧 Testing Prisma connection...');
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    
    await prisma.$connect();
    console.log('✅ Prisma connected successfully!');
    
    // Test a simple query
    const userCount = await prisma.user.count();
    console.log('📈 Users in database:', userCount);
    
    await prisma.$disconnect();
    
    console.log('\n🎉 All connection tests passed!');
    
  } catch (error) {
    console.error('\n❌ Connection failed:');
    console.error('Error:', error.message);
    console.error('Code:', error.code);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Troubleshooting tips:');
      console.log('  - Make sure PostgreSQL is running');
      console.log('  - Check if the host and port are correct');
      console.log('  - Verify PostgreSQL is installed and started');
    } else if (error.code === '28P01') {
      console.log('\n💡 Authentication failed:');
      console.log('  - Check username and password');
      console.log('  - Verify user has access to the database');
    } else if (error.code === '3D000') {
      console.log('\n💡 Database does not exist:');
      console.log('  - Create the database or check the database name');
    }
  } finally {
    await pool.end();
    console.log('\n🔌 Connection pool closed');
  }
}

testConnection().catch(console.error);


