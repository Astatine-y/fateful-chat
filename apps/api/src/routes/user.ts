// apps/api/src/routes/user.ts
import { Router } from 'express';
import User, { IUser } from '../models/User';
import { auth } from '../middleware/auth';
import { AuthRequest } from '../types';

const router = Router();

/**
 * GET /api/user/profile
 * Get current user's profile information
 * Requires authentication
 */
router.get('/profile', auth, async (req: AuthRequest, res: any) => {
  try {
    const user = await User.findById(req.user?.id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      success: true,
      data: {
        id: user._id,
        email: user.email,
        credits: user.credits,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

/**
 * GET /api/user/stats
 * Get user usage statistics
 * Requires authentication
 */
router.get('/stats', auth, async (req: AuthRequest, res: any) => {
  try {
    const user = await User.findById(req.user?.id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // TODO: Fetch from transaction/audit log collection when implemented
    const stats = {
      totalCreditsUsed: 0, // Calculate from transaction history
      totalCalculations: 0, // Count from calculation history
      createdAt: user.createdAt,
      lastActiveDate: user.updatedAt,
      creditsRemaining: user.credits,
    };

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('Stats fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

/**
 * PUT /api/user/profile
 * Update user profile
 * Requires authentication
 */
router.put('/profile', auth, async (req: AuthRequest, res: any) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Check if email is already taken
    if (email !== req.user?.email) {
      const existingUser = await User.findOne({ email: email.toLowerCase() });
      if (existingUser) {
        return res.status(409).json({ error: 'Email already in use' });
      }
    }

    const user = await User.findByIdAndUpdate(
      req.user?.id,
      { email: email.toLowerCase() },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      success: true,
      data: {
        id: user._id,
        email: user.email,
        credits: user.credits,
      },
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

/**
 * DELETE /api/user/account
 * Delete user account and all associated data
 * Requires authentication
 */
router.delete('/account', auth, async (req: AuthRequest, res: any) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ error: 'Password is required for account deletion' });
    }

    const user = await User.findById(req.user?.id).select('+password');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify password
    const bcrypt = require('bcrypt');
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid password' });
    }

    // Delete user
    await User.deleteOne({ _id: req.user?.id });

    // TODO: Delete associated data:
    // - Calculation history
    // - Transaction logs
    // - Any other user-specific data

    res.json({
      success: true,
      message: 'Account deleted successfully',
    });
  } catch (error) {
    console.error('Account deletion error:', error);
    res.status(500).json({ error: 'Failed to delete account' });
  }
});

export default router;
