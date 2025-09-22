import mongoose from 'mongoose';
import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// MongoDB Configuration
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/CITBIF';

// PostgreSQL Configuration
const PG_CONFIG = {
  user: process.env.PG_USER || 'postgres',
  host: process.env.PG_HOST || 'localhost',
  database: process.env.PG_DATABASE || 'postgres',
  password: process.env.PG_PASSWORD || 'lovebird@2809',
  port: parseInt(process.env.PG_PORT || '5432'),
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
};

// PostgreSQL Connection Pool
export const pgPool = new Pool(PG_CONFIG);

// MongoDB Connection
export const connectMongoDB = async (): Promise<void> => {
  try {
    const conn = await mongoose.connect(MONGODB_URI);
    
    console.log(`📦 MongoDB Connected: ${conn.connection.host}`);
    console.log(`🗄️  MongoDB Database: ${conn.connection.name}`);
    
    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('⚠️  MongoDB disconnected');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('✅ MongoDB reconnected');
    });

  } catch (error) {
    console.error('❌ Error connecting to MongoDB:', error);
    throw error;
  }
};

// PostgreSQL Connection
export const connectPostgreSQL = async (): Promise<void> => {
  try {
    const client = await pgPool.connect();
    const result = await client.query('SELECT NOW()');
    client.release();
    
    console.log(`🐘 PostgreSQL Connected: ${PG_CONFIG.host}:${PG_CONFIG.port}`);
    console.log(`🗄️  PostgreSQL Database: ${PG_CONFIG.database}`);
    console.log(`⏰ Connection time: ${result.rows[0].now}`);
    
    // Handle pool events
    pgPool.on('error', (err: Error) => {
      console.error('❌ PostgreSQL connection error:', err);
    });
    
  } catch (error) {
    console.error('❌ Error connecting to PostgreSQL:', error);
    throw error;
  }
};

// Initialize PostgreSQL tables
export const initializePGTables = async (): Promise<void> => {
  const client = await pgPool.connect();
  
  try {
    // Create users table for relational user data
    await client.query(`
      CREATE TABLE IF NOT EXISTS pg_users (
        id SERIAL PRIMARY KEY,
        mongo_user_id VARCHAR(24) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        role VARCHAR(50) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_login TIMESTAMP,
        login_count INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT true
      )
    `);

    // Create user_sessions table for session management
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_sessions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES pg_users(id) ON DELETE CASCADE,
        session_token VARCHAR(255) NOT NULL,
        refresh_token VARCHAR(255),
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        ip_address INET,
        user_agent TEXT
      )
    `);

    // Create user_activities table for audit logging
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_activities (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES pg_users(id) ON DELETE CASCADE,
        activity_type VARCHAR(100) NOT NULL,
        activity_description TEXT,
        ip_address INET,
        user_agent TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create settings table for application settings
    await client.query(`
      CREATE TABLE IF NOT EXISTS app_settings (
        id SERIAL PRIMARY KEY,
        key VARCHAR(100) UNIQUE NOT NULL,
        value TEXT,
        description TEXT,
        is_public BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create notifications table for system notifications
    await client.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES pg_users(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        type VARCHAR(50) DEFAULT 'info',
        is_read BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        read_at TIMESTAMP
      )
    `);

    // Create indexes for performance
    await client.query(`CREATE INDEX IF NOT EXISTS idx_users_email ON pg_users(email)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_users_mongo_id ON pg_users(mongo_user_id)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_sessions_token ON user_sessions(session_token)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_sessions_user ON user_sessions(user_id)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_activities_user ON user_activities(user_id)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(is_read)`);

    console.log('✅ PostgreSQL tables initialized successfully');
  } catch (error) {
    console.error('❌ Error initializing PostgreSQL tables:', error);
    throw error;
  } finally {
    client.release();
  }
};

// Combined database connection function
export const connectDB = async (): Promise<void> => {
  try {
    console.log('🔌 Connecting to databases...');
    
    // Connect to MongoDB
    await connectMongoDB();
    
    // Connect to PostgreSQL
    await connectPostgreSQL();
    
    // Initialize PostgreSQL tables
    await initializePGTables();
    
    console.log('✅ All databases connected successfully');
    
    // Graceful shutdown
    process.on('SIGINT', async () => {
      console.log('🔌 Closing database connections...');
      await mongoose.connection.close();
      await pgPool.end();
      console.log('🔌 Database connections closed');
      process.exit(0);
    });
    
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }
};

export default connectDB;
