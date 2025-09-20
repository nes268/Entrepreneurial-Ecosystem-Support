import express, { Request, Response } from 'express';
import { User } from '../models/User';
import { Profile } from '../models/Profile';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';
import { validate, validateQuery } from '../middleware/validation';
import { asyncHandler } from '../middleware/errorHandler';
import Joi from 'joi';

const router = express.Router();

// Validation schemas
const updateUserSchema = Joi.object({
  fullName: Joi.string().min(2).max(100),
  email: Joi.string().email(),
  username: Joi.string().alphanum().min(3).max(30),
  profileComplete: Joi.boolean(),
});

const getUsersQuerySchema = Joi.object({
  page: Joi.number().min(1).default(1),
  limit: Joi.number().min(1).max(100).default(10),
  role: Joi.string().valid('individual', 'enterprise', 'admin'),
  search: Joi.string().max(100),
  sortBy: Joi.string().valid('createdAt', 'fullName', 'email', 'lastLogin').default('createdAt'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
});

// @route   GET /api/users
// @desc    Get all users (admin only)
// @access  Private/Admin
router.get('/', authenticate, authorize('admin'), validateQuery(getUsersQuerySchema), asyncHandler(async (req: AuthRequest, res: Response) => {
  const { page, limit, role, search, sortBy, sortOrder } = req.query as any;
  const skip = (page - 1) * limit;

  // Build query
  const query: any = {};
  
  if (role) {
    query.role = role;
  }
  
  if (search) {
    query.$or = [
      { fullName: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { username: { $regex: search, $options: 'i' } },
    ];
  }

  // Build sort object
  const sort: any = {};
  sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

  const users = await User.find(query)
    .sort(sort)
    .skip(skip)
    .limit(limit)
    .select('-password');

  const total = await User.countDocuments(query);

  res.json({
    success: true,
    data: {
      users,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalUsers: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      },
    },
  });
}));

// @route   GET /api/users/:id
// @desc    Get user by ID
// @access  Private
router.get('/:id', authenticate, asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = await User.findById(req.params.id).select('-password');
  
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found',
    });
  }

  // Check if user can access this profile
  if (req.user!.role !== 'admin' && (req.user!._id as any).toString() !== (user._id as any).toString()) {
    return res.status(403).json({
      success: false,
      message: 'Access denied',
    });
  }

  return res.json({
    success: true,
    data: {
      user,
    },
  });
}));

// @route   PUT /api/users/:id
// @desc    Update user profile
// @access  Private
router.put('/:id', authenticate, validate(updateUserSchema), asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.params.id;
  
  // Check if user can update this profile
  if (req.user!.role !== 'admin' && (req.user!._id as any).toString() !== userId) {
    return res.status(403).json({
      success: false,
      message: 'Access denied',
    });
  }

  const user = await User.findById(userId);
  
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found',
    });
  }

  // Check if email or username is being changed and if it's already taken
  if (req.body.email && req.body.email !== user.email) {
    const existingUser = await User.findOne({ email: req.body.email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already exists',
      });
    }
  }

  if (req.body.username && req.body.username !== user.username) {
    const existingUser = await User.findOne({ username: req.body.username });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Username already exists',
      });
    }
  }

  // Update user
  Object.assign(user, req.body);
  await user.save();

  return res.json({
    success: true,
    message: 'User updated successfully',
    data: {
      user: user.toJSON(),
    },
  });
}));

// @route   DELETE /api/users/:id
// @desc    Delete user (admin only)
// @access  Private/Admin
router.delete('/:id', authenticate, authorize('admin'), asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = await User.findById(req.params.id);
  
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found',
    });
  }

  // Prevent admin from deleting themselves
  if ((req.user!._id as any).toString() === (user._id as any).toString()) {
    return res.status(400).json({
      success: false,
      message: 'Cannot delete your own account',
    });
  }

  // Delete user profile if exists
  await Profile.findOneAndDelete({ userId: user._id });
  
  // Delete user
  await User.findByIdAndDelete(req.params.id);

  return res.json({
    success: true,
    message: 'User deleted successfully',
  });
}));

// @route   GET /api/users/:id/profile
// @desc    Get user profile
// @access  Private
router.get('/:id/profile', authenticate, asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.params.id;
  
  // Check if user can access this profile
  if (req.user!.role !== 'admin' && (req.user!._id as any).toString() !== userId) {
    return res.status(403).json({
      success: false,
      message: 'Access denied',
    });
  }

  const profile = await Profile.findOne({ userId }).populate('userId', 'fullName email username role');
  
  if (!profile) {
    return res.status(404).json({
      success: false,
      message: 'Profile not found',
    });
  }

  return res.json({
    success: true,
    data: {
      profile,
    },
  });
}));

// @route   GET /api/users/stats/overview
// @desc    Get user statistics overview (admin only)
// @access  Private/Admin
router.get('/stats/overview', authenticate, authorize('admin'), asyncHandler(async (req: AuthRequest, res: Response) => {
  const totalUsers = await User.countDocuments();
  const individualUsers = await User.countDocuments({ role: 'individual' });
  const enterpriseUsers = await User.countDocuments({ role: 'enterprise' });
  const adminUsers = await User.countDocuments({ role: 'admin' });
  const verifiedUsers = await User.countDocuments({ isEmailVerified: true });
  const completeProfiles = await User.countDocuments({ profileComplete: true });

  // Recent users (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const recentUsers = await User.countDocuments({
    createdAt: { $gte: thirtyDaysAgo }
  });

  res.json({
    success: true,
    data: {
      totalUsers,
      individualUsers,
      enterpriseUsers,
      adminUsers,
      verifiedUsers,
      completeProfiles,
      recentUsers,
      profileCompletionRate: totalUsers > 0 ? Math.round((completeProfiles / totalUsers) * 100) : 0,
      verificationRate: totalUsers > 0 ? Math.round((verifiedUsers / totalUsers) * 100) : 0,
    },
  });
}));

export default router;
