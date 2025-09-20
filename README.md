# CITBIF - Center for Innovation and Technology Business Incubation Forum

A comprehensive platform for startup incubation and innovation management, built with React (Frontend) and Node.js (Backend).

## 🚀 Quick Start

> **📖 For a detailed step-by-step guide, see [QUICK_START.md](./QUICK_START.md)**

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (v5 or higher)
- npm or yarn

### One-Command Setup & Run

1. **Install dependencies and setup:**
   ```bash
   npm run install:all
   npm run setup
   ```

2. **Start both frontend and backend:**
   ```bash
   npm start
   ```

That's it! Your application will be available at:
- **Frontend:** http://localhost:5173
- **Backend:** http://localhost:5000

## 📋 Available Commands

### Development Commands
- `npm run dev:all` - Start both frontend and backend in development mode
- `npm run dev:frontend` - Start only the frontend (React + Vite)
- `npm run dev:backend` - Start only the backend (Node.js + Express)

### Production Commands
- `npm run build:all` - Build both frontend and backend for production
- `npm run start:all` - Start both frontend and backend in production mode

### Individual Commands
- `npm run dev` - Start frontend only (default Vite command)
- `npm run build` - Build frontend only
- `npm run preview` - Preview built frontend
- `npm run lint` - Run ESLint on frontend

### Backend Commands (run from backend/ directory)
- `cd backend && npm run dev` - Start backend development server
- `cd backend && npm run build` - Build backend
- `cd backend && npm start` - Start production backend server
- `cd backend && npm test` - Run backend tests

## 🌐 Application URLs

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:5000
- **API Health Check:** http://localhost:5000/health

## 🏗️ Project Structure

```
citbif/
├── src/                          # Frontend (React + TypeScript)
│   ├── components/               # React components
│   ├── context/                  # React contexts
│   ├── hooks/                    # Custom hooks
│   ├── services/                 # API services
│   └── types/                    # TypeScript types
├── backend/                      # Backend (Node.js + Express)
│   ├── src/
│   │   ├── config/              # Configuration files
│   │   ├── middleware/          # Express middleware
│   │   ├── models/              # Database models
│   │   ├── routes/              # API routes
│   │   ├── utils/               # Utility functions
│   │   └── tests/               # Test files
│   └── package.json             # Backend dependencies
└── package.json                 # Root package.json with scripts
```

## 🔧 Configuration

### Frontend Configuration
The frontend uses Vite and is configured in `vite.config.ts`. No additional configuration needed for basic usage.

### Backend Configuration
The backend configuration is in `backend/src/config/env.ts`. Key environment variables:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/citbif

# JWT
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=http://localhost:5173

# Email (optional)
SMTP_HOST=smtp.gmail.com
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

## 📚 API Documentation

### Authentication Endpoints
- `POST /api/auth/login` - User login
- `POST /api/auth/signup` - User registration
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Core Endpoints
- `GET /api/startups` - Get all startups
- `GET /api/mentors` - Get all mentors
- `GET /api/investors` - Get all investors
- `GET /api/events` - Get all events
- `GET /api/documents` - Get all documents
- `GET /api/reports` - Get all reports

## 🧪 Testing

### Frontend Testing
```bash
# Run frontend tests (if configured)
npm test
```

### Backend Testing
```bash
# Run backend tests
cd backend && npm test
```

## 🚀 Deployment

### Frontend Deployment
```bash
npm run build
# Deploy the 'dist' folder to your hosting service
```

### Backend Deployment
```bash
cd backend
npm run build
npm start
# Deploy to your server (PM2, Docker, etc.)
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

For support and questions, please contact the development team or create an issue in the repository.
