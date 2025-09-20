import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Document } from '../models/Document';
import { authenticate, authorize, optionalAuth } from '../middleware/auth';
import { validate, validateQuery } from '../middleware/validation';
import { asyncHandler } from '../middleware/errorHandler';
import { config } from '../config/env';
import Joi from 'joi';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = config.upload.uploadPath;
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req: any, file: any, cb: any) => {
  const allowedTypes = config.upload.allowedTypes;
  const fileExt = path.extname(file.originalname).toLowerCase().substring(1);
  
  if (allowedTypes.includes(fileExt)) {
    cb(null, true);
  } else {
    cb(new Error(`File type .${fileExt} is not allowed. Allowed types: ${allowedTypes.join(', ')}`), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: config.upload.maxFileSize,
  }
});

// Validation schemas
const createDocumentSchema = Joi.object({
  name: Joi.string().min(2).max(200).required(),
  description: Joi.string().max(500),
  category: Joi.string().valid('profile', 'startup', 'pitch_deck', 'financial', 'legal', 'other').required(),
  isPublic: Joi.boolean().default(false),
  tags: Joi.array().items(Joi.string()),
});

const updateDocumentSchema = Joi.object({
  name: Joi.string().min(2).max(200),
  description: Joi.string().max(500),
  category: Joi.string().valid('profile', 'startup', 'pitch_deck', 'financial', 'legal', 'other'),
  isPublic: Joi.boolean(),
  tags: Joi.array().items(Joi.string()),
});

const getDocumentsQuerySchema = Joi.object({
  page: Joi.number().min(1).default(1),
  limit: Joi.number().min(1).max(100).default(10),
  category: Joi.string().valid('profile', 'startup', 'pitch_deck', 'financial', 'legal', 'other'),
  type: Joi.string(),
  isPublic: Joi.boolean(),
  search: Joi.string().max(100),
  sortBy: Joi.string().valid('createdAt', 'name', 'uploadDate', 'fileSize').default('createdAt'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
});

// @route   GET /api/documents
// @desc    Get all documents
// @access  Private
router.get('/', authenticate, validateQuery(getDocumentsQuerySchema), asyncHandler(async (req, res) => {
  const { page, limit, category, type, isPublic, search, sortBy, sortOrder } = req.query as any;
  const skip = (page - 1) * limit;

  // Build query
  const query: any = {};
  
  if (category) {
    query.category = category;
  }
  
  if (type) {
    query.type = { $regex: type, $options: 'i' };
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

  // If not admin, only show user's documents or public documents
  if (req.user.role !== 'admin') {
    query.$or = [
      { userId: req.user._id },
      { isPublic: true }
    ];
  }

  // Build sort object
  const sort: any = {};
  sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

  const documents = await Document.find(query)
    .populate('userId', 'fullName email username')
    .sort(sort)
    .skip(skip)
    .limit(limit);

  const total = await Document.countDocuments(query);

  res.json({
    success: true,
    data: {
      documents,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalDocuments: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      },
    },
  });
}));

// @route   POST /api/documents/upload
// @desc    Upload document
// @access  Private
router.post('/upload', authenticate, upload.single('file'), validate(createDocumentSchema), asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'No file uploaded',
    });
  }

  const { name, description, category, isPublic, tags } = req.body;

  // Calculate file size
  const fileSizeInBytes = req.file.size;
  const fileSizeInMB = (fileSizeInBytes / (1024 * 1024)).toFixed(2);
  const fileSize = `${fileSizeInMB} MB`;

  const document = new Document({
    name: name || req.file.originalname,
    location: req.file.path,
    owner: req.user.fullName,
    fileSize,
    uploadDate: new Date(),
    type: path.extname(req.file.originalname).toLowerCase().substring(1),
    userId: req.user._id,
    originalName: req.file.originalname,
    mimeType: req.file.mimetype,
    description,
    category,
    isPublic: isPublic === 'true',
    status: 'ready',
    tags: tags ? tags.split(',') : [],
  });

  await document.save();

  // Populate user data
  await document.populate('userId', 'fullName email username');

  res.status(201).json({
    success: true,
    message: 'Document uploaded successfully',
    data: {
      document,
    },
  });
}));

// @route   GET /api/documents/:id
// @desc    Get document by ID
// @access  Private
router.get('/:id', authenticate, asyncHandler(async (req, res) => {
  const document = await Document.findById(req.params.id)
    .populate('userId', 'fullName email username');
  
  if (!document) {
    return res.status(404).json({
      success: false,
      message: 'Document not found',
    });
  }

  // Check if user can access this document
  if (req.user.role !== 'admin' && 
      req.user._id.toString() !== document.userId._id.toString() && 
      !document.isPublic) {
    return res.status(403).json({
      success: false,
      message: 'Access denied',
    });
  }

  res.json({
    success: true,
    data: {
      document,
    },
  });
}));

// @route   GET /api/documents/:id/download
// @desc    Download document
// @access  Private
router.get('/:id/download', authenticate, asyncHandler(async (req, res) => {
  const document = await Document.findById(req.params.id);
  
  if (!document) {
    return res.status(404).json({
      success: false,
      message: 'Document not found',
    });
  }

  // Check if user can access this document
  if (req.user.role !== 'admin' && 
      req.user._id.toString() !== document.userId.toString() && 
      !document.isPublic) {
    return res.status(403).json({
      success: false,
      message: 'Access denied',
    });
  }

  // Check if file exists
  if (!fs.existsSync(document.location)) {
    return res.status(404).json({
      success: false,
      message: 'File not found on server',
    });
  }

  res.download(document.location, document.originalName);
}));

// @route   PUT /api/documents/:id
// @desc    Update document
// @access  Private
router.put('/:id', authenticate, validate(updateDocumentSchema), asyncHandler(async (req, res) => {
  const document = await Document.findById(req.params.id);
  
  if (!document) {
    return res.status(404).json({
      success: false,
      message: 'Document not found',
    });
  }

  // Check if user can update this document
  if (req.user.role !== 'admin' && req.user._id.toString() !== document.userId.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Access denied',
    });
  }

  // Update document
  Object.assign(document, req.body);
  await document.save();

  // Populate user data
  await document.populate('userId', 'fullName email username');

  res.json({
    success: true,
    message: 'Document updated successfully',
    data: {
      document,
    },
  });
}));

// @route   DELETE /api/documents/:id
// @desc    Delete document
// @access  Private
router.delete('/:id', authenticate, asyncHandler(async (req, res) => {
  const document = await Document.findById(req.params.id);
  
  if (!document) {
    return res.status(404).json({
      success: false,
      message: 'Document not found',
    });
  }

  // Check if user can delete this document
  if (req.user.role !== 'admin' && req.user._id.toString() !== document.userId.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Access denied',
    });
  }

  // Delete file from filesystem
  if (fs.existsSync(document.location)) {
    fs.unlinkSync(document.location);
  }

  // Delete document record
  await Document.findByIdAndDelete(req.params.id);

  res.json({
    success: true,
    message: 'Document deleted successfully',
  });
}));

// @route   GET /api/documents/stats/overview
// @desc    Get document statistics overview
// @access  Private
router.get('/stats/overview', authenticate, asyncHandler(async (req, res) => {
  const query: any = {};
  
  // If not admin, only show user's documents
  if (req.user.role !== 'admin') {
    query.userId = req.user._id;
  }

  const totalDocuments = await Document.countDocuments(query);
  const publicDocuments = await Document.countDocuments({ ...query, isPublic: true });
  const privateDocuments = await Document.countDocuments({ ...query, isPublic: false });

  // Category distribution
  const categoryDistribution = await Document.aggregate([
    { $match: query },
    { $group: { _id: '$category', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);

  // File type distribution
  const typeDistribution = await Document.aggregate([
    { $match: query },
    { $group: { _id: '$type', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);

  // Total storage used
  const storageStats = await Document.aggregate([
    { $match: query },
    { $group: { _id: null, totalSize: { $sum: '$fileSizeBytes' } } }
  ]);

  res.json({
    success: true,
    data: {
      totalDocuments,
      publicDocuments,
      privateDocuments,
      categoryDistribution,
      typeDistribution,
      totalStorageUsed: storageStats[0]?.totalSize || 0,
    },
  });
}));

export default router;
