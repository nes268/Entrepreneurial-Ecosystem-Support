import express, { Request, Response } from 'express';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { validate } from '../middleware/validation';
import { User } from '../models/User';
import { Startup } from '../models/Startup';
import { Mentor } from '../models/Mentor';
import { Investor } from '../models/Investor';
import { Document } from '../models/Document';
import { Report } from '../models/Report';
import { Event } from '../models/Event';
import { Profile } from '../models/Profile';
import Joi from 'joi';

const router = express.Router();

// Protect all admin routes
router.use(authenticate);
router.use(authorize('admin'));

// Validation schemas
const createUserSchema = Joi.object({
  fullName: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  username: Joi.string().alphanum().min(3).max(30).required(),
  password: Joi.string().min(6).required(),
  role: Joi.string().valid('individual', 'enterprise', 'admin').required(),
});

const updateUserSchema = Joi.object({
  fullName: Joi.string().min(2).max(100),
  email: Joi.string().email(),
  username: Joi.string().alphanum().min(3).max(30),
  role: Joi.string().valid('individual', 'enterprise', 'admin'),
  profileComplete: Joi.boolean(),
  isEmailVerified: Joi.boolean(),
});

// Dashboard stats endpoint
router.get('/stats', asyncHandler(async (req: AuthRequest, res: Response) => {
  const [userCount, startupCount, mentorCount, investorCount, eventCount] = await Promise.all([
    User.countDocuments(),
    Startup.countDocuments(),
    Mentor.countDocuments(),
    Investor.countDocuments(),
    Event.countDocuments(),
  ]);
  
  const recentStartups = await Startup.find()
    .sort({ createdAt: -1 })
    .limit(5)
    .populate('userId', 'fullName email');
  
  const stats = {
    overview: {
      totalUsers: userCount,
      totalStartups: startupCount,
      totalMentors: mentorCount,
      totalInvestors: investorCount,
      totalEvents: eventCount,
    },
    recentActivity: {
      recentStartups,
    },
  };
  
  res.json({
    success: true,
    data: stats,
  });
}));

// User Management
router.get('/users', asyncHandler(async (req: AuthRequest, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const search = req.query.search as string;
  const role = req.query.role as string;
  
  let query: any = {};
  
  if (search) {
    query.$or = [
      { fullName: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { username: { $regex: search, $options: 'i' } },
    ];
  }
  
  if (role) {
    query.role = role;
  }
  
  const total = await User.countDocuments(query);
  const users = await User.find(query)
    .select('-password')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);
  
  res.json({
    success: true,
    data: {
      users,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    },
  });
}));

router.get('/users/:id', asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = await User.findById(req.params.id).select('-password');
  
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found',
    });
  }
  
  res.json({
    success: true,
    data: { user },
  });
}));

router.post('/users', validate(createUserSchema), asyncHandler(async (req: AuthRequest, res: Response) => {
  const { fullName, email, username, password, role } = req.body;
  
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
  
  const user = new User({
    fullName,
    email,
    username,
    password,
    role,
    isEmailVerified: true, // Admin-created users are pre-verified
  });
  
  await user.save();
  
  res.status(201).json({
    success: true,
    message: 'User created successfully',
    data: { user: user.toJSON() },
  });
}));

router.put('/users/:id', validate(updateUserSchema), asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { ...req.body, updatedAt: new Date() },
    { new: true, runValidators: true }
  ).select('-password');
  
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found',
    });
  }
  
  res.json({
    success: true,
    message: 'User updated successfully',
    data: { user },
  });
}));

router.delete('/users/:id', asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = await User.findByIdAndDelete(req.params.id);
  
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found',
    });
  }
  
  // Also delete associated profile and startup data
  await Profile.findOneAndDelete({ userId: user._id });
  await Startup.findOneAndDelete({ userId: user._id });
  
  res.json({
    success: true,
    message: 'User deleted successfully',
  });
}));

// Startup Management
router.get('/startups', asyncHandler(async (req: AuthRequest, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const search = req.query.search as string;
  const status = req.query.status as string;
  const type = req.query.type as string;
  
  let query: any = {};
  
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { founder: { $regex: search, $options: 'i' } },
      { sector: { $regex: search, $options: 'i' } },
    ];
  }
  
  if (status) {
    query.status = status;
  }
  
  if (type) {
    query.type = type;
  }
  
  const total = await Startup.countDocuments(query);
  const startups = await Startup.find(query)
    .populate('userId', 'fullName email')
    .populate('assignedMentor', 'name email')
    .populate('assignedInvestor', 'name firm')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);
  
  res.json({
    success: true,
    data: {
      startups,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    },
  });
}));

router.get('/startups/:id', asyncHandler(async (req: AuthRequest, res: Response) => {
  const startup = await Startup.findById(req.params.id)
    .populate('userId', 'fullName email')
    .populate('assignedMentor', 'name email role')
    .populate('assignedInvestor', 'name firm email');
  
  if (!startup) {
    return res.status(404).json({
      success: false,
      message: 'Startup not found',
    });
  }
  
  res.json({
    success: true,
    data: { startup },
  });
}));

router.put('/startups/:id', asyncHandler(async (req: AuthRequest, res: Response) => {
  const startup = await Startup.findByIdAndUpdate(
    req.params.id,
    { ...req.body, updatedAt: new Date() },
    { new: true, runValidators: true }
  ).populate('userId', 'fullName email');
  
  if (!startup) {
    return res.status(404).json({
      success: false,
      message: 'Startup not found',
    });
  }
  
  res.json({
    success: true,
    message: 'Startup updated successfully',
    data: { startup },
  });
}));

router.delete('/startups/:id', asyncHandler(async (req: AuthRequest, res: Response) => {
  const startup = await Startup.findByIdAndDelete(req.params.id);
  
  if (!startup) {
    return res.status(404).json({
      success: false,
      message: 'Startup not found',
    });
  }
  
  res.json({
    success: true,
    message: 'Startup deleted successfully',
  });
}));

// Application Management
router.put('/startups/:id/approve', asyncHandler(async (req: AuthRequest, res: Response) => {
  const { reviewNotes, assignedMentor, assignedInvestor } = req.body;
  
  const startup = await Startup.findByIdAndUpdate(
    req.params.id,
    {
      applicationStatus: 'approved',
      status: 'active',
      reviewNotes,
      assignedMentor,
      assignedInvestor,
    },
    { new: true }
  ).populate('userId', 'fullName email');
  
  if (!startup) {
    return res.status(404).json({
      success: false,
      message: 'Startup not found',
    });
  }
  
  res.json({
    success: true,
    message: 'Startup application approved',
    data: { startup },
  });
}));

router.put('/startups/:id/reject', asyncHandler(async (req: AuthRequest, res: Response) => {
  const { reviewNotes } = req.body;
  
  const startup = await Startup.findByIdAndUpdate(
    req.params.id,
    {
      applicationStatus: 'rejected',
      reviewNotes,
    },
    { new: true }
  ).populate('userId', 'fullName email');
  
  if (!startup) {
    return res.status(404).json({
      success: false,
      message: 'Startup not found',
    });
  }
  
  res.json({
    success: true,
    message: 'Startup application rejected',
    data: { startup },
  });
}));

// Mentor Management
router.get('/mentors', asyncHandler(async (req: AuthRequest, res: Response) => {
  const mentors = await Mentor.find().sort({ createdAt: -1 });
  res.json({
    success: true,
    data: { mentors },
  });
}));

router.post('/mentors', asyncHandler(async (req: AuthRequest, res: Response) => {
  const mentor = new Mentor(req.body);
  await mentor.save();
  
  res.status(201).json({
    success: true,
    message: 'Mentor created successfully',
    data: { mentor },
  });
}));

router.put('/mentors/:id', asyncHandler(async (req: AuthRequest, res: Response) => {
  const mentor = await Mentor.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );
  
  if (!mentor) {
    return res.status(404).json({
      success: false,
      message: 'Mentor not found',
    });
  }
  
  res.json({
    success: true,
    message: 'Mentor updated successfully',
    data: { mentor },
  });
}));

router.delete('/mentors/:id', asyncHandler(async (req: AuthRequest, res: Response) => {
  const mentor = await Mentor.findByIdAndDelete(req.params.id);
  
  if (!mentor) {
    return res.status(404).json({
      success: false,
      message: 'Mentor not found',
    });
  }
  
  res.json({
    success: true,
    message: 'Mentor deleted successfully',
  });
}));

// Investor Management
router.get('/investors', asyncHandler(async (req: AuthRequest, res: Response) => {
  const investors = await Investor.find().sort({ createdAt: -1 });
  res.json({
    success: true,
    data: { investors },
  });
}));

router.post('/investors', asyncHandler(async (req: AuthRequest, res: Response) => {
  const investor = new Investor(req.body);
  await investor.save();
  
  res.status(201).json({
    success: true,
    message: 'Investor created successfully',
    data: { investor },
  });
}));

router.put('/investors/:id', asyncHandler(async (req: AuthRequest, res: Response) => {
  const investor = await Investor.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );
  
  if (!investor) {
    return res.status(404).json({
      success: false,
      message: 'Investor not found',
    });
  }
  
  res.json({
    success: true,
    message: 'Investor updated successfully',
    data: { investor },
  });
}));

router.delete('/investors/:id', asyncHandler(async (req: AuthRequest, res: Response) => {
  const investor = await Investor.findByIdAndDelete(req.params.id);
  
  if (!investor) {
    return res.status(404).json({
      success: false,
      message: 'Investor not found',
    });
  }
  
  res.json({
    success: true,
    message: 'Investor deleted successfully',
  });
}));

// Settings Management
router.get('/settings', asyncHandler(async (req: AuthRequest, res: Response) => {
  // Return current admin settings
  const settings = {
    email: {
      notificationsEnabled: true,
      adminEmail: process.env.ADMIN_EMAIL || 'admin@citbif.com',
    },
    application: {
      autoApprovalEnabled: false,
      maxFileSize: '10MB',
      allowedFileTypes: ['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png'],
    },
    system: {
      maintenanceMode: false,
      registrationEnabled: true,
    },
  };
  
  res.json({
    success: true,
    data: { settings },
  });
}));

router.put('/settings', asyncHandler(async (req: AuthRequest, res: Response) => {
  // In a real application, these settings would be stored in database
  // For now, we'll just return the updated settings
  const updatedSettings = req.body;
  
  res.json({
    success: true,
    message: 'Settings updated successfully',
    data: { settings: updatedSettings },
  });
}));

export default router;
