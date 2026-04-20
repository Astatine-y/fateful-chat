// apps/api/src/routes/referral.ts
import { Router } from 'express';
import User from '../models/User';
import { auth } from '../middleware/auth';
import { AuthRequest } from '../types';

const router = Router();

function generateReferralCode(): string {
  return Math.random().toString(36).substring(2, 10).toUpperCase();
}

router.get('/', auth, async (req: AuthRequest, res: any) => {
  try {
    const user = await User.findById(req.user?.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (!user.referralCode) {
      user.referralCode = generateReferralCode();
      await user.save();
    }

    res.json({
      referralCode: user.referralCode,
      referralCount: user.referralCount || 0,
      frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
    });
  } catch (error) {
    console.error('Referral error:', error);
    res.status(500).json({ error: 'Failed to get referral info' });
  }
});

router.post('/apply', async (req: any, res: any) => {
  try {
    const { referralCode, email, password } = req.body;

    if (!referralCode || !email || !password) {
      return res.status(400).json({ error: 'Referral code, email and password required' });
    }

    const referrer = await User.findOne({ referralCode: referralCode.toUpperCase() });
    if (!referrer) {
      return res.status(400).json({ error: 'Invalid referral code' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({ error: 'User already exists' });
    }

    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      email: email.toLowerCase(),
      password: hashedPassword,
      credits: 5,
      referredBy: referrer._id.toString(),
    });

    referrer.referralCount = (referrer.referralCount || 0) + 1;
    referrer.credits += 2;
    await referrer.save();

    const jwt = require('jsonwebtoken');
    const { config } = require('../config');
    const token = jwt.sign(
      { id: user._id.toString(), email: user.email },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        email: user.email,
        credits: user.credits,
      },
      message: '注册成功！推荐人获得2积分',
    });
  } catch (error) {
    console.error('Apply referral error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

export default router;