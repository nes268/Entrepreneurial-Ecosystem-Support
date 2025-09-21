<<<<<<< HEAD
import express, { Request, Response } from 'express';
=======
import express from 'express';
import mongoose from 'mongoose';
>>>>>>> 10cc61c92e5783a9588c402816970bd7bd9c5fe2
import { Event } from '../models/Event';
import { authenticate, authorize, optionalAuth, AuthRequest } from '../middleware/auth';
import { validate, validateQuery } from '../middleware/validation';
import { asyncHandler } from '../middleware/errorHandler';
import { IUser } from '../models/User';
import Joi from 'joi';

interface OptionalAuthRequest extends Request {
  user?: IUser;
}

const router = express.Router();

// Validation schemas
const createEventSchema = Joi.object({
  title: Joi.string().min(5).max(200).required(),
  description: Joi.string().min(20).max(2000).required(),
  date: Joi.date().min('now').required(),
  time: Joi.string().required(),
  location: Joi.string().min(5).max(200).required(),
  category: Joi.string().min(2).max(50).required(),
  organizedBy: Joi.string().min(2).max(100).required(),
  registrationLink: Joi.string().uri(),
  onlineEventUrl: Joi.string().uri(),
  image: Joi.string().uri(),
  maxAttendees: Joi.number().min(1),
  price: Joi.number().min(0),
  isFree: Joi.boolean().default(true),
  eventType: Joi.string().valid('workshop', 'seminar', 'networking', 'pitch', 'demo', 'other').required(),
  duration: Joi.number().min(15).required(),
  requirements: Joi.array().items(Joi.string()),
  materials: Joi.array().items(Joi.string()),
  registrationRequired: Joi.boolean().default(true),
  registrationDeadline: Joi.date().min('now'),
  tags: Joi.array().items(Joi.string()),
});

const updateEventSchema = Joi.object({
  title: Joi.string().min(5).max(200),
  description: Joi.string().min(20).max(2000),
  date: Joi.date().min('now'),
  time: Joi.string(),
  location: Joi.string().min(5).max(200),
  category: Joi.string().min(2).max(50),
  organizedBy: Joi.string().min(2).max(100),
  registrationLink: Joi.string().uri(),
  onlineEventUrl: Joi.string().uri(),
  image: Joi.string().uri(),
  maxAttendees: Joi.number().min(1),
  price: Joi.number().min(0),
  isFree: Joi.boolean(),
  eventType: Joi.string().valid('workshop', 'seminar', 'networking', 'pitch', 'demo', 'other'),
  duration: Joi.number().min(15),
  requirements: Joi.array().items(Joi.string()),
  materials: Joi.array().items(Joi.string()),
  registrationRequired: Joi.boolean(),
  registrationDeadline: Joi.date().min('now'),
  status: Joi.string().valid('draft', 'published', 'cancelled', 'completed'),
  isActive: Joi.boolean(),
  tags: Joi.array().items(Joi.string()),
});

const getEventsQuerySchema = Joi.object({
  page: Joi.number().min(1).default(1),
  limit: Joi.number().min(1).max(100).default(10),
  category: Joi.string(),
  eventType: Joi.string().valid('workshop', 'seminar', 'networking', 'pitch', 'demo', 'other'),
  status: Joi.string().valid('draft', 'published', 'cancelled', 'completed'),
  isActive: Joi.boolean(),
  isFree: Joi.boolean(),
  dateFrom: Joi.date(),
  dateTo: Joi.date(),
  search: Joi.string().max(100),
  sortBy: Joi.string().valid('date', 'title', 'createdAt', 'currentAttendees').default('date'),
  sortOrder: Joi.string().valid('asc', 'desc').default('asc'),
});

// @route   GET /api/events
// @desc    Get all events
// @access  Public
<<<<<<< HEAD
router.get('/', optionalAuth, validateQuery(getEventsQuerySchema), asyncHandler(async (req: OptionalAuthRequest, res: Response) => {
=======

// @route   GET /api/events/:id/participants
// @desc    Get participants for an event
// @access  Private (admin only)
router.get('/:id/participants', authenticate, authorize('admin'), asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ success: false, message: 'Invalid event id' });
  }
  const event = await Event.findById(id).populate('attendees', 'fullName email username role');
  if (!event) {
    return res.status(404).json({ success: false, message: 'Event not found' });
  }
  return res.json({ success: true, data: { participants: event.attendees, count: event.attendees?.length || 0 } });
}));

router.get('/', optionalAuth, validateQuery(getEventsQuerySchema), asyncHandler(async (req, res) => {
>>>>>>> 10cc61c92e5783a9588c402816970bd7bd9c5fe2
  const { page, limit, category, eventType, status, isActive, isFree, dateFrom, dateTo, search, sortBy, sortOrder } = req.query as any;
  const skip = (page - 1) * limit;

  // Build query
  const query: any = {};
  
  if (category) {
    query.category = { $regex: category, $options: 'i' };
  }
  
  if (eventType) {
    query.eventType = eventType;
  }
  
  if (status) {
    query.status = status;
  }
  
  if (typeof isActive === 'boolean') {
    query.isActive = isActive;
  }
  
  if (typeof isFree === 'boolean') {
    query.isFree = isFree;
  }
  
  if (dateFrom || dateTo) {
    query.date = {};
    if (dateFrom) query.date.$gte = new Date(dateFrom);
    if (dateTo) query.date.$lte = new Date(dateTo);
  }
  
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { category: { $regex: search, $options: 'i' } },
      { organizedBy: { $regex: search, $options: 'i' } },
      { tags: { $in: [new RegExp(search, 'i')] } },
    ];
  }

  // Only show published events to public
  if (!req.user || req.user.role !== 'admin') {
    query.status = 'published';
    query.isActive = true;
  }

  // Build sort object
  const sort: any = {};
  sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

  const events = await Event.find(query)
    .populate('userId', 'fullName email username')
    .sort(sort)
    .skip(skip)
    .limit(limit);

  const total = await Event.countDocuments(query);

  res.json({
    success: true,
    data: {
      events,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalEvents: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      },
    },
  });
}));

// @route   POST /api/events
// @desc    Create new event
// @access  Private
router.post('/', authenticate, validate(createEventSchema), asyncHandler(async (req: AuthRequest, res: Response) => {
  const eventData = {
    ...req.body,
    userId: req.user._id,
  };

  const event = new Event(eventData);
  await event.save();

  // Populate user data
  await event.populate('userId', 'fullName email username');

  res.status(201).json({
    success: true,
    message: 'Event created successfully',
    data: {
      event,
    },
  });
}));

// @route   GET /api/events/:id
// @desc    Get event by ID
// @access  Public
router.get('/:id', optionalAuth, asyncHandler(async (req: OptionalAuthRequest, res: Response) => {
  const event = await Event.findById(req.params.id)
    .populate('userId', 'fullName email username')
    .populate('attendees', 'fullName email username');
  
  if (!event) {
    return res.status(404).json({
      success: false,
      message: 'Event not found',
    });
  }

  // Only show published events to public
  if (!req.user || req.user.role !== 'admin') {
    if (event.status !== 'published' || !event.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Event is not available',
      });
    }
  }

  res.json({
    success: true,
    data: {
      event,
    },
  });
}));

// @route   PUT /api/events/:id
// @desc    Update event
// @access  Private
router.put('/:id', authenticate, validate(updateEventSchema), asyncHandler(async (req: AuthRequest, res: Response) => {
  const event = await Event.findById(req.params.id);
  
  if (!event) {
    return res.status(404).json({
      success: false,
      message: 'Event not found',
    });
  }

  // Check if user can update this event
  if (req.user.role !== 'admin' && req.user._id.toString() !== event.userId.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Access denied',
    });
  }

  // Update event
  Object.assign(event, req.body);
  await event.save();

  // Populate user data
  await event.populate('userId', 'fullName email username');

  res.json({
    success: true,
    message: 'Event updated successfully',
    data: {
      event,
    },
  });
}));

// @route   DELETE /api/events/:id
// @desc    Delete event
// @access  Private
router.delete('/:id', authenticate, asyncHandler(async (req: AuthRequest, res: Response) => {
  const event = await Event.findById(req.params.id);
  
  if (!event) {
    return res.status(404).json({
      success: false,
      message: 'Event not found',
    });
  }

  // Check if user can delete this event
  if (req.user.role !== 'admin' && req.user._id.toString() !== event.userId.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Access denied',
    });
  }

  await Event.findByIdAndDelete(req.params.id);

  res.json({
    success: true,
    message: 'Event deleted successfully',
  });
}));

// @route   POST /api/events/:id/register
// @desc    Register for event
// @access  Private
router.post('/:id/register', authenticate, asyncHandler(async (req: AuthRequest, res: Response) => {
  const event = await Event.findById(req.params.id);
  
  if (!event) {
    return res.status(404).json({
      success: false,
      message: 'Event not found',
    });
  }

  if (event.status !== 'published' || !event.isActive) {
    return res.status(400).json({
      success: false,
      message: 'Event is not available for registration',
    });
  }

  if (!event.isRegistrationOpen) {
    return res.status(400).json({
      success: false,
      message: 'Registration is closed for this event',
    });
  }

  if (event.isFull) {
    return res.status(400).json({
      success: false,
      message: 'Event is full',
    });
  }

  // Check if user is already registered
  if (event.attendees.includes(req.user._id)) {
    return res.status(400).json({
      success: false,
      message: 'You are already registered for this event',
    });
  }

  // Register user
  event.attendees.push(req.user._id);
  event.currentAttendees = event.attendees.length;
  await event.save();

  res.json({
    success: true,
    message: 'Successfully registered for the event',
  });
}));

// @route   POST /api/events/:id/unregister
// @desc    Unregister from event
// @access  Private
router.post('/:id/unregister', authenticate, asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);
  
  if (!event) {
    return res.status(404).json({
      success: false,
      message: 'Event not found',
    });
  }

  // Check if user is registered
  if (!event.attendees.includes(req.user._id)) {
    return res.status(400).json({
      success: false,
      message: 'You are not registered for this event',
    });
  }

  // Unregister user
  event.attendees = event.attendees.filter(attendeeId => attendeeId.toString() !== req.user._id.toString());
  event.currentAttendees = event.attendees.length;
  await event.save();

  res.json({
    success: true,
    message: 'Successfully unregistered from the event',
  });
}));

// @route   GET /api/events/stats/overview
// @desc    Get event statistics overview
// @access  Public
router.get('/stats/overview', asyncHandler(async (req, res) => {
  const totalEvents = await Event.countDocuments();
  const publishedEvents = await Event.countDocuments({ status: 'published' });
  const upcomingEvents = await Event.countDocuments({ 
    status: 'published',
    date: { $gte: new Date() }
  });
  const pastEvents = await Event.countDocuments({ 
    status: 'published',
    date: { $lt: new Date() }
  });

  // Event type distribution
  const eventTypeDistribution = await Event.aggregate([
    { $group: { _id: '$eventType', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);

  // Category distribution
  const categoryDistribution = await Event.aggregate([
    { $group: { _id: '$category', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 10 }
  ]);

  // Monthly event count
  const monthlyEvents = await Event.aggregate([
    {
      $group: {
        _id: {
          year: { $year: '$date' },
          month: { $month: '$date' }
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
      totalEvents,
      publishedEvents,
      upcomingEvents,
      pastEvents,
      eventTypeDistribution,
      categoryDistribution,
      monthlyEvents,
    },
  });
}));

export default router;
