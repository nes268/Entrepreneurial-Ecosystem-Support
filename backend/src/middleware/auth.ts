import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/env';
import { User, IUser } from '../models/User';
import { Admin, IAdmin } from '../models/Admin';
import { pgPool } from '../config/database';
import { JwtPayload, UserRole, AdminLevel } from '../types';

// Function to log user activity to PostgreSQL
async function logUserActivity(
  userId: string, 
  activityType: string, 
  action: string, 
  description: string, 
  ipAddress?: string, 
  userAgent?: string
): Promise<void> {
  try {
    // First get the pg_user id from the mongo_user_id
    const userResult = await pgPool.query(
      'SELECT id FROM pg_users WHERE mongo_user_id = $1',
      [userId]
    );
    
    if (userResult.rows.length === 0) {
      console.warn(`Unable to log activity: PG user not found for mongo ID ${userId}`);
      return;
    }
    
    const pgUserId = userResult.rows[0].id;
    
    // Insert activity record
    await pgPool.query(
      `INSERT INTO user_activities 
      (user_id, activity_type, activity_description, ip_address, user_agent) 
      VALUES ($1, $2, $3, $4, $5)`,
      [pgUserId, activityType, description, ipAddress, userAgent]
    );
  } catch (error) {
    console.error('Failed to log user activity:', error);
    // Don't throw - this is non-critical functionality
  }
}

export interface AuthRequest extends Request {
  user?: IUser;
  admin?: IAdmin;
  userId?: string;
  adminId?: string;
}

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      res.status(401).json({ 
        success: false, 
        message: 'Access denied. No token provided.' 
      });
      return;
    }

    const decoded = jwt.verify(token, config.jwt.secret) as JwtPayload;
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      res.status(401).json({ 
        success: false, 
        message: 'Invalid token. User not found.' 
      });
      return;
    }

    // If user is admin, also fetch admin profile
    if (user.role === 'admin') {
      const admin = await Admin.findOne({ userId: user._id });
      if (admin) {
        req.admin = admin;
        req.adminId = admin._id.toString();
      }
    }

    // Log user activity to PostgreSQL
    await logUserActivity(decoded.userId, 'auth', 'token_verified', 'User authenticated successfully', req.ip, req.get('User-Agent'));

    req.user = user;
    req.userId = user._id.toString();
    next();
  } catch (error) {
    res.status(401).json({ 
      success: false, 
      message: 'Invalid token.',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    });
  }
};

// Role-based authorization
export const authorize = (...roles: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ 
        success: false, 
        message: 'Access denied. No user found.' 
      });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({ 
        success: false, 
        message: 'Access denied. Insufficient permissions.',
        requiredRoles: roles,
        userRole: req.user.role
      });
      return;
    }

    next();
  };
};

// Admin-specific authorization with permission checking
export const requireAdmin = (permission?: string) => {
  return async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user || req.user.role !== 'admin') {
        res.status(403).json({ 
          success: false, 
          message: 'Access denied. Admin privileges required.' 
        });
        return;
      }

      if (!req.admin) {
        const admin = await Admin.findOne({ userId: req.user._id });
        if (!admin) {
          res.status(403).json({ 
            success: false, 
            message: 'Admin profile not found.' 
          });
          return;
        }
        req.admin = admin;
      }

      // Check if admin account is locked
      if (req.admin.isLocked && req.admin.lockedUntil && req.admin.lockedUntil > new Date()) {
        res.status(423).json({ 
          success: false, 
          message: 'Admin account is temporarily locked.' 
        });
        return;
      }

      // Check specific permission if required
      if (permission && !req.admin.hasPermission(permission)) {
        res.status(403).json({ 
          success: false, 
          message: `Access denied. Permission '${permission}' required.`,
          adminLevel: req.admin.adminLevel,
          hasPermission: false
        });
        return;
      }

      next();
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        message: 'Error verifying admin permissions.',
        error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      });
    }
  };
};

// Super admin only access
export const requireSuperAdmin = () => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.admin || req.admin.adminLevel !== 'super_admin') {
      res.status(403).json({ 
        success: false, 
        message: 'Access denied. Super admin privileges required.',
        adminLevel: req.admin?.adminLevel || 'none'
      });
      return;
    }

    next();
  };
};

export const optionalAuth = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (token) {
      const decoded = jwt.verify(token, config.jwt.secret) as any;
      const user = await User.findById(decoded.userId).select('-password');
      if (user) {
        req.user = user;
      }
    }
    
    next();
  } catch (error) {
    // If token is invalid, continue without user
    next();
  }
};
