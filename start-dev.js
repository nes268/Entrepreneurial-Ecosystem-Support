#!/usr/bin/env node

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Starting CITBIF Development Environment...\n');

// Check if backend dependencies are installed
const backendNodeModules = path.join(__dirname, 'backend', 'node_modules');

if (!fs.existsSync(backendNodeModules)) {
  console.log('📦 Installing backend dependencies...');
  const installBackend = spawn('npm', ['install'], {
    cwd: path.join(__dirname, 'backend'),
    stdio: 'inherit',
    shell: true
  });

  installBackend.on('close', (code) => {
    if (code === 0) {
      console.log('✅ Backend dependencies installed successfully!\n');
      startServers();
    } else {
      console.error('❌ Failed to install backend dependencies');
      process.exit(1);
    }
  });
} else {
  startServers();
}

function startServers() {
  console.log('🔥 Starting Frontend (React + Vite)...');
  console.log('🔥 Starting Backend (Node.js + Express)...\n');
  
  console.log('📱 Frontend will be available at: http://localhost:5173');
  console.log('🔧 Backend API will be available at: http://localhost:5000');
  console.log('💚 Health check: http://localhost:5000/health\n');
  
  console.log('Press Ctrl+C to stop both servers\n');

  // Start frontend
  const frontend = spawn('npm', ['run', 'dev'], {
    stdio: 'inherit',
    shell: true
  });

  // Start backend
  const backend = spawn('npm', ['run', 'dev'], {
    cwd: path.join(__dirname, 'backend'),
    stdio: 'inherit',
    shell: true
  });

  // Handle process termination
  process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down servers...');
    frontend.kill('SIGINT');
    backend.kill('SIGINT');
    process.exit(0);
  });

  // Handle errors
  frontend.on('error', (err) => {
    console.error('❌ Frontend error:', err);
  });

  backend.on('error', (err) => {
    console.error('❌ Backend error:', err);
  });
}
