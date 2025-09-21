import express, { Request, Response } from 'express';
import jwt, { SignOptions } from 'jsonwebtoken';
import { config } from '../config/env';
import { User } from '../models/User';
import { Admin } from '../models/Admin';
import { authenticate, AuthRequest } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { asyncHandler } from '../middleware/errorHandler';
import { generateTokenPair, validateRefreshToken, revokeRefreshToken, revokeAllUserTokens } from '../utils/jwt';
import { pgPool } from '../config/database';
import { ApiResponse } from '../types';
import Joi from 'joi';

const router = express.Router();

// Validation schemas
const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

const signupSchema = Joi.object({
  fullName: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  username: Joi.string().alphanum().min(3).max(30).required(),
  password: Joi.string().min(6).required(),
  role: Joi.string().valid('individual', 'enterprise').required(),
});

const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string().required(),
});

<<<<<<< HEAD
// Generate JWT token
const generateToken = (userId: string): string => {
  const options: SignOptions = {
    expiresIn: config.jwt.expiresIn as string,
  };
  return jwt.sign({ userId }, config.jwt.secret as string, options);
};

// Generate refresh token
const generateRefreshToken = (userId: string): string => {
  const options: SignOptions = {
    expiresIn: config.jwt.refreshExpiresIn as string,
  };
  return jwt.sign({ userId, type: 'refresh' }, config.jwt.secret as string, options);
};
=======
// Helper function to create or update PostgreSQL user record
const upsertPGUser = async (user: any): Promise<void> => {
  try {
    const mongoUserId = user._id.toString();
    
    // Check if user exists in PostgreSQL
    const existingResult = await pgPool.query(
      'SELECT id FROM pg_users WHERE mongo_user_id = $1',
      [mongoUserId]
    );
    
    if (existingResult.rows.length === 0) {
      // Create new PG user record
      await pgPool.query(
        `INSERT INTO pg_users (mongo_user_id, email, role, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5)`,
        [mongoUserId, user.email, user.role, user.createdAt, user.updatedAt]
      );
    } else {
      // Update existing PG user record
      await pgPool.query(
        `UPDATE pg_users 
         SET email = $2, role = $3, updated_at = $4, last_login = $5, login_count = login_count + 1, is_active = true
         WHERE mongo_user_id = $1`,
        [mongoUserId, user.email, user.role, new Date(), new Date()]
      );
    }
  } catch (error) {
    console.error('Error upserting PostgreSQL user record:', error);
    // Don't throw - this is non-critical functionality
  }
};

// @route   POST /api/auth/admin/login
// @desc    Admin login
// @access  Public
router.post('/admin/login', validate(loginSchema), asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  // Find admin user and include password for comparison
  const user = await User.findOne({ email, role: 'admin' }).select('+password');
  
  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Invalid admin credentials',
    });
  }

  // Check if password matches
  const isMatch = await user.comparePassword(password);
  
  if (!isMatch) {
    // Find admin profile to log failed attempt
    const admin = await Admin.findOne({ userId: user._id });
    if (admin) {
      admin.handleFailedLogin();
      await admin.save();
    }
    
    return res.status(401).json({
      success: false,
      message: 'Invalid admin credentials',
    });
  }

  // Get admin profile
  let admin = await Admin.findOne({ userId: user._id });
  
  // Check if admin account is locked
  if (admin && admin.isLocked && admin.lockedUntil && admin.lockedUntil > new Date()) {
    return res.status(423).json({
      success: false,
      message: 'Admin account is temporarily locked due to multiple failed login attempts.',
      lockedUntil: admin.lockedUntil,
    });
  }

  // If no admin profile exists, create one
  if (!admin) {
    admin = new Admin({
      userId: user._id,
      fullName: user.fullName,
      email: user.email,
      adminLevel: 'admin',
      isVerified: true,
    });
    await admin.save();
  }

  // Update last login for both user and admin
  user.lastLogin = new Date();
  admin.handleSuccessfulLogin();
  
  // Log admin activity
  admin.logActivity('login', 'auth', `Admin logged in from ${req.ip}`, undefined, req.ip);
  
  await Promise.all([user.save(), admin.save()]);
  
  // Update PostgreSQL records
  await upsertPGUser(user);

  // Generate tokens
  const tokens = await generateTokenPair(user, admin);

  const response: ApiResponse = {
    success: true,
    message: 'Admin login successful',
    data: {
      user: user.toJSON(),
      admin: {
        adminLevel: admin.adminLevel,
        permissions: admin.permissions,
        preferences: admin.preferences,
      },
      ...tokens,
      redirectUrl: '/admin/dashboard',
      role: user.role,
    },
  };
  
  return res.json(response);
}));
>>>>>>> 38b0531ade4b5e54c695819eea9ddb6e231fb5ac

// @route   POST /api/auth/login
// @desc    Login user (startup/individual)
// @access  Public
router.post('/login', validate(loginSchema), asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  // Find user and include password for comparison
  const user = await User.findOne({ email }).select('+password');
  
  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Invalid credentials',
    });
  }

  // Don't allow admin users to login through regular login
  if (user.role === 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Admin users must login through the admin portal',
    });
  }

  // Check if password matches
  const isMatch = await user.comparePassword(password);
  
  if (!isMatch) {
    return res.status(401).json({
      success: false,
      message: 'Invalid credentials',
    });
  }

  // Update last login
  user.lastLogin = new Date();
  await user.save();
  
  // Update PostgreSQL records
  await upsertPGUser(user);

  // Generate tokens
  const tokens = await generateTokenPair(user);

<<<<<<< HEAD
  return res.json({
=======
  // Determine redirect URL based on user role
  let redirectUrl = '/startup/dashboard';
  if (user.role === 'enterprise') {
    redirectUrl = '/startup/dashboard';
  } else if (user.role === 'individual') {
    redirectUrl = '/startup/dashboard';
  }

  const response: ApiResponse = {
>>>>>>> 38b0531ade4b5e54c695819eea9ddb6e231fb5ac
    success: true,
    message: 'Login successful',
    data: {
      user: user.toJSON(),
      ...tokens,
      redirectUrl,
      role: user.role,
    },
  };

  return res.json(response);
}));

// @route   POST /api/auth/signup
// @desc    Register user
// @access  Public
router.post('/signup', validate(signupSchema), asyncHandler(async (req: Request, res: Response) => {
  const { fullName, email, username, password, role } = req.body;

  // Don't allow admin registration through public signup
  if (role === 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Admin accounts cannot be created through public registration',
    });
  }

  // Check if user already exists
  const existingUser = await User.findOne({
    $or: [{ email }, { username }]
  });

  if (existingUser) {
    return res.status(400).json({
      success: false,
      message: existingUser.email === email ? 'Email already exists' : 'Username already exists',
    });
  }

  // Create new user
  const user = new User({
    fullName,
    email,
    username,
    password,
    role,
  });

  await user.save();
  
  // Create PostgreSQL record
  await upsertPGUser(user);

  // Generate tokens
  const tokens = await generateTokenPair(user);

<<<<<<< HEAD
  return res.status(201).json({
=======
  // Determine redirect URL based on user role
  let redirectUrl = '/startup/dashboard';
  if (user.role === 'enterprise' || user.role === 'individual') {
    redirectUrl = '/startup/dashboard';
  }

  const response: ApiResponse = {
>>>>>>> 38b0531ade4b5e54c695819eea9ddb6e231fb5ac
    success: true,
    message: 'User registered successfully',
    data: {
      user: user.toJSON(),
      ...tokens,
      redirectUrl,
      role: user.role,
    },
  };

  return res.status(201).json(response);
}));

// @route   POST /api/auth/refresh
// @desc    Refresh access token
// @access  Public
router.post('/refresh', validate(refreshTokenSchema), asyncHandler(async (req: Request, res: Response) => {
  const { refreshToken } = req.body;

<<<<<<< HEAD
  try {
    const decoded = jwt.verify(refreshToken, config.jwt.secret) as any;
    
    if (decoded.type !== 'refresh') {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token',
      });
    }

    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found',
      });
    }

    // Generate new tokens
    const newToken = generateToken((user._id as any).toString());
    const newRefreshToken = generateRefreshToken((user._id as any).toString());

    return res.json({
      success: true,
      message: 'Token refreshed successfully',
      data: {
        token: newToken,
        refreshToken: newRefreshToken,
      },
    });
  } catch (error) {
=======
  // Validate refresh token
  const validation = await validateRefreshToken(refreshToken);
  
  if (!validation.valid) {
>>>>>>> 38b0531ade4b5e54c695819eea9ddb6e231fb5ac
    return res.status(401).json({
      success: false,
      message: validation.error || 'Invalid refresh token',
      expired: validation.expired,
    });
  }

  // Find user by ID
  const user = await User.findById(validation.payload!.userId);
  
  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'User not found',
    });
  }

  // Get admin profile if user is admin
  let admin;
  if (user.role === 'admin') {
    admin = await Admin.findOne({ userId: user._id });
  }

  // Revoke the old refresh token
  if (validation.tokenId) {
    await revokeRefreshToken(validation.tokenId);
  }

  // Generate new tokens
  const tokens = await generateTokenPair(user, admin);

  const response: ApiResponse = {
    success: true,
    message: 'Token refreshed successfully',
    data: tokens,
  };

  return res.json(response);
}));

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', authenticate, asyncHandler(async (req: AuthRequest, res: Response) => {
  return res.json({
    success: true,
    data: {
      user: req.user,
    },
  });
}));

// @route   POST /api/auth/logout
// @desc    Logout user (revoke current session)
// @access  Private
router.post('/logout', authenticate, asyncHandler(async (req: AuthRequest, res: Response) => {
<<<<<<< HEAD
  return res.json({
=======
  const refreshToken = req.body.refreshToken;
  
  if (refreshToken) {
    // Validate and revoke the specific refresh token
    const validation = await validateRefreshToken(refreshToken);
    if (validation.valid && validation.tokenId) {
      await revokeRefreshToken(validation.tokenId);
    }
  }
  
  // Log admin activity if user is admin
  if (req.admin) {
    req.admin.logActivity('logout', 'auth', `Admin logged out from ${req.ip}`, undefined, req.ip);
    await req.admin.save();
  }
  
  const response: ApiResponse = {
>>>>>>> 38b0531ade4b5e54c695819eea9ddb6e231fb5ac
    success: true,
    message: 'Logout successful',
  };
  
  res.json(response);
}));

// @route   POST /api/auth/logout-all
// @desc    Logout from all devices (revoke all user sessions)
// @access  Private
router.post('/logout-all', authenticate, asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!._id.toString();
  
  // Revoke all refresh tokens for the user
  const revoked = await revokeAllUserTokens(userId);
  
  // Log admin activity if user is admin
  if (req.admin) {
    req.admin.logActivity('logout_all', 'auth', `Admin logged out from all devices from ${req.ip}`, undefined, req.ip);
    await req.admin.save();
  }
  
  const response: ApiResponse = {
    success: true,
    message: `Logout successful from all devices${revoked ? '. All sessions revoked.' : ''}`,
    data: {
      sessionsRevoked: revoked
    }
  };
  
  res.json(response);
}));

// @route   PUT /api/auth/change-password
// @desc    Change user password
// @access  Private
router.put('/change-password', authenticate, asyncHandler(async (req: AuthRequest, res: Response) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({
      success: false,
      message: 'Current password and new password are required',
    });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({
      success: false,
      message: 'New password must be at least 6 characters',
    });
  }

  const user = await User.findById(req.user!._id).select('+password');
  
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found',
    });
  }

  // Check current password
  const isMatch = await user.comparePassword(currentPassword);
  
  if (!isMatch) {
    return res.status(400).json({
      success: false,
      message: 'Current password is incorrect',
    });
  }

  // Update password
  user.password = newPassword;
  await user.save();

  return res.json({
    success: true,
    message: 'Password changed successfully',
  });
}));

export default router;
