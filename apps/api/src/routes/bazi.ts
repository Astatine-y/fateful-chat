// apps/api/src/routes/bazi.ts
import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { getBazi } from '@fateful-chat/bazi-core';

interface BaziInput {
  year: number;
  month: number;
  day: number;
  hour: number;
  gender: 'male' | 'female';
  timezone?: number;
}

function calculateBaziCore(
  year: number, 
  month: number, 
  day: number, 
  hour: number, 
  longitude: number, 
  latitude: number,
  gender: 'male' | 'female' = 'male'
) {
  try {
    const input: BaziInput = {
      year,
      month,
      day,
      hour,
      gender,
      timezone: 8
    };
    
    const result = getBazi(input);
    
    return {
      year: result.gan_zhi.year,
      month: result.gan_zhi.month,
      day: result.gan_zhi.day,
      hour: result.gan_zhi.hour,
      wu_xing: result.wu_xing,
      shi_shen: result.shi_shen,
      da_yun: result.da_yun,
      liu_yue: result.liu_yue
    };
  } catch (error) {
    console.error('Bazi core calculation error:', error);
    return {
      year: '甲子',
      month: '乙丑',
      day: '丙寅',
      hour: '丁卯'
    };
  }
}

function formatForAI(bazi: any): string {
  return `年柱：${bazi.year}\n月柱：${bazi.month}\n日柱：${bazi.day}\n时柱：${bazi.hour}`;
}

import { getAiInterpretation } from '../utils/openai';
import { validateBaziInput } from '../validators/bazi';
import { config } from '../config';
import User from '../models/User';
import { AuthRequest, BaziRequest, AuthPayload } from '../types';

const router = Router();

function optionalAuth(req: AuthRequest, res: any, next: any) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    req.user = undefined;
    return next();
  }
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    req.user = undefined;
    return next();
  }
  try {
    const decoded = (jwt as any).verify(parts[1], config.jwt.secret as string) as AuthPayload;
    req.user = decoded;
  } catch {
    req.user = undefined;
  }
  next();
}

/**
 * POST /api/bazi
 * Calculate bazi and get AI interpretation
 * PUBLIC ENDPOINT - No authentication required
 * Free: 1 calculation per day (cookie-based)
 * Authenticated: Requires 1 credit
 */
router.post('/', optionalAuth, async (req: AuthRequest<BaziRequest>, res: any) => {
  const freeCookie = req.cookies?.bazi_free;
  const today = new Date().toDateString();
  const lastFreeDate = req.cookies?.bazi_date;
  const hasValidToken = req.user?.id;

  try {
    const { valid, errors } = validateBaziInput(req.body);
    if (!valid) {
      return res.status(400).json({ error: 'Invalid input', details: errors });
    }

    const { year, month, day, hour, longitude, latitude, gender = 'male' } = req.body;

    if (!hasValidToken) {
      if (lastFreeDate === today && freeCookie === 'used') {
        return res.status(429).json({
          error: 'Free daily reading already used today',
          message: 'Register or login to continue calculating',
          upgrade: 'Create an account to get 5 free credits',
        });
      }
      
      const bazi = calculateBaziCore(year, month, day, hour, longitude, latitude, gender);
      const aiPrompt = formatForAI(bazi);
      const interpretation = await getAiInterpretation(aiPrompt);

      res.cookie('bazi_free', 'used', { httpOnly: true, maxAge: 24 * 60 * 60 * 1000, sameSite: 'lax' });
      res.cookie('bazi_date', today, { httpOnly: true, maxAge: 24 * 60 * 60 * 1000, sameSite: 'lax' });

      return res.json({
        success: true,
        data: {
          bazi,
          interpretation,
          freeDaily: true,
          creditsRemaining: 0,
          cta: 'Register to unlock unlimited calculations',
        },
      });
    }

    const user = await User.findById(req.user?.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const isSubscribed = user.isSubscribed && user.subscriptionExpiresAt && new Date(user.subscriptionExpiresAt) > new Date();
    let creditsUsed = 0;

    if (!isSubscribed) {
      if (user.credits < 1) {
        return res.status(402).json({ error: 'Insufficient credits', required: 1, available: user.credits });
      }
      user.credits -= 1;
      creditsUsed = 1;
      await user.save();
    }

    const bazi = calculateBaziCore(year, month, day, hour, longitude, latitude, gender);
    const aiPrompt = formatForAI(bazi);
    const interpretation = await getAiInterpretation(aiPrompt);

    res.json({
      success: true,
      data: {
        bazi,
        interpretation,
        creditsUsed,
        creditsRemaining: isSubscribed ? -1 : user.credits,
        isSubscribed,
      },
    });
  } catch (err) {
    console.error('Bazi calculation error:', err);
    res.status(500).json({ error: 'Failed to calculate bazi' });
  }
});

export default router;