import express, { Request, Response } from 'express';
import { authenticate, requireAdmin, optionalAuth, AuthRequest } from '../middleware/auth';
import { validate, validateQuery } from '../middleware/validation';
import { asyncHandler } from '../middleware/errorHandler';
import prisma from '../config/prisma';
import Joi from 'joi';

const router = express.Router();

// Validation schemas (simplified to align with Prisma schema)
const createEventSchema = Joi.object({
  title: Joi.string().min(2).max(200).required(),
  description: Joi.string().min(10).max(2000).required(),
  date: Joi.date().required(),
  time: Joi.string().required(),
  location: Joi.string().min(2).max(200).required(),
  category: Joi.string().min(2).max(50).required(),
  status: Joi.string().valid('draft', 'published', 'cancelled', 'completed').default('published'),
});

const updateEventSchema = Joi.object({
  title: Joi.string().min(2).max(200),
  description: Joi.string().min(10).max(2000),
  date: Joi.date(),
  time: Joi.string(),
  location: Joi.string().min(2).max(200),
  category: Joi.string().min(2).max(50),
  status: Joi.string().valid('draft', 'published', 'cancelled', 'completed'),
  isActive: Joi.boolean(),
});

const getEventsQuerySchema = Joi.object({
  page: Joi.number().min(1).default(1),
  limit: Joi.number().min(1).max(100).default(10),
  category: Joi.string(),
  status: Joi.string().valid('draft', 'published', 'cancelled', 'completed'),
  dateFrom: Joi.date(),
  dateTo: Joi.date(),
  search: Joi.string().max(100),
  sortBy: Joi.string().valid('date', 'title', 'createdAt', 'currentAttendees').default('date'),
  sortOrder: Joi.string().valid('asc', 'desc').default('asc'),
});

// List events
router.get('/', optionalAuth, validateQuery(getEventsQuerySchema), asyncHandler(async (req: Request & { user?: any }, res: Response) => {
  const { page, limit, category, status, dateFrom, dateTo, search, sortBy, sortOrder } = req.query as any;
  const skip = (page - 1) * limit;

  const where: any = {};
  if (category) where.category = { contains: String(category), mode: 'insensitive' };
  if (status) where.status = String(status);
  if (dateFrom || dateTo) {
    where.date = {};
    if (dateFrom) where.date.gte = new Date(dateFrom);
    if (dateTo) where.date.lte = new Date(dateTo);
  }
  if (search) {
    where.OR = [
      { title: { contains: String(search), mode: 'insensitive' } },
      { description: { contains: String(search), mode: 'insensitive' } },
      { category: { contains: String(search), mode: 'insensitive' } },
    ];
  }

  // Only show published events to public
  if (!req.user || req.user.role !== 'ADMIN') {
    where.status = 'published';
    where.isActive = true;
  }

  const orderBy = [{ [String(sortBy)]: String(sortOrder) }];

  const [events, total] = await Promise.all([
    prisma.event.findMany({
      where,
      orderBy: orderBy as any,
      skip,
      take: Number(limit),
    }),
    prisma.event.count({ where }),
  ]);

  res.json({
    success: true,
    data: {
      events,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(total / Number(limit)),
        totalEvents: total,
        hasNext: Number(page) < Math.ceil(total / Number(limit)),
        hasPrev: Number(page) > 1,
      },
    },
  });
}));

// Create event
router.post('/', authenticate, validate(createEventSchema), asyncHandler(async (req: AuthRequest, res: Response) => {
  const event = await prisma.event.create({
    data: {
      userId: req.user!.id,
      title: req.body.title,
      description: req.body.description,
      date: new Date(req.body.date),
      time: req.body.time,
      location: req.body.location,
      category: req.body.category,
      status: req.body.status || 'published',
      isActive: true,
    },
  });

  res.status(201).json({ success: true, message: 'Event created successfully', data: { event } });
}));

// Get event by id
router.get('/:id', optionalAuth, asyncHandler(async (req: Request & { user?: any }, res: Response) => {
  const event = await prisma.event.findUnique({ where: { id: req.params.id } });
  if (!event) {
    return res.status(404).json({ success: false, message: 'Event not found' });
  }
  if (!req.user || req.user.role !== 'ADMIN') {
    if (event.status !== 'published' || !event.isActive) {
      return res.status(403).json({ success: false, message: 'Event is not available' });
    }
  }
  res.json({ success: true, data: { event } });
}));

// Update event
router.put('/:id', authenticate, validate(updateEventSchema), asyncHandler(async (req: AuthRequest, res: Response) => {
  const event = await prisma.event.findUnique({ where: { id: req.params.id } });
  if (!event) {
    return res.status(404).json({ success: false, message: 'Event not found' });
  }
  if (req.user!.role !== 'ADMIN' && event.userId !== req.user!.id) {
    return res.status(403).json({ success: false, message: 'Access denied' });
  }

  const updated = await prisma.event.update({ where: { id: req.params.id }, data: req.body });
  res.json({ success: true, message: 'Event updated successfully', data: { event: updated } });
}));

// Delete event
router.delete('/:id', authenticate, asyncHandler(async (req: AuthRequest, res: Response) => {
  const event = await prisma.event.findUnique({ where: { id: req.params.id } });
  if (!event) {
    return res.status(404).json({ success: false, message: 'Event not found' });
  }
  if (req.user!.role !== 'ADMIN' && event.userId !== req.user!.id) {
    return res.status(403).json({ success: false, message: 'Access denied' });
  }
  await prisma.event.delete({ where: { id: req.params.id } });
  res.json({ success: true, message: 'Event deleted successfully' });
}));

// Participants list (admin only)
router.get('/:id/participants', authenticate, requireAdmin(), asyncHandler(async (req: AuthRequest, res: Response) => {
  const attendees = await prisma.eventAttendee.findMany({
    where: { eventId: req.params.id },
    include: { user: { select: { id: true, fullName: true, email: true, username: true, role: true } } },
  });
  res.json({ success: true, data: { participants: attendees.map(a => a.user), count: attendees.length } });
}));

// Register for event
router.post('/:id/register', authenticate, asyncHandler(async (req: AuthRequest, res: Response) => {
  const event = await prisma.event.findUnique({ where: { id: req.params.id } });
  if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
  if (event.status !== 'published' || !event.isActive) return res.status(400).json({ success: false, message: 'Event is not available for registration' });

  const existing = await prisma.eventAttendee.findUnique({ where: { eventId_userId: { eventId: event.id, userId: req.user!.id } } });
  if (existing) return res.status(400).json({ success: false, message: 'You are already registered for this event' });

  await prisma.eventAttendee.create({ data: { eventId: event.id, userId: req.user!.id } });
  const count = await prisma.eventAttendee.count({ where: { eventId: event.id } });
  await prisma.event.update({ where: { id: event.id }, data: { currentAttendees: count } });

  res.json({ success: true, message: 'Successfully registered for the event' });
}));

// Unregister from event
router.post('/:id/unregister', authenticate, asyncHandler(async (req: AuthRequest, res: Response) => {
  const event = await prisma.event.findUnique({ where: { id: req.params.id } });
  if (!event) return res.status(404).json({ success: false, message: 'Event not found' });

  const existing = await prisma.eventAttendee.findUnique({ where: { eventId_userId: { eventId: event.id, userId: req.user!.id } } });
  if (!existing) return res.status(400).json({ success: false, message: 'You are not registered for this event' });

  await prisma.eventAttendee.delete({ where: { eventId_userId: { eventId: event.id, userId: req.user!.id } } });
  const count = await prisma.eventAttendee.count({ where: { eventId: event.id } });
  await prisma.event.update({ where: { id: event.id }, data: { currentAttendees: count } });

  res.json({ success: true, message: 'Successfully unregistered from the event' });
}));

// Stats overview
router.get('/stats/overview', asyncHandler(async (_req, res) => {
  const totalEvents = await prisma.event.count();
  const publishedEvents = await prisma.event.count({ where: { status: 'published' } });
  const now = new Date();
  const upcomingEvents = await prisma.event.count({ where: { status: 'published', date: { gte: now } } });
  const pastEvents = await prisma.event.count({ where: { status: 'published', date: { lt: now } } });

  const categoryAgg = await prisma.event.groupBy({ by: ['category'], _count: { _all: true }, orderBy: { _count: { _all: 'desc' } }, take: 10 });

  res.json({ success: true, data: { totalEvents, publishedEvents, upcomingEvents, pastEvents, categoryDistribution: categoryAgg } });
}));

export default router;
