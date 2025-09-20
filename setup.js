#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 CITBIF Setup Script\n');

// Check if Node.js version is compatible
const nodeVersion = process.version;
const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);

if (majorVersion < 18) {
  console.error('❌ Node.js version 18 or higher is required');
  console.error(`   Current version: ${nodeVersion}`);
  process.exit(1);
}

console.log(`✅ Node.js version: ${nodeVersion}`);

// Check if MongoDB is running (optional)
try {
  execSync('mongod --version', { stdio: 'ignore' });
  console.log('✅ MongoDB is installed');
} catch (error) {
  console.log('⚠️  MongoDB not found - please install MongoDB for the backend to work');
}

// Create .env file for backend if it doesn't exist
const envPath = path.join(__dirname, 'backend', '.env');
const envExamplePath = path.join(__dirname, 'backend', 'env.example');

if (!fs.existsSync(envPath)) {
  if (fs.existsSync(envExamplePath)) {
    fs.copyFileSync(envExamplePath, envPath);
    console.log('✅ Created backend/.env from template');
    console.log('   Please edit backend/.env with your configuration');
  } else {
    console.log('⚠️  backend/env.example not found');
  }
} else {
  console.log('✅ backend/.env already exists');
}

// Create uploads directory for backend
const uploadsDir = path.join(__dirname, 'backend', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('✅ Created backend/uploads directory');
}

console.log('\n🎉 Setup complete!');
console.log('\n📋 Next steps:');
console.log('1. Edit backend/.env with your configuration');
console.log('2. Start MongoDB (if not already running)');
console.log('3. Run: npm start');
console.log('   or: npm run dev:all');
console.log('\n🌐 URLs:');
console.log('   Frontend: http://localhost:5173');
console.log('   Backend:  http://localhost:5000');
console.log('   Health:   http://localhost:5000/health');
