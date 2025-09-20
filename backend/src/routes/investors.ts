import express from 'express';
import { Investor } from '../models/Investor';
import { authenticate, authorize, optionalAuth } from '../middleware/auth';
import { validate, validateQuery } from '../middleware/validation';
import { asyncHandler } from '../middleware/errorHandler';
import Joi from 'joi';

const router = express.Router();

// Validation schemas
const createInvestorSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  firm: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  phoneNumber: Joi.string().max(20).required(),
  investmentRange: Joi.string().min(5).max(100).required(),
  focusAreas: Joi.array().items(Joi.string()).min(1).required(),
  backgroundSummary: Joi.string().min(20).max(1000).required(),
  profilePicture: Joi.string().uri(),
  linkedinProfile: Joi.string().uri(),
  website: Joi.string().uri(),
  location: Joi.string().max(100),
  position: Joi.string().max(100),
  preferences: Joi.object({
    minInvestment: Joi.number().min(0),
    maxInvestment: Joi.number().min(0),
    preferredSectors: Joi.array().items(Joi.string()),
    preferredStages: Joi.array().items(Joi.string()),
    geographicFocus: Joi.array().items(Joi.string()),
    investmentCriteria: Joi.array().items(Joi.string()),
  }),
});

const updateInvestorSchema = Joi.object({
  name: Joi.string().min(2).max(100),
  firm: Joi.string().min(2).max(100),
  email: Joi.string().email(),
  phoneNumber: Joi.string().max(20),
  investmentRange: Joi.string().min(5).max(100),
  focusAreas: Joi.array().items(Joi.string()),
  backgroundSummary: Joi.string().min(20).max(1000),
  profilePicture: Joi.string().uri(),
  linkedinProfile: Joi.string().uri(),
  website: Joi.string().uri(),
  location: Joi.string().max(100),
  position: Joi.string().max(100),
  preferences: Joi.object({
    minInvestment: Joi.number().min(0),
    maxInvestment: Joi.number().min(0),
    preferredSectors: Joi.array().items(Joi.string()),
    preferredStages: Joi.array().items(Joi.string()),
    geographicFocus: Joi.array().items(Joi.string()),
    investmentCriteria: Joi.array().items(Joi.string()),
  }),
  isActive: Joi.boolean(),
  isVerified: Joi.boolean(),
});

const getInvestorsQuerySchema = Joi.object({
  page: Joi.number().min(1).default(1),
  limit: Joi.number().min(1).max(100).default(10),
  focusAreas: Joi.string(),
  sectors: Joi.string(),
  location: Joi.string(),
  isActive: Joi.boolean(),
  isVerified: Joi.boolean(),
  minInvestment: Joi.number().min(0),
  maxInvestment: Joi.number().min(0),
  search: Joi.string().max(100),
  sortBy: Joi.string().valid('createdAt', 'name', 'firm', 'stats.totalInvestments').default('createdAt'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
});

// @route   GET /api/investors
// @desc    Get all investors
// @access  Public
router.get('/', optionalAuth, validateQuery(getInvestorsQuerySchema), asyncHandler(async (req, res) => {
  const { page, limit, focusAreas, sectors, location, isActive, isVerified, minInvestment, maxInvestment, search, sortBy, sortOrder } = req.query as any;
  const skip = (page - 1) * limit;

  // Build query
  const query: any = {};
  
  if (focusAreas) {
    query.focusAreas = { $in: focusAreas.split(',') };
  }
  
  if (sectors) {
    query['preferences.preferredSectors'] = { $in: sectors.split(',') };
  }
  
  if (location) {
    query.location = { $regex: location, $options: 'i' };
  }
  
  if (typeof isActive === 'boolean') {
    query.isActive = isActive;
  }
  
  if (typeof isVerified === 'boolean') {
    query.isVerified = isVerified;
  }
  
  if (minInvestment) {
    query['preferences.minInvestment'] = { $lte: minInvestment };
  }
  
  if (maxInvestment) {
    query['preferences.maxInvestment'] = { $gte: maxInvestment };
  }
  
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { firm: { $regex: search, $options: 'i' } },
      { backgroundSummary: { $regex: search, $options: 'i' } },
      { position: { $regex: search, $options: 'i' } },
    ];
  }

  // Only show active investors to public
  if (!req.user || req.user.role !== 'admin') {
    query.isActive = true;
  }

  // Build sort object
  const sort: any = {};
  sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

  const investors = await Investor.find(query)
    .sort(sort)
    .skip(skip)
    .limit(limit);

  const total = await Investor.countDocuments(query);

  res.json({
    success: true,
    data: {
      investors,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalInvestors: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      },
    },
  });
}));

// @route   POST /api/investors
// @desc    Create investor profile
// @access  Private
router.post('/', authenticate, validate(createInvestorSchema), asyncHandler(async (req, res) => {
  // Check if email already exists
  const existingInvestor = await Investor.findOne({ email: req.body.email });
  if (existingInvestor) {
    return res.status(400).json({
      success: false,
      message: 'Investor with this email already exists',
    });
  }

  const investorData = {
    ...req.body,
    userId: req.user._id,
  };

  const investor = new Investor(investorData);
  await investor.save();

  res.status(201).json({
    success: true,
    message: 'Investor profile created successfully',
    data: {
      investor,
    },
  });
}));

// @route   GET /api/investors/:id
// @desc    Get investor by ID
// @access  Public
router.get('/:id', optionalAuth, asyncHandler(async (req, res) => {
  const investor = await Investor.findById(req.params.id);
  
  if (!investor) {
    return res.status(404).json({
      success: false,
      message: 'Investor not found',
    });
  }

  // Only show active investors to public
  if (!req.user || req.user.role !== 'admin') {
    if (!investor.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Investor profile is not active',
      });
    }
  }

  res.json({
    success: true,
    data: {
      investor,
    },
  });
}));

// @route   PUT /api/investors/:id
// @desc    Update investor
// @access  Private
router.put('/:id', authenticate, validate(updateInvestorSchema), asyncHandler(async (req, res) => {
  const investor = await Investor.findById(req.params.id);
  
  if (!investor) {
    return res.status(404).json({
      success: false,
      message: 'Investor not found',
    });
  }

  // Check if user can update this investor
  if (req.user.role !== 'admin' && req.user._id.toString() !== investor.userId?.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Access denied',
    });
  }

  // Check if email is being changed and if it's already taken
  if (req.body.email && req.body.email !== investor.email) {
    const existingInvestor = await Investor.findOne({ email: req.body.email });
    if (existingInvestor) {
      return res.status(400).json({
        success: false,
        message: 'Email already exists',
      });
    }
  }

  // Update investor
  Object.assign(investor, req.body);
  await investor.save();

  res.json({
    success: true,
    message: 'Investor updated successfully',
    data: {
      investor,
    },
  });
}));

// @route   DELETE /api/investors/:id
// @desc    Delete investor
// @access  Private
router.delete('/:id', authenticate, asyncHandler(async (req, res) => {
  const investor = await Investor.findById(req.params.id);
  
  if (!investor) {
    return res.status(404).json({
      success: false,
      message: 'Investor not found',
    });
  }

  // Check if user can delete this investor
  if (req.user.role !== 'admin' && req.user._id.toString() !== investor.userId?.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Access denied',
    });
  }

  await Investor.findByIdAndDelete(req.params.id);

  res.json({
    success: true,
    message: 'Investor deleted successfully',
  });
}));

// @route   GET /api/investors/stats/overview
// @desc    Get investor statistics overview
// @access  Public
router.get('/stats/overview', asyncHandler(async (req, res) => {
  const totalInvestors = await Investor.countDocuments();
  const activeInvestors = await Investor.countDocuments({ isActive: true });
  const verifiedInvestors = await Investor.countDocuments({ isVerified: true });

  // Focus areas distribution
  const focusAreasDistribution = await Investor.aggregate([
    { $unwind: '$focusAreas' },
    { $group: { _id: '$focusAreas', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 10 }
  ]);

  // Preferred sectors distribution
  const preferredSectorsDistribution = await Investor.aggregate([
    { $unwind: '$preferences.preferredSectors' },
    { $group: { _id: '$preferences.preferredSectors', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 10 }
  ]);

  // Investment range distribution
  const investmentRangeDistribution = await Investor.aggregate([
    { $group: { _id: '$investmentRange', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);

  // Total investments
  const totalInvestments = await Investor.aggregate([
    { $group: { _id: null, total: { $sum: '$stats.totalAmountInvested' } } }
  ]);

  res.json({
    success: true,
    data: {
      totalInvestors,
      activeInvestors,
      verifiedInvestors,
      focusAreasDistribution,
      preferredSectorsDistribution,
      investmentRangeDistribution,
      totalInvestments: totalInvestments[0]?.total || 0,
    },
  });
}));

export default router;
