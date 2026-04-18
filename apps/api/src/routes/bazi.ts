// apps/api/src/routes/bazi.ts
import { Router } from 'express';
// Temporary bazi calculation function until Python integration
function calculateBazi(year: number, month: number, day: number, hour: number, longitude: number, latitude: number) {
  // Simplified bazi calculation for demo
  return {
    year: '甲子',
    month: '乙丑',
    day: '丙寅',
    hour: '丁卯'
  };
}
import { getAiInterpretation } from '../utils/openai';
import { auth } from '../middleware/auth';
import { validateBaziInput } from '../validators/bazi';
import User from '../models/User';
import { AuthRequest, BaziRequest } from '../types';

const router = Router();

/**
 * POST /api/bazi
 * Calculate bazi and get AI interpretation
 * Requires valid authentication and sufficient user credits
 */
router.post('/', auth, async (req: AuthRequest<BaziRequest>, res: any) => {
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
    const bazi = calculateBazi(year, month, day, hour, longitude, latitude);
    
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