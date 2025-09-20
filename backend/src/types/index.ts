// Re-export all types from models for easy access
export * from '../models/User';
export * from '../models/Profile';
export * from '../models/Startup';
export * from '../models/Mentor';
export * from '../models/Investor';
export * from '../models/Event';
export * from '../models/Document';
export * from '../models/Report';

// Additional utility types
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNext: boolean;
    hasPrev: boolean;
    nextPage?: number | null;
    prevPage?: number | null;
  };
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
}

export interface AuthRequest extends Request {
  user?: any;
}

export interface FileUpload {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  destination: string;
  filename: string;
  path: string;
}

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export interface NotificationData {
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  userId: string;
  read?: boolean;
  data?: any;
}

export interface StatsOverview {
  totalUsers: number;
  totalStartups: number;
  totalMentors: number;
  totalInvestors: number;
  totalEvents: number;
  totalDocuments: number;
  totalReports: number;
}

export interface DashboardStats {
  users: {
    total: number;
    individual: number;
    enterprise: number;
    admin: number;
    verified: number;
    recent: number;
  };
  startups: {
    total: number;
    innovation: number;
    incubation: number;
    active: number;
    approved: number;
    pending: number;
  };
  mentors: {
    total: number;
    active: number;
    verified: number;
    available: number;
  };
  investors: {
    total: number;
    active: number;
    verified: number;
  };
  events: {
    total: number;
    published: number;
    upcoming: number;
    past: number;
  };
  documents: {
    total: number;
    public: number;
    private: number;
  };
  reports: {
    total: number;
    ready: number;
    processing: number;
    error: number;
  };
}
