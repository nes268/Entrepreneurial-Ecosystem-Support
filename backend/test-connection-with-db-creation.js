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

async function ensureDatabaseExists() {
  const targetDb = PG_CONFIG.database;
  
  try {
    // Try connecting to the target DB first
    const testPool = new Pool(PG_CONFIG);
    const client = await testPool.connect();
    client.release();
    await testPool.end();
    console.log('✅ Target database already exists');
    return;
  } catch (err) {
    const error = err;
    const code = error.code || '';
    const message = String(error.message || err);

    if (code === '3D000' || message.includes('does not exist')) {
      console.log('🆕 Creating database...');
      const adminPool = new Pool({ ...PG_CONFIG, database: 'postgres' });
      try {
        const adminClient = await adminPool.connect();
        const checkRes = await adminClient.query('SELECT 1 FROM pg_database WHERE datname = $1', [targetDb]);
        if (checkRes.rowCount === 0) {
          await adminClient.query(`CREATE DATABASE "${targetDb}"`);
          console.log(`✅ Created PostgreSQL database: ${targetDb}`);
        } else {
          console.log('✅ Database already exists');
        }
        adminClient.release();
      } finally {
        await adminPool.end();
      }
    } else {
      throw err;
    }
  }
}

async function testConnection() {
  try {
    console.log('\n📡 Ensuring database exists...');
    await ensureDatabaseExists();
    
    console.log('\n📡 Testing connection to target database...');
    const pool = new Pool(PG_CONFIG);
    const client = await pool.connect();
    console.log('✅ Successfully connected to PostgreSQL!');
    
    // Test database query
    const result = await client.query('SELECT version(), current_database(), current_user');
    console.log('\n📊 Database Information:');
    console.log('  PostgreSQL Version:', result.rows[0].version.split(' ')[0] + ' ' + result.rows[0].version.split(' ')[1]);
    console.log('  Current Database:', result.rows[0].current_database);
    console.log('  Current User:', result.rows[0].current_user);
    
    client.release();
    await pool.end();
    
    // Test Prisma connection
    console.log('\n🔧 Testing Prisma connection...');
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    
    await prisma.$connect();
    console.log('✅ Prisma connected successfully!');
    
    // Test a simple query (this might fail if tables don't exist yet, which is OK)
    try {
      const userCount = await prisma.user.count();
      console.log('📈 Users in database:', userCount);
    } catch (prismaError) {
      console.log('ℹ️  No tables found yet (this is normal for a new database)');
      console.log('   Run "npx prisma migrate deploy" to create the database schema');
    }
    
    await prisma.$disconnect();
    
    console.log('\n🎉 All connection tests passed!');
    console.log('\n📋 Next steps:');
    console.log('   1. Run: npx prisma migrate deploy');
    console.log('   2. Run: npx prisma db seed (optional)');
    
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
    }
  }
}

testConnection().catch(console.error);
