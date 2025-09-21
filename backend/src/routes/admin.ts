import { Router } from 'express';
import { protect, authorize } from '../middleware/auth';
import {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
} from '../controllers/users'; // Assuming users controller handles admin-level user management
import {
  getStartups,
  getStartup,
  createStartup,
  updateStartup,
  deleteStartup,
} from '../controllers/startups'; // Assuming startups controller handles admin-level startup management
import {
  getInvestors,
  getInvestor,
  createInvestor,
  updateInvestor,
  deleteInvestor,
} from '../controllers/investors'; // Assuming investors controller handles admin-level investor management
import {
  getMentors,
  getMentor,
  createMentor,
  updateMentor,
  deleteMentor,
} from '../controllers/mentors'; // Assuming mentors controller handles admin-level mentor management
import {
  getDocuments,
  getDocument,
  createDocument,
  updateDocument,
  deleteDocument,
} from '../controllers/documents'; // Assuming documents controller handles admin-level document management
import {
  getReports,
  getReport,
  createReport,
  updateReport,
  deleteReport,
} from '../controllers/reports'; // Assuming reports controller handles admin-level report management
import {
  getEvents,
  getEvent,
  createEvent,
  updateEvent,
  deleteEvent,
} from '../controllers/events'; // Assuming events controller handles admin-level event management

const router = Router();

// Protect all admin routes
router.use(protect);
router.use(authorize('admin')); // Only admin can access these routes

// User Management
router.route('/users')
  .get(getUsers)
  .post(createUser);
router.route('/users/:id')
  .get(getUser)
  .put(updateUser)
  .delete(deleteUser);

// Startup Management
router.route('/startups')
  .get(getStartups)
  .post(createStartup);
router.route('/startups/:id')
  .get(getStartup)
  .put(updateStartup)
  .delete(deleteStartup);

// Investor Management
router.route('/investors')
  .get(getInvestors)
  .post(createInvestor);
router.route('/investors/:id')
  .get(getInvestor)
  .put(updateInvestor)
  .delete(deleteInvestor);

// Mentor Management
router.route('/mentors')
  .get(getMentors)
  .post(createMentor);
router.route('/mentors/:id')
  .get(getMentor)
  .put(updateMentor)
  .delete(deleteMentor);

// Document Management
router.route('/documents')
  .get(getDocuments)
  .post(createDocument);
router.route('/documents/:id')
  .get(getDocument)
  .put(updateDocument)
  .delete(deleteDocument);

// Report Management
router.route('/reports')
  .get(getReports)
  .post(createReport);
router.route('/reports/:id')
  .get(getReport)
  .put(updateReport)
  .delete(deleteReport);

// Event Management
router.route('/events')
  .get(getEvents)
  .post(createEvent);
router.route('/events/:id')
  .get(getEvent)
  .put(updateEvent)
  .delete(deleteEvent);

export default router;
