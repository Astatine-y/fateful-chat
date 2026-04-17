// apps/api/src/routes/bazi.ts
import { Router } from 'express';
import { getBazi } from 'bazi-core';
import { getAiInterpretation } from '../utils/openai';
import { auth } from '../middleware/auth';
import { validateBaziInput } from '../validators/bazi';
import User from '../models/User';
import { AuthRequest } from '../types';

const router = Router();

/**
 * POST /api/bazi
 * Calculate bazi and get AI interpretation
 * Requires valid authentication and sufficient user credits
 */
router.post('/', auth, async (req: AuthRequest, res: any) => {
  try {
    // Validate input
    const { valid, errors } = validateBaziInput(req.body);
    if (!valid) {
      return res.status(400).json({ error: 'Invalid input', details: errors });
    }

    const { year, month, day, hour, longitude, latitude } = req.body;

    // Check user credits
    const user = await User.findById(req.user?.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.credits < 1) {
      return res.status(402).json({ error: 'Insufficient credits', required: 1, available: user.credits });
    }

    // Calculate bazi
    const bazi = getBazi(year, month, day, hour, longitude, latitude);
    
    // Get AI interpretation
    const interpretation = await getAiInterpretation(bazi);

    // Deduct credit
    user.credits -= 1;
    await user.save();

    res.json({
      success: true,
      data: {
        bazi,
        interpretation,
        creditsUsed: 1,
        creditsRemaining: user.credits,
      },
    });
  } catch (err) {
    console.error('Bazi calculation error:', err);
    res.status(500).json({ error: 'Failed to calculate bazi' });
  }
});

export default router;