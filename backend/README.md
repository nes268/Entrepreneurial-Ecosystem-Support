# CITBIF Backend API

Backend API for the CITBIF (Center for Innovation and Technology Business Incubation Forum) platform - a comprehensive startup incubation and innovation management system.

## Features

- **User Management**: Authentication, authorization, and user profiles
- **Startup Management**: Application tracking, TRL assessment, and status management
- **Mentor Network**: Mentor profiles, matching, and management
- **Investor Relations**: Investor profiles and startup connections
- **Event Management**: Event creation, registration, and management
- **Document Management**: File uploads, storage, and organization
- **Reporting**: Analytics and report generation
- **Admin Dashboard**: Comprehensive admin controls

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (JSON Web Tokens)
- **File Upload**: Multer
- **Validation**: Joi
- **Email**: Nodemailer
- **Security**: Helmet, CORS, Rate Limiting

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- MongoDB (v5 or higher)
- npm or yarn

### Installation

1. Clone the repository and navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp env.example .env
   ```
   Edit `.env` with your configuration values.

4. Start the development server:
   ```bash
   npm run dev
   ```

The API will be available at `http://localhost:5000`

### Environment Variables

See `env.example` for all required environment variables.

### Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build the project for production
- `npm start` - Start production server
- `npm test` - Run tests
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors

## API Documentation

### Authentication Endpoints

- `POST /api/auth/login` - User login
- `POST /api/auth/signup` - User registration
- `POST /api/auth/logout` - User logout
- `POST /api/auth/refresh` - Refresh JWT token
- `GET /api/auth/me` - Get current user profile

### User Management

- `GET /api/users` - Get all users (admin only)
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user profile
- `DELETE /api/users/:id` - Delete user (admin only)

### Startup Management

- `GET /api/startups` - Get all startups
- `POST /api/startups` - Create new startup application
- `GET /api/startups/:id` - Get startup by ID
- `PUT /api/startups/:id` - Update startup
- `DELETE /api/startups/:id` - Delete startup

### Mentor Management

- `GET /api/mentors` - Get all mentors
- `POST /api/mentors` - Create mentor profile
- `GET /api/mentors/:id` - Get mentor by ID
- `PUT /api/mentors/:id` - Update mentor
- `DELETE /api/mentors/:id` - Delete mentor

### Investor Management

- `GET /api/investors` - Get all investors
- `POST /api/investors` - Create investor profile
- `GET /api/investors/:id` - Get investor by ID
- `PUT /api/investors/:id` - Update investor
- `DELETE /api/investors/:id` - Delete investor

### Event Management

- `GET /api/events` - Get all events
- `POST /api/events` - Create new event
- `GET /api/events/:id` - Get event by ID
- `PUT /api/events/:id` - Update event
- `DELETE /api/events/:id` - Delete event

### Document Management

- `GET /api/documents` - Get all documents
- `POST /api/documents/upload` - Upload document
- `GET /api/documents/:id` - Get document by ID
- `DELETE /api/documents/:id` - Delete document

### Reports

- `GET /api/reports` - Get all reports
- `POST /api/reports/generate` - Generate new report
- `GET /api/reports/:id` - Get report by ID
- `DELETE /api/reports/:id` - Delete report

## Database Schema

The application uses MongoDB with the following main collections:

- **users** - User accounts and profiles
- **startups** - Startup applications and information
- **mentors** - Mentor profiles and expertise
- **investors** - Investor profiles and preferences
- **events** - Events and workshops
- **documents** - File uploads and documents
- **reports** - Generated reports and analytics

## Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Rate limiting
- CORS protection
- Input validation
- File upload security
- Helmet for security headers

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details
