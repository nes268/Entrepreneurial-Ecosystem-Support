
import express from 'express';
import { authenticate } from '../middleware/auth';
import { Profile } from '../models/Profile';
import { asyncHandler } from '../middleware/errorHandler';

const router = express.Router();

// @route   GET /api/profile/me
// @desc    Get current user's profile
// @access  Private
router.get('/me', authenticate, asyncHandler(async (req: any, res: any) => {
  const profile = await Profile.findOne({ user: req.user.id }).populate('user', ['fullName', 'email']);
  if (!profile) {
    return res.status(404).json({ message: 'Profile not found' });
  }
  res.json(profile);
}));

// @route   POST /api/profile
// @desc    Create or update user profile
// @access  Private
router.post('/', authenticate, asyncHandler(async (req: any, res: any) => {
  const { companyName, website, stage, sector, pitchDeck, businessPlan, financialProjections } = req.body;

  const profileFields = {
    user: req.user.id,
    companyName,
    website,
    stage,
    sector,
    pitchDeck,
    businessPlan,
    financialProjections,
  };

  let profile = await Profile.findOne({ user: req.user.id });

  if (profile) {
    // Update
    profile = await Profile.findOneAndUpdate({ user: req.user.id }, { $set: profileFields }, { new: true });
    return res.json(profile);
  }

  // Create
  profile = new Profile(profileFields);
  await profile.save();
  res.json(profile);
}));

export default router;
