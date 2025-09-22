import express, { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { authenticate, AuthRequest } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { asyncHandler } from '../middleware/errorHandler';
import { generateTokenPair, validateRefreshToken, revokeRefreshToken, revokeAllUserTokens } from '../utils/jwt';
import { ApiResponse, UserRole } from '../types';
import prisma from '../config/prisma';
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

=======
>>>>>>> 4b0b14de97dba060b1c031c0101c390d758c2879
// @route   POST /api/auth/admin/login
// @desc    Admin login
// @access  Public
router.post('/admin/login', validate(loginSchema), asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

<<<<<<< HEAD
  // Find admin user and include password for comparison
  const user = await User.findOne({ email, role: 'admin' }).select('+password');

=======
  const user = await prisma.user.findFirst({ where: { email, role: 'ADMIN' } });
>>>>>>> 4b0b14de97dba060b1c031c0101c390d758c2879
  if (!user) {
    return res.status(401).json({ success: false, message: 'Invalid admin credentials' });
  }

<<<<<<< HEAD
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
=======
  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    return res.status(401).json({ success: false, message: 'Invalid admin credentials' });
  }

  await prisma.user.update({ where: { id: user.id }, data: { lastLogin: new Date() } });

  const tokens = await generateTokenPair({ id: user.id, email: user.email, role: user.role as UserRole });
>>>>>>> 4b0b14de97dba060b1c031c0101c390d758c2879

  const response: ApiResponse = {
    success: true,
    message: 'Admin login successful',
    data: {
      user: { ...user, passwordHash: undefined },
      ...tokens,
      redirectUrl: '/admin/dashboard',
      role: user.role,
    },
  };

  return res.json(response);
<<<<<<< HEAD
});
=======
}));
>>>>>>> 4b0b14de97dba060b1c031c0101c390d758c2879

// @route   POST /api/auth/login
// @desc    Login user (startup/individual)
// @access  Public
router.post('/login', validate(loginSchema), asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const user = await prisma.user.findFirst({ where: { email } });
  if (!user) {
    return res.status(401).json({ success: false, message: 'Invalid credentials' });
  }

  if (user.role === 'ADMIN') {
    return res.status(403).json({ success: false, message: 'Admin users must login through the admin portal' });
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    return res.status(401).json({ success: false, message: 'Invalid credentials' });
  }

  await prisma.user.update({ where: { id: user.id }, data: { lastLogin: new Date() } });

  const tokens = await generateTokenPair({ id: user.id, email: user.email, role: user.role as UserRole });

<<<<<<< HEAD
  // Determine redirect URL based on user role
  let redirectUrl = '/startup/dashboard';
  if (user.role === 'enterprise') {
    redirectUrl = '/startup/dashboard';
  } else if (user.role === 'individual') {
    redirectUrl = '/startup/dashboard';
  }
=======
  const redirectUrl = '/startup/dashboard';
>>>>>>> 4b0b14de97dba060b1c031c0101c390d758c2879

  const response: ApiResponse = {
    success: true,
    message: 'Login successful',
    data: {
      user: { ...user, passwordHash: undefined },
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
  const { fullName, email, username, password, role } = req.body as { fullName: string; email: string; username: string; password: string; role: 'individual' | 'enterprise' };

  const existing = await prisma.user.findFirst({ where: { OR: [{ email }, { username }] } });
  if (existing) {
    return res.status(400).json({ success: false, message: existing.email === email ? 'Email already exists' : 'Username already exists' });
  }

  const passwordHash = await bcrypt.genSalt(12).then((salt) => bcrypt.hash(password, salt));
  const mappedRole: UserRole = role === 'enterprise' ? 'enterprise' : 'individual';

  const user = await prisma.user.create({
    data: { fullName, email, username, passwordHash, role: mappedRole },
  });

<<<<<<< HEAD
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

  // Determine redirect URL based on user role
  let redirectUrl = '/startup/dashboard';
  if (user.role === 'enterprise' || user.role === 'individual') {
    redirectUrl = '/startup/dashboard';
  }
=======
  const tokens = await generateTokenPair({ id: user.id, email: user.email, role: user.role as UserRole });
>>>>>>> 4b0b14de97dba060b1c031c0101c390d758c2879

  const response: ApiResponse = {
    success: true,
    message: 'User registered successfully',
    data: {
      user: { ...user, passwordHash: undefined },
      ...tokens,
      redirectUrl: '/startup/dashboard',
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

  const validation = await validateRefreshToken(refreshToken);
<<<<<<< HEAD

  if (!validation.valid) {
    return res.status(401).json({
      success: false,
      message: validation.error || 'Invalid refresh token',
      expired: validation.expired,
    });
  }

  // Find user by ID
  const user = await User.findById(validation.payload!.userId);

=======
  if (!validation.valid) {
    return res.status(401).json({ success: false, message: validation.error || 'Invalid refresh token', expired: validation.expired });
  }

  const user = await prisma.user.findUnique({ where: { id: validation.payload!.userId } });
>>>>>>> 4b0b14de97dba060b1c031c0101c390d758c2879
  if (!user) {
    return res.status(401).json({ success: false, message: 'User not found' });
  }

  if (validation.tokenId) {
    await revokeRefreshToken(validation.tokenId);
  }

  const tokens = await generateTokenPair({ id: user.id, email: user.email, role: user.role as UserRole });

  const response: ApiResponse = { success: true, message: 'Token refreshed successfully', data: tokens };
  return res.json(response);
}));

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', authenticate, asyncHandler(async (req: AuthRequest, res: Response) => {
  return res.json({ success: true, data: { user: req.user } });
}));

// @route   POST /api/auth/logout
// @desc    Logout user (revoke current session)
// @access  Private
router.post('/logout', authenticate, asyncHandler(async (req: AuthRequest, res: Response) => {
  const refreshToken = req.body.refreshToken;
<<<<<<< HEAD

=======
>>>>>>> 4b0b14de97dba060b1c031c0101c390d758c2879
  if (refreshToken) {
    const validation = await validateRefreshToken(refreshToken);
    if (validation.valid && validation.tokenId) {
      await revokeRefreshToken(validation.tokenId);
    }
  }
<<<<<<< HEAD

  // Log admin activity if user is admin
  if (req.admin) {
    req.admin.logActivity('logout', 'auth', `Admin logged out from ${req.ip}`, undefined, req.ip);
    await req.admin.save();
  }

  const response: ApiResponse = {
    success: true,
    message: 'Logout successful',
  };

=======
  const response: ApiResponse = { success: true, message: 'Logout successful' };
>>>>>>> 4b0b14de97dba060b1c031c0101c390d758c2879
  res.json(response);
}));

// @route   POST /api/auth/logout-all
// @desc    Logout from all devices (revoke all user sessions)
// @access  Private
router.post('/logout-all', authenticate, asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id as string;
  const revoked = await revokeAllUserTokens(userId);
  const response: ApiResponse = { success: true, message: `Logout successful from all devices${revoked ? '. All sessions revoked.' : ''}`, data: { sessionsRevoked: revoked } };
  res.json(response);
}));

// @route   PUT /api/auth/change-password
// @desc    Change user password
// @access  Private
router.put('/change-password', authenticate, asyncHandler(async (req: AuthRequest, res: Response) => {
  const { currentPassword, newPassword } = req.body as { currentPassword: string; newPassword: string };

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ success: false, message: 'Current password and new password are required' });
  }
  if (newPassword.length < 6) {
    return res.status(400).json({ success: false, message: 'New password must be at least 6 characters' });
  }

  const user = await prisma.user.findUnique({ where: { id: req.user!.id as string } });
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!isMatch) {
    return res.status(400).json({ success: false, message: 'Current password is incorrect' });
  }

  const newHash = await bcrypt.genSalt(12).then((salt) => bcrypt.hash(newPassword, salt));
  await prisma.user.update({ where: { id: user.id }, data: { passwordHash: newHash } });

  return res.json({ success: true, message: 'Password changed successfully' });
}));

export default router;
