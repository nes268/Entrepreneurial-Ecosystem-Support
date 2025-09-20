# 🚀 CITBIF Quick Start Guide

## One-Command Setup & Run

### 1. Initial Setup (First Time Only)
```bash
# Install all dependencies (frontend + backend)
npm run install:all

# Run setup script to configure environment
npm run setup
```

### 2. Start Development Servers
```bash
# Option 1: Simple start (recommended)
npm start

# Option 2: Using concurrently directly
npm run dev:all
```

## 🎯 What Each Command Does

| Command | Description |
|---------|-------------|
| `npm start` | Smart start script that installs backend deps if needed, then starts both servers |
| `npm run dev:all` | Starts both frontend and backend using concurrently |
| `npm run dev:frontend` | Starts only the React frontend (port 5173) |
| `npm run dev:backend` | Starts only the Node.js backend (port 5000) |
| `npm run setup` | Initial setup: creates .env, uploads folder, checks dependencies |
| `npm run install:all` | Installs dependencies for both frontend and backend |

## 🌐 Access Your Application

- **Frontend (React):** http://localhost:5173
- **Backend API:** http://localhost:5000
- **API Health Check:** http://localhost:5000/health

## ⚙️ Configuration

After running `npm run setup`, edit `backend/.env` with your settings:

```env
# Required
MONGODB_URI=mongodb://localhost:27017/citbif
JWT_SECRET=your-super-secret-jwt-key-here

# Optional
CORS_ORIGIN=http://localhost:5173
SMTP_HOST=smtp.gmail.com
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

## 🛠️ Development Workflow

1. **Start development:**
   ```bash
   npm start
   ```

2. **Make changes** to your code (both frontend and backend will auto-reload)

3. **Stop servers:** Press `Ctrl+C`

4. **Restart:** Run `npm start` again

## 📁 Project Structure

```
citbif/
├── src/                    # Frontend (React + Vite)
├── backend/                # Backend (Node.js + Express)
├── package.json           # Root package.json with unified scripts
├── start-dev.js           # Smart development starter
├── setup.js               # Initial setup script
└── README.md              # Full documentation
```

## 🚨 Troubleshooting

### Backend won't start?
- Check if MongoDB is running
- Verify `backend/.env` configuration
- Run `cd backend && npm install` manually

### Frontend won't start?
- Check if port 5173 is available
- Run `npm install` in root directory

### Port conflicts?
- Frontend: Change port in `vite.config.ts`
- Backend: Change `PORT` in `backend/.env`

## 🎉 You're Ready!

Your CITBIF platform is now running with:
- ✅ React frontend with TypeScript
- ✅ Node.js backend with Express
- ✅ MongoDB database integration
- ✅ JWT authentication
- ✅ File upload support
- ✅ Email notifications
- ✅ Complete API for all features

Happy coding! 🚀
