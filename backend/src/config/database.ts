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
    pgPool.on('error', (err) => {
      console.error('❌ PostgreSQL connection error:', err);
    });
    
  } catch (error) {
    console.error('❌ Error connecting to PostgreSQL:', error);
    throw error;
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
