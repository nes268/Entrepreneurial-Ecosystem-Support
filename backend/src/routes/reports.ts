import express from 'express';
import { Report } from '../models/Report';
import { authenticate, authorize, optionalAuth } from '../middleware/auth';
import { validate, validateQuery } from '../middleware/validation';
import { asyncHandler } from '../middleware/errorHandler';
import Joi from 'joi';

const router = express.Router();

// Validation schemas
const createReportSchema = Joi.object({
  name: Joi.string().min(5).max(200).required(),
  type: Joi.string().min(2).max(50).required(),
  description: Joi.string().max(500),
  parameters: Joi.object().default({}),
  reportConfig: Joi.object({
    format: Joi.string().valid('pdf', 'excel', 'csv', 'json').default('pdf'),
    template: Joi.string(),
    filters: Joi.object(),
    dateRange: Joi.object({
      start: Joi.date(),
      end: Joi.date(),
    }),
  }),
  isPublic: Joi.boolean().default(false),
  tags: Joi.array().items(Joi.string()),
});

const updateReportSchema = Joi.object({
  name: Joi.string().min(5).max(200),
  description: Joi.string().max(500),
  parameters: Joi.object(),
  reportConfig: Joi.object({
    format: Joi.string().valid('pdf', 'excel', 'csv', 'json'),
    template: Joi.string(),
    filters: Joi.object(),
    dateRange: Joi.object({
      start: Joi.date(),
      end: Joi.date(),
    }),
  }),
  isPublic: Joi.boolean(),
  tags: Joi.array().items(Joi.string()),
});

const getReportsQuerySchema = Joi.object({
  page: Joi.number().min(1).default(1),
  limit: Joi.number().min(1).max(100).default(10),
  type: Joi.string(),
  status: Joi.string().valid('ready', 'processing', 'error'),
  isPublic: Joi.boolean(),
  search: Joi.string().max(100),
  sortBy: Joi.string().valid('createdAt', 'name', 'dateGenerated', 'fileSize').default('createdAt'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
});

// @route   GET /api/reports
// @desc    Get all reports
// @access  Private
router.get('/', authenticate, validateQuery(getReportsQuerySchema), asyncHandler(async (req, res) => {
  const { page, limit, type, status, isPublic, search, sortBy, sortOrder } = req.query as any;
  const skip = (page - 1) * limit;

  // Build query
  const query: any = {};
  
  if (type) {
    query.type = { $regex: type, $options: 'i' };
  }
  
  if (status) {
    query.status = status;
  }
  
  if (typeof isPublic === 'boolean') {
    query.isPublic = isPublic;
  }
  
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { tags: { $in: [new RegExp(search, 'i')] } },
    ];
  }

  // If not admin, only show user's reports or public reports
  if (req.user.role !== 'admin') {
    query.$or = [
      { userId: req.user._id },
      { isPublic: true }
    ];
  }

  // Build sort object
  const sort: any = {};
  sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

  const reports = await Report.find(query)
    .populate('userId', 'fullName email username')
    .sort(sort)
    .skip(skip)
    .limit(limit);

  const total = await Report.countDocuments(query);

  res.json({
    success: true,
    data: {
      reports,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalReports: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      },
    },
  });
}));

// @route   POST /api/reports
// @desc    Create new report
// @access  Private
router.post('/', authenticate, validate(createReportSchema), asyncHandler(async (req, res) => {
  const reportData = {
    ...req.body,
    userId: req.user._id,
    processingInfo: {
      startedAt: new Date(),
      retryCount: 0,
    },
  };

  const report = new Report(reportData);
  await report.save();

  // Populate user data
  await report.populate('userId', 'fullName email username');

  // TODO: Start report generation process in background
  // This would typically involve a job queue or background worker
  // For now, we'll simulate the process
  setTimeout(async () => {
    try {
      report.status = 'ready';
      report.processingInfo.completedAt = new Date();
      report.fileSize = '2.5 MB';
      report.filePath = `/reports/${report._id}.pdf`;
      report.fileName = `${report.name}.pdf`;
      report.mimeType = 'application/pdf';
      await report.save();
    } catch (error) {
      report.status = 'error';
      report.processingInfo.errorMessage = 'Report generation failed';
      await report.save();
    }
  }, 5000); // Simulate 5 second processing time

  res.status(201).json({
    success: true,
    message: 'Report generation started',
    data: {
      report,
    },
  });
}));

// @route   GET /api/reports/:id
// @desc    Get report by ID
// @access  Private
router.get('/:id', authenticate, asyncHandler(async (req, res) => {
  const report = await Report.findById(req.params.id)
    .populate('userId', 'fullName email username');
  
  if (!report) {
    return res.status(404).json({
      success: false,
      message: 'Report not found',
    });
  }

  // Check if user can access this report
  if (req.user.role !== 'admin' && 
      req.user._id.toString() !== report.userId._id.toString() && 
      !report.isPublic) {
    return res.status(403).json({
      success: false,
      message: 'Access denied',
    });
  }

  res.json({
    success: true,
    data: {
      report,
    },
  });
}));

// @route   GET /api/reports/:id/download
// @desc    Download report
// @access  Private
router.get('/:id/download', authenticate, asyncHandler(async (req, res) => {
  const report = await Report.findById(req.params.id);
  
  if (!report) {
    return res.status(404).json({
      success: false,
      message: 'Report not found',
    });
  }

  // Check if user can access this report
  if (req.user.role !== 'admin' && 
      req.user._id.toString() !== report.userId.toString() && 
      !report.isPublic) {
    return res.status(403).json({
      success: false,
      message: 'Access denied',
    });
  }

  if (report.status !== 'ready') {
    return res.status(400).json({
      success: false,
      message: 'Report is not ready for download',
    });
  }

  if (!report.filePath) {
    return res.status(404).json({
      success: false,
      message: 'Report file not found',
    });
  }

  // TODO: Implement actual file download
  // For now, return a placeholder response
  res.json({
    success: true,
    message: 'Report download initiated',
    data: {
      downloadUrl: `/api/reports/${report._id}/file`,
      fileName: report.fileName,
      fileSize: report.fileSize,
    },
  });
}));

// @route   PUT /api/reports/:id
// @desc    Update report
// @access  Private
router.put('/:id', authenticate, validate(updateReportSchema), asyncHandler(async (req, res) => {
  const report = await Report.findById(req.params.id);
  
  if (!report) {
    return res.status(404).json({
      success: false,
      message: 'Report not found',
    });
  }

  // Check if user can update this report
  if (req.user.role !== 'admin' && req.user._id.toString() !== report.userId.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Access denied',
    });
  }

  // Update report
  Object.assign(report, req.body);
  await report.save();

  // Populate user data
  await report.populate('userId', 'fullName email username');

  res.json({
    success: true,
    message: 'Report updated successfully',
    data: {
      report,
    },
  });
}));

// @route   DELETE /api/reports/:id
// @desc    Delete report
// @access  Private
router.delete('/:id', authenticate, asyncHandler(async (req, res) => {
  const report = await Report.findById(req.params.id);
  
  if (!report) {
    return res.status(404).json({
      success: false,
      message: 'Report not found',
    });
  }

  // Check if user can delete this report
  if (req.user.role !== 'admin' && req.user._id.toString() !== report.userId.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Access denied',
    });
  }

  // TODO: Delete associated files if they exist
  if (report.filePath) {
    // Delete file from filesystem
  }

  // Delete report record
  await Report.findByIdAndDelete(req.params.id);

  res.json({
    success: true,
    message: 'Report deleted successfully',
  });
}));

// @route   POST /api/reports/:id/regenerate
// @desc    Regenerate report
// @access  Private
router.post('/:id/regenerate', authenticate, asyncHandler(async (req, res) => {
  const report = await Report.findById(req.params.id);
  
  if (!report) {
    return res.status(404).json({
      success: false,
      message: 'Report not found',
    });
  }

  // Check if user can regenerate this report
  if (req.user.role !== 'admin' && req.user._id.toString() !== report.userId.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Access denied',
    });
  }

  // Reset report status
  report.status = 'processing';
  report.processingInfo.startedAt = new Date();
  report.processingInfo.completedAt = undefined;
  report.processingInfo.errorMessage = undefined;
  report.processingInfo.retryCount += 1;
  await report.save();

  // TODO: Start report generation process in background
  setTimeout(async () => {
    try {
      report.status = 'ready';
      report.processingInfo.completedAt = new Date();
      report.fileSize = '2.5 MB';
      report.filePath = `/reports/${report._id}.pdf`;
      report.fileName = `${report.name}.pdf`;
      report.mimeType = 'application/pdf';
      await report.save();
    } catch (error) {
      report.status = 'error';
      report.processingInfo.errorMessage = 'Report generation failed';
      await report.save();
    }
  }, 5000);

  res.json({
    success: true,
    message: 'Report regeneration started',
    data: {
      report,
    },
  });
}));

// @route   GET /api/reports/stats/overview
// @desc    Get report statistics overview
// @access  Private
router.get('/stats/overview', authenticate, asyncHandler(async (req, res) => {
  const query: any = {};
  
  // If not admin, only show user's reports
  if (req.user.role !== 'admin') {
    query.userId = req.user._id;
  }

  const totalReports = await Report.countDocuments(query);
  const readyReports = await Report.countDocuments({ ...query, status: 'ready' });
  const processingReports = await Report.countDocuments({ ...query, status: 'processing' });
  const errorReports = await Report.countDocuments({ ...query, status: 'error' });
  const publicReports = await Report.countDocuments({ ...query, isPublic: true });

  // Report type distribution
  const typeDistribution = await Report.aggregate([
    { $match: query },
    { $group: { _id: '$type', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);

  // Format distribution
  const formatDistribution = await Report.aggregate([
    { $match: query },
    { $group: { _id: '$reportConfig.format', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);

  // Monthly report generation
  const monthlyReports = await Report.aggregate([
    { $match: query },
    {
      $group: {
        _id: {
          year: { $year: '$dateGenerated' },
          month: { $month: '$dateGenerated' }
        },
        count: { $sum: 1 }
      }
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
    { $limit: 12 }
  ]);

  res.json({
    success: true,
    data: {
      totalReports,
      readyReports,
      processingReports,
      errorReports,
      publicReports,
      typeDistribution,
      formatDistribution,
      monthlyReports,
    },
  });
}));

export default router;
