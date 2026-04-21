// apps/api/src/routes/bazi.ts
import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { getBazi, BaziInput, BaziOutput } from '@fateful-chat/bazi-core';

interface BaziResult {
  year: string;
  month: string;
  day: string;
  hour: string;
  wu_xing?: string[];
  shi_shen?: string[];
  da_yun?: any;
  liu_yue?: any;
}

function calculateBaziCore(
  year: number, 
  month: number, 
  day: number, 
  hour: number, 
  gender: 'male' | 'female',
  longitude?: number,
  latitude?: number
): BaziResult {
  const input: BaziInput = {
    year,
    month,
    day,
    hour,
    gender,
    longitude,
    latitude,
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
}

function formatForAI(bazi: BaziResult, locationInfo: string = ''): string {
  const pillars = [
    `年柱 (Year): ${bazi.year}`,
    `月柱 (Month): ${bazi.month}`,
    `日柱 (Day): ${bazi.day}`,
    `时柱 (Hour): ${bazi.hour}`
  ].join('\n');
  
  const elements = bazi.wu_xing ? `\n五行 (Elements): ${bazi.wu_xing.join(', ')}` : '';
  const shishen = bazi.shi_shen ? `\n十神 (Ten Gods): ${bazi.shi_shen.join(', ')}` : '';
  
  return `${pillars}${elements}${shishen}${locationInfo}`;
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

    const { year, month, day, hour, gender = 'male', longitude = 120, latitude = 30 } = req.body;

    if (!hasValidToken) {
      if (lastFreeDate === today && freeCookie === 'used') {
        return res.status(429).json({
          error: 'Free daily reading already used today',
          message: 'Register or login to continue calculating',
          upgrade: 'Create an account to get 5 free credits',
        });
      }
      
      const bazi = calculateBaziCore(year, month, day, hour, gender, longitude, latitude);
      
      // Format additional info for AI about location used
      const locationInfo = `\n出生位置: 经度${longitude}°, 纬度${latitude}° (用于计算真太阳时)`;
      const aiPrompt = formatForAI(bazi, locationInfo);
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

    const bazi = calculateBaziCore(year, month, day, hour, gender, longitude, latitude);
    const locationInfo = `\n出生位置: 经度${longitude}°, 纬度${latitude}° (用于计算真太阳时)`;
    const aiPrompt = formatForAI(bazi, locationInfo);
    const interpretation = await getAiInterpretation(aiPrompt);

    res.json({
      success: true,
      data: {
        bazi,
        interpretation,
        creditsUsed,
        creditsRemaining: isSubscribed ? -1 : user.credits,
        isSubscribed,
        location: { longitude, latitude },
      },
    });
  } catch (err) {
    console.error('Bazi calculation error:', err);
    res.status(500).json({ error: 'Failed to calculate bazi' });
  }
});

export default router;