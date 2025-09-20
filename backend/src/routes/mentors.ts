import express from 'express';
import { Mentor } from '../models/Mentor';
import { authenticate, authorize, optionalAuth } from '../middleware/auth';
import { validate, validateQuery } from '../middleware/validation';
import { asyncHandler } from '../middleware/errorHandler';
import Joi from 'joi';

const router = express.Router();

// Validation schemas
const createMentorSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  role: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  experience: Joi.string().min(10).max(500).required(),
  bio: Joi.string().min(20).max(1000).required(),
  profilePicture: Joi.string().uri(),
  phoneNumber: Joi.string().max(20),
  linkedinProfile: Joi.string().uri(),
  website: Joi.string().uri(),
  location: Joi.string().max(100),
  expertise: Joi.array().items(Joi.string()).min(1).required(),
  sectors: Joi.array().items(Joi.string()).min(1).required(),
  availability: Joi.object({
    days: Joi.array().items(Joi.string().valid('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday')),
    timeSlots: Joi.array().items(Joi.object({
      start: Joi.string().required(),
      end: Joi.string().required(),
    })),
    timezone: Joi.string().default('UTC'),
  }),
  preferences: Joi.object({
    maxMentees: Joi.number().min(1).max(20).default(5),
    preferredSectors: Joi.array().items(Joi.string()),
    preferredStages: Joi.array().items(Joi.string()),
    meetingFrequency: Joi.string().valid('weekly', 'bi-weekly', 'monthly').default('monthly'),
  }),
});

const updateMentorSchema = Joi.object({
  name: Joi.string().min(2).max(100),
  role: Joi.string().min(2).max(100),
  email: Joi.string().email(),
  experience: Joi.string().min(10).max(500),
  bio: Joi.string().min(20).max(1000),
  profilePicture: Joi.string().uri(),
  phoneNumber: Joi.string().max(20),
  linkedinProfile: Joi.string().uri(),
  website: Joi.string().uri(),
  location: Joi.string().max(100),
  expertise: Joi.array().items(Joi.string()),
  sectors: Joi.array().items(Joi.string()),
  availability: Joi.object({
    days: Joi.array().items(Joi.string().valid('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday')),
    timeSlots: Joi.array().items(Joi.object({
      start: Joi.string().required(),
      end: Joi.string().required(),
    })),
    timezone: Joi.string(),
  }),
  preferences: Joi.object({
    maxMentees: Joi.number().min(1).max(20),
    preferredSectors: Joi.array().items(Joi.string()),
    preferredStages: Joi.array().items(Joi.string()),
    meetingFrequency: Joi.string().valid('weekly', 'bi-weekly', 'monthly'),
  }),
  isActive: Joi.boolean(),
  isVerified: Joi.boolean(),
});

const getMentorsQuerySchema = Joi.object({
  page: Joi.number().min(1).default(1),
  limit: Joi.number().min(1).max(100).default(10),
  sectors: Joi.string(),
  expertise: Joi.string(),
  location: Joi.string(),
  isActive: Joi.boolean(),
  isVerified: Joi.boolean(),
  minRating: Joi.number().min(0).max(5),
  search: Joi.string().max(100),
  sortBy: Joi.string().valid('createdAt', 'name', 'rating', 'stats.totalMentees').default('createdAt'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
});

// @route   GET /api/mentors
// @desc    Get all mentors
// @access  Public
router.get('/', optionalAuth, validateQuery(getMentorsQuerySchema), asyncHandler(async (req, res) => {
  const { page, limit, sectors, expertise, location, isActive, isVerified, minRating, search, sortBy, sortOrder } = req.query as any;
  const skip = (page - 1) * limit;

  // Build query
  const query: any = {};
  
  if (sectors) {
    query.sectors = { $in: sectors.split(',') };
  }
  
  if (expertise) {
    query.expertise = { $in: expertise.split(',') };
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
  
  if (minRating) {
    query.rating = { $gte: minRating };
  }
  
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { role: { $regex: search, $options: 'i' } },
      { bio: { $regex: search, $options: 'i' } },
      { experience: { $regex: search, $options: 'i' } },
    ];
  }

  // Only show active mentors to public
  if (!req.user || req.user.role !== 'admin') {
    query.isActive = true;
  }

  // Build sort object
  const sort: any = {};
  sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

  const mentors = await Mentor.find(query)
    .sort(sort)
    .skip(skip)
    .limit(limit);

  const total = await Mentor.countDocuments(query);

  res.json({
    success: true,
    data: {
      mentors,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalMentors: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      },
    },
  });
}));

// @route   POST /api/mentors
// @desc    Create mentor profile
// @access  Private
router.post('/', authenticate, validate(createMentorSchema), asyncHandler(async (req, res) => {
  // Check if email already exists
  const existingMentor = await Mentor.findOne({ email: req.body.email });
  if (existingMentor) {
    return res.status(400).json({
      success: false,
      message: 'Mentor with this email already exists',
    });
  }

  const mentorData = {
    ...req.body,
    userId: req.user._id,
  };

  const mentor = new Mentor(mentorData);
  await mentor.save();

  res.status(201).json({
    success: true,
    message: 'Mentor profile created successfully',
    data: {
      mentor,
    },
  });
}));

// @route   GET /api/mentors/:id
// @desc    Get mentor by ID
// @access  Public
router.get('/:id', optionalAuth, asyncHandler(async (req, res) => {
  const mentor = await Mentor.findById(req.params.id);
  
  if (!mentor) {
    return res.status(404).json({
      success: false,
      message: 'Mentor not found',
    });
  }

  // Only show active mentors to public
  if (!req.user || req.user.role !== 'admin') {
    if (!mentor.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Mentor profile is not active',
      });
    }
  }

  res.json({
    success: true,
    data: {
      mentor,
    },
  });
}));

// @route   PUT /api/mentors/:id
// @desc    Update mentor
// @access  Private
router.put('/:id', authenticate, validate(updateMentorSchema), asyncHandler(async (req, res) => {
  const mentor = await Mentor.findById(req.params.id);
  
  if (!mentor) {
    return res.status(404).json({
      success: false,
      message: 'Mentor not found',
    });
  }

  // Check if user can update this mentor
  if (req.user.role !== 'admin' && req.user._id.toString() !== mentor.userId?.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Access denied',
    });
  }

  // Check if email is being changed and if it's already taken
  if (req.body.email && req.body.email !== mentor.email) {
    const existingMentor = await Mentor.findOne({ email: req.body.email });
    if (existingMentor) {
      return res.status(400).json({
        success: false,
        message: 'Email already exists',
      });
    }
  }

  // Update mentor
  Object.assign(mentor, req.body);
  await mentor.save();

  res.json({
    success: true,
    message: 'Mentor updated successfully',
    data: {
      mentor,
    },
  });
}));

// @route   DELETE /api/mentors/:id
// @desc    Delete mentor
// @access  Private
router.delete('/:id', authenticate, asyncHandler(async (req, res) => {
  const mentor = await Mentor.findById(req.params.id);
  
  if (!mentor) {
    return res.status(404).json({
      success: false,
      message: 'Mentor not found',
    });
  }

  // Check if user can delete this mentor
  if (req.user.role !== 'admin' && req.user._id.toString() !== mentor.userId?.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Access denied',
    });
  }

  await Mentor.findByIdAndDelete(req.params.id);

  res.json({
    success: true,
    message: 'Mentor deleted successfully',
  });
}));

// @route   GET /api/mentors/stats/overview
// @desc    Get mentor statistics overview
// @access  Public
router.get('/stats/overview', asyncHandler(async (req, res) => {
  const totalMentors = await Mentor.countDocuments();
  const activeMentors = await Mentor.countDocuments({ isActive: true });
  const verifiedMentors = await Mentor.countDocuments({ isVerified: true });
  const availableMentors = await Mentor.countDocuments({ 
    isActive: true,
    $expr: { $lt: ['$currentMentees.length', '$preferences.maxMentees'] }
  });

  // Expertise distribution
  const expertiseDistribution = await Mentor.aggregate([
    { $unwind: '$expertise' },
    { $group: { _id: '$expertise', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 10 }
  ]);

  // Sector distribution
  const sectorDistribution = await Mentor.aggregate([
    { $unwind: '$sectors' },
    { $group: { _id: '$sectors', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 10 }
  ]);

  // Rating distribution
  const ratingDistribution = await Mentor.aggregate([
    { $group: { _id: { $floor: '$rating' }, count: { $sum: 1 } } },
    { $sort: { _id: 1 } }
  ]);

  res.json({
    success: true,
    data: {
      totalMentors,
      activeMentors,
      verifiedMentors,
      availableMentors,
      expertiseDistribution,
      sectorDistribution,
      ratingDistribution,
    },
  });
}));

export default router;
