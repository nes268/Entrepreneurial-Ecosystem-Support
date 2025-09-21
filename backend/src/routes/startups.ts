import express, { Request, Response } from 'express';
import { Startup, IStartup } from '../models/Startup';
import { User, IUser } from '../models/User';
import { Document } from '../models/Document';
import { Profile } from '../models/Profile';
import { authenticate, authorize, optionalAuth } from '../middleware/auth';
import { validate, validateQuery } from '../middleware/validation';
import { asyncHandler } from '../middleware/errorHandler';
import Joi from 'joi';

interface AuthenticatedRequest extends Request {
  user?: IUser; // Define the user property added by the authenticate middleware
}

const router = express.Router();

// Validation schemas
const createStartupSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  founder: Joi.string().min(2).max(100).required(),
  sector: Joi.string().min(2).max(100).required(),
  type: Joi.string().valid('innovation', 'incubation').required(),
  trlLevel: Joi.number().min(1).max(9).required(),
  email: Joi.string().email().required(),
  description: Joi.string().max(1000).allow('', null),
  website: Joi.string().uri().allow('', null),
  linkedinProfile: Joi.string().uri().allow('', null),
  teamSize: Joi.number().min(1).allow(null),
  foundedYear: Joi.number().min(1900).max(new Date().getFullYear()).allow(null),
  location: Joi.string().max(100).allow('', null),
  coFounderNames: Joi.array().items(Joi.string().max(100)).allow(null),
  applicationStatus: Joi.string().valid('draft', 'submitted', 'under_review', 'approved', 'rejected').default('draft'),
  
  // Incubation Details
  previouslyIncubated: Joi.boolean().default(false),
  incubatorName: Joi.string().max(200).allow('', null),
  incubatorLocation: Joi.string().max(200).allow('', null),
  incubationDuration: Joi.string().max(100).allow('', null),
  incubatorType: Joi.string().max(100).allow('', null),
  incubationMode: Joi.string().valid('online', 'offline', 'hybrid').allow(null),
  supportsReceived: Joi.array().items(Joi.string().max(200)).allow(null),

  // Documentation (assuming these are URLs or references)
  aadhaarDoc: Joi.string().uri().allow('', null),
  incorporationCert: Joi.string().uri().allow('', null),
  msmeCert: Joi.string().uri().allow('', null),
  dpiitCert: Joi.string().uri().allow('', null),
  mouPartnership: Joi.string().uri().allow('', null),

  // Pitch Deck & Traction
  businessDocuments: Joi.array().items(Joi.string().uri()).allow(null),
  tractionDetails: Joi.string().max(2000).allow('', null),
  balanceSheet: Joi.string().uri().allow('', null),

  // Funding Information
  fundingStage: Joi.string().max(100).allow('', null),
  alreadyFunded: Joi.boolean().default(false),
  fundingAmount: Joi.number().min(0).allow(null),
  fundingSource: Joi.string().max(200).allow('', null),
  fundingDate: Joi.date().iso().allow(null),
});

const updateStartupSchema = Joi.object({
  name: Joi.string().min(2).max(100),
  founder: Joi.string().min(2).max(100),
  sector: Joi.string().min(2).max(100),
  type: Joi.string().valid('innovation', 'incubation'),
  trlLevel: Joi.number().min(1).max(9),
  email: Joi.string().email(),
  description: Joi.string().max(1000).allow('', null),
  website: Joi.string().uri().allow('', null),
  linkedinProfile: Joi.string().uri().allow('', null),
  teamSize: Joi.number().min(1).allow(null),
  foundedYear: Joi.number().min(1900).max(new Date().getFullYear()).allow(null),
  location: Joi.string().max(100).allow('', null),
  coFounderNames: Joi.array().items(Joi.string().max(100)).allow(null),
  status: Joi.string().valid('pending', 'active', 'completed', 'dropout'),
  applicationStatus: Joi.string().valid('draft', 'submitted', 'under_review', 'approved', 'rejected'),
  reviewNotes: Joi.string().max(1000).allow('', null),

  // Incubation Details
  previouslyIncubated: Joi.boolean(),
  incubatorName: Joi.string().max(200).allow('', null),
  incubatorLocation: Joi.string().max(200).allow('', null),
  incubationDuration: Joi.string().max(100).allow('', null),
  incubatorType: Joi.string().max(100).allow('', null),
  incubationMode: Joi.string().valid('online', 'offline', 'hybrid').allow(null),
  supportsReceived: Joi.array().items(Joi.string().max(200)).allow(null),

  // Documentation
  aadhaarDoc: Joi.string().uri().allow('', null),
  incorporationCert: Joi.string().uri().allow('', null),
  msmeCert: Joi.string().uri().allow('', null),
  dpiitCert: Joi.string().uri().allow('', null),
  mouPartnership: Joi.string().uri().allow('', null),

  // Pitch Deck & Traction
  businessDocuments: Joi.array().items(Joi.string().uri()).allow(null),
  tractionDetails: Joi.string().max(2000).allow('', null),
  balanceSheet: Joi.string().uri().allow('', null),

  // Funding Information
  fundingStage: Joi.string().max(100).allow('', null),
  alreadyFunded: Joi.boolean(),
  fundingAmount: Joi.number().min(0).allow(null),
  fundingSource: Joi.string().max(200).allow('', null),
  fundingDate: Joi.date().iso().allow(null),
}).min(1); // At least one field is required for update

const getStartupsQuerySchema = Joi.object({
  page: Joi.number().min(1).default(1),
  limit: Joi.number().min(1).max(100).default(10),
  type: Joi.string().valid('innovation', 'incubation'),
  status: Joi.string().valid('pending', 'active', 'completed', 'dropout'),
  applicationStatus: Joi.string().valid('draft', 'submitted', 'under_review', 'approved', 'rejected'),
  sector: Joi.string(),
  trlLevel: Joi.number().min(1).max(9),
  search: Joi.string().max(100),
  sortBy: Joi.string().valid('createdAt', 'name', 'submissionDate', 'trlLevel').default('createdAt'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
});

// @route   GET /api/startups/dashboard/my-startup
// @desc    Get current user's startup for dashboard
// @access  Private
router.get('/dashboard/my-startup', authenticate, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user || !req.user._id) {
    return res.status(401).json({ success: false, message: 'Not authorized' });
  }

  const startup = await Startup.findOne({ userId: req.user._id })
    .populate('userId', 'fullName email username')
    .populate('assignedMentor', 'name role email bio')
    .populate('assignedInvestor', 'name firm email investmentRange focusAreas');

  if (!startup) {
    return res.status(404).json({
      success: false,
      message: 'No startup found for this user',
    });
  }

  return res.json({
    success: true,
    data: { startup },
  });
}));

// @route   GET /api/startups/dashboard/progress
// @desc    Get startup application progress
// @access  Private
router.get('/dashboard/progress', authenticate, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user || !req.user._id) {
    return res.status(401).json({ success: false, message: 'Not authorized' });
  }

  const startup = await Startup.findOne({ userId: req.user._id });
  const profile = await Profile.findOne({ userId: req.user._id });

  if (!startup) {
    return res.status(404).json({
      success: false,
      message: 'No startup found for this user',
    });
  }

  // Calculate progress based on completed fields
  const requiredFields = [
    'name', 'founder', 'sector', 'type', 'trlLevel', 'email',
    'description', 'website', 'linkedinProfile', 'location'
  ];
  
  let completedFields = 0;
  requiredFields.forEach(field => {
    if (startup.get(field)) completedFields++;
  });
  
  // Add profile completion
  let profileCompletion = 0;
  if (profile) {
    profileCompletion = profile.completionPercentage || 0;
  }
  
  const overallProgress = Math.round(((completedFields / requiredFields.length) * 50) + (profileCompletion * 0.5));
  
  const progress = {
    overallProgress,
    startupInfoProgress: Math.round((completedFields / requiredFields.length) * 100),
    profileProgress: profileCompletion,
    applicationStatus: startup.applicationStatus,
    status: startup.status,
    nextSteps: getNextSteps(startup.applicationStatus, overallProgress),
  };

  return res.json({
    success: true,
    data: { progress },
  });
}));

// @route   GET /api/startups/dashboard/milestones
// @desc    Get startup milestones
// @access  Private
router.get('/dashboard/milestones', authenticate, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user || !req.user._id) {
    return res.status(401).json({ success: false, message: 'Not authorized' });
  }

  const startup = await Startup.findOne({ userId: req.user._id });

  if (!startup) {
    return res.status(404).json({
      success: false,
      message: 'No startup found for this user',
    });
  }

  const milestones = startup.milestones || [];
  
  // Add default milestones if none exist
  if (milestones.length === 0 && startup.applicationStatus === 'approved') {
    const defaultMilestones = [
      {
        name: 'Complete Business Plan',
        description: 'Finalize your business plan with mentor guidance',
        targetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        status: 'pending' as const
      },
      {
        name: 'MVP Development',
        description: 'Develop your minimum viable product',
        targetDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
        status: 'pending' as const
      },
      {
        name: 'Market Validation',
        description: 'Validate your product in the market',
        targetDate: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000), // 120 days from now
        status: 'pending' as const
      }
    ];
    
    startup.milestones = defaultMilestones;
    await startup.save();
  }

  return res.json({
    success: true,
    data: { milestones: startup.milestones },
  });
}));

// @route   PUT /api/startups/dashboard/milestones/:milestoneId
// @desc    Update milestone status
// @access  Private
router.put('/dashboard/milestones/:milestoneId', authenticate, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user || !req.user._id) {
    return res.status(401).json({ success: false, message: 'Not authorized' });
  }

  const { status, completedDate } = req.body;
  const startup = await Startup.findOne({ userId: req.user._id });

  if (!startup) {
    return res.status(404).json({
      success: false,
      message: 'No startup found for this user',
    });
  }

  const milestone = startup.milestones?.find((m: any) => m._id?.toString() === req.params.milestoneId);
  if (!milestone) {
    return res.status(404).json({
      success: false,
      message: 'Milestone not found',
    });
  }

  milestone.status = status;
  if (status === 'completed' && completedDate) {
    milestone.completedDate = new Date(completedDate);
  }

  await startup.save();

  return res.json({
    success: true,
    message: 'Milestone updated successfully',
    data: { milestone },
  });
}));

// @route   GET /api/startups/stats/overview
// @desc    Get startup statistics overview
// @access  Public
router.get('/stats/overview', asyncHandler(async (req: Request, res: Response) => {
  const totalStartups = await Startup.countDocuments();
  const innovationStartups = await Startup.countDocuments({ type: 'innovation' });
  const incubationStartups = await Startup.countDocuments({ type: 'incubation' });
  const activeStartups = await Startup.countDocuments({ status: 'active' });
  const approvedStartups = await Startup.countDocuments({ applicationStatus: 'approved' });
  const pendingStartups = await Startup.countDocuments({ applicationStatus: 'pending' });

  const dropoutStartups = await Startup.countDocuments({ status: 'dropout' });

  // TRL Level distribution
  const trlDistribution = await Startup.aggregate([
    { $group: { _id: '$trlLevel', count: { $sum: 1 } } },
    { $sort: { _id: 1 } }
  ]);

  // Sector distribution
  const sectorDistribution = await Startup.aggregate([
    { $group: { _id: '$sector', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 10 }
  ]);

  res.json({
    success: true,
    data: {
      totalStartups,
      innovationStartups,
      incubationStartups,
      activeStartups,
      approvedStartups,
      pendingStartups,
      trlDistribution,
      sectorDistribution,
    },
  });
}));

// @route   GET /api/startups/with-documents
// @desc    Get startups with their documents (admin only)
// @access  Private/Admin
router.get('/with-documents', authenticate, authorize('admin'), validateQuery(getStartupsQuerySchema), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { page, limit, type, status, applicationStatus, sector, trlLevel, search, sortBy, sortOrder } = req.query as any;
  const skip = (page - 1) * limit;

  // Build query
  const query: any = {};
  
  if (type) query.type = type;
  if (status) query.status = status;
  if (applicationStatus) query.applicationStatus = applicationStatus;
  if (sector) query.sector = { $regex: sector, $options: 'i' };
  if (trlLevel) query.trlLevel = trlLevel;
  
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { founder: { $regex: search, $options: 'i' } },
      { sector: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ];
  }

  // Build sort object
  const sort: any = {};
  sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

  const startups = await Startup.find(query)
    .populate('userId', 'fullName email username')
    .populate('assignedMentor', 'name role email')
    .populate('assignedInvestor', 'name firm email')
    .sort(sort)
    .skip(skip)
    .limit(limit);

  // Get documents for each startup
  const startupsWithDocuments = await Promise.all(
    startups.map(async (startup) => {
      // Get documents uploaded by this startup user
      const documents = await Document.find({ userId: startup.userId })
        .select('name location owner fileSize uploadDate type category description')
        .sort({ uploadDate: -1 });

      // Get profile documents (from Profile model)
      const profile = await Profile.findOne({ userId: startup.userId });
      const profileDocuments = [];
      
      if (profile) {
        // Add profile documents if they exist
        if (profile.aadhaarDoc) {
          profileDocuments.push({
            name: 'Aadhaar Card',
            type: 'pdf',
            category: 'profile',
            uploadDate: profile.createdAt,
            description: 'Aadhaar card document',
            source: 'profile'
          });
        }
        if (profile.incorporationCert) {
          profileDocuments.push({
            name: 'Incorporation Certificate',
            type: 'pdf',
            category: 'profile',
            uploadDate: profile.createdAt,
            description: 'Company incorporation certificate',
            source: 'profile'
          });
        }
        if (profile.msmeCert) {
          profileDocuments.push({
            name: 'MSME Certificate',
            type: 'pdf',
            category: 'profile',
            uploadDate: profile.createdAt,
            description: 'MSME registration certificate',
            source: 'profile'
          });
        }
        if (profile.dpiitCert) {
          profileDocuments.push({
            name: 'DPIIT Certificate',
            type: 'pdf',
            category: 'profile',
            uploadDate: profile.createdAt,
            description: 'DPIIT recognition certificate',
            source: 'profile'
          });
        }
        if (profile.mouPartnership) {
          profileDocuments.push({
            name: 'MoU/Partnership',
            type: 'pdf',
            category: 'profile',
            uploadDate: profile.createdAt,
            description: 'Partnership agreements or MoUs',
            source: 'profile'
          });
        }
        if (profile.balanceSheet) {
          profileDocuments.push({
            name: 'Balance Sheet',
            type: 'pdf',
            category: 'financial',
            uploadDate: profile.createdAt,
            description: 'Financial balance sheet',
            source: 'profile'
          });
        }
        if (profile.businessDocuments && profile.businessDocuments.length > 0) {
          profile.businessDocuments.forEach((doc, index) => {
            profileDocuments.push({
              name: `Business Document ${index + 1}`,
              type: 'pdf',
              category: 'startup',
              uploadDate: profile.createdAt,
              description: 'Business related document',
              source: 'profile'
            });
          });
        }
      }

      return {
        ...startup.toObject(),
        documents: [...documents, ...profileDocuments],
        documentCount: documents.length + profileDocuments.length
      };
    })
  );

  const total = await Startup.countDocuments(query);

  res.json({
    success: true,
    data: {
      startups: startupsWithDocuments,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalStartups: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      },
    },
  });
}));

// @route   GET /api/startups
// @desc    Get all startups
// @access  Public (with optional auth for filtering)
router.get('/', optionalAuth, validateQuery(getStartupsQuerySchema), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { page, limit, type, status, applicationStatus, sector, trlLevel, search, sortBy, sortOrder } = req.query as any;
  const skip = (page - 1) * limit;

  // Build query
  const query: any = {};
  
  if (type) query.type = type;
  if (status) query.status = status;
  if (applicationStatus) query.applicationStatus = applicationStatus;
  if (sector) query.sector = { $regex: sector, $options: 'i' };
  if (trlLevel) query.trlLevel = trlLevel;
  
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { founder: { $regex: search, $options: 'i' } },
      { sector: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ];
  }

  // If not admin, only show approved startups
  if (!req.user || req.user.role !== 'admin') {
    query.applicationStatus = 'approved';
  }

  // Build sort object
  const sort: any = {};
  sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

  const startups = await Startup.find(query)
    .populate('userId', 'fullName email username')
    .populate('assignedMentor', 'name role email')
    .populate('assignedInvestor', 'name firm email')
    .sort(sort)
    .skip(skip)
    .limit(limit);

  const total = await Startup.countDocuments(query);

  res.json({
    success: true,
    data: {
      startups,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalStartups: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      },
    },
  });
}));

// @route   POST /api/startups
// @desc    Create new startup application
// @access  Private
router.post('/', authenticate, validate(createStartupSchema), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user || !req.user._id) {
    return res.status(401).json({ success: false, message: 'Not authorized to create startup' });
  }
  const startupData = {
    ...req.body,
    userId: req.user._id,
  };

  const startup = new Startup(startupData);
  await startup.save();

  // Populate user data
  await startup.populate('userId', 'fullName email username');

  return res.status(201).json({
    success: true,
    message: 'Startup application created successfully',
    data: {
      startup,
    },
  });
}));

// @route   GET /api/startups/:id
// @desc    Get startup by ID
// @access  Public
router.get('/:id', optionalAuth, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const startup = await Startup.findById(req.params.id)
    .populate('userId', 'fullName email username')
    .populate('assignedMentor', 'name role email')
    .populate('assignedInvestor', 'name firm email');
  
  if (!startup) {
    return res.status(404).json({
      success: false,
      message: 'Startup not found',
    });
  }

  // Check if user can view this startup
  if (!req.user || (req.user.role !== 'admin' && (req.user._id as any).toString() !== startup.userId._id.toString())) {
    // Only show approved startups to non-owners
    if (startup.applicationStatus !== 'approved') {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }
  }

  return res.json({
    success: true,
    data: {
      startup,
    },
  });
}));

// @route   PUT /api/startups/:id
// @desc    Update startup
// @access  Private
router.put('/:id', authenticate, validate(updateStartupSchema), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const startup = await Startup.findById(req.params.id) as IStartup;
  
  if (!startup) {
    return res.status(404).json({
      success: false,
      message: 'Startup not found',
    });
  }

  if (!req.user || (req.user.role !== 'admin' && (req.user._id as any).toString() !== startup.userId.toString())) {
    return res.status(403).json({
      success: false,
      message: 'Access denied',
    });
  }

  // Handle funding history if new funding info is provided
  if (req.body.alreadyFunded && req.body.fundingAmount && req.body.fundingSource && req.body.fundingDate && req.body.fundingStage) {
    if (!startup.fundingHistory) {
      startup.fundingHistory = []; // Initialize if undefined
    }
    startup.fundingHistory.push({
      amount: req.body.fundingAmount,
      source: req.body.fundingSource,
      date: new Date(req.body.fundingDate),
      stage: req.body.fundingStage,
    });
    // Remove temporary funding fields from req.body to avoid direct assignment
    delete req.body.fundingAmount;
    delete req.body.fundingSource;
    delete req.body.fundingDate;
    delete req.body.fundingStage;
    delete req.body.alreadyFunded;
  }

  // Update startup
  Object.assign(startup, req.body);
  await startup.save();

  // Populate user data
  await startup.populate('userId', 'fullName email username');
  await startup.populate('assignedMentor', 'name role email');
  await startup.populate('assignedInvestor', 'name firm email');

  return res.json({
    success: true,
    message: 'Startup updated successfully',
    data: {
      startup,
    },
  });
}));

// @route   DELETE /api/startups/:id
// @desc    Delete startup
// @access  Private
router.delete('/:id', authenticate, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const startup = await Startup.findById(req.params.id);
  
  if (!startup) {
    return res.status(404).json({
      success: false,
      message: 'Startup not found',
    });
  }

  if (!req.user || (req.user.role !== 'admin' && (req.user._id as any).toString() !== startup.userId.toString())) {
    return res.status(403).json({
      success: false,
      message: 'Access denied',
    });
  }

  await Startup.findByIdAndDelete(req.params.id);

  return res.json({
    success: true,
    message: 'Startup deleted successfully',
  });
}));


// Helper function to determine next steps
function getNextSteps(applicationStatus: string, progress: number): string[] {
  const steps: string[] = [];
  
  if (applicationStatus === 'draft') {
    if (progress < 50) {
      steps.push('Complete your startup information');
      steps.push('Fill out your profile details');
    }
    steps.push('Submit your application for review');
  } else if (applicationStatus === 'submitted') {
    steps.push('Wait for admin review');
    steps.push('Prepare for potential follow-up questions');
  } else if (applicationStatus === 'under_review') {
    steps.push('Application is being reviewed');
    steps.push('You may be contacted for additional information');
  } else if (applicationStatus === 'approved') {
    steps.push('Welcome to the incubation program!');
    steps.push('Connect with your assigned mentor');
    steps.push('Start working on your milestones');
  } else if (applicationStatus === 'rejected') {
    steps.push('Review the feedback provided');
    steps.push('Make necessary improvements');
    steps.push('Consider reapplying when ready');
  }
  
  return steps;
}

export default router;
