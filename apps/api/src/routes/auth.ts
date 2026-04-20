// apps/api/src/routes/auth.ts
import { Router } from 'express';
import User from '../models/User';
import * as jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { config } from '../config';
import { UserCredentials } from '../types';
import { google } from 'googleapis';

const googleOAuth2Client = new google.auth.OAuth2(
  config.google.clientId,
  config.google.clientSecret,
  config.google.callbackUrl
);

const router = Router();

function generateToken(user: any) {
  return (jwt as any).sign(
    { id: user._id.toString(), email: user.email },
    config.jwt.secret as string,
    { expiresIn: config.jwt.expiresIn }
  );
}

/**
 * GET /api/auth/google
 * Redirect to Google OAuth
 */
router.get('/google', (req: any, res: any) => {
  if (!config.google.clientId) {
    return res.status(501).json({ error: 'Google login not configured' });
  }
  const scopes = ['https://www.googleapis.com/auth/userinfo.email'];
  const authUrl = googleOAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    prompt: 'consent',
  });
  res.json({ url: authUrl });
});

/**
 * POST /api/auth/apple
 * Sign in with Apple (ID Token verification)
 */
router.post('/apple', async (req: any, res: any) => {
  try {
    const { idToken, email, name } = req.body;
    
    if (!config.apple.clientId) {
      return res.status(501).json({ error: 'Apple login not configured' });
    }

    // In production, verify the idToken with Apple
    // For now, create user from email if provided
    if (!email) {
      return res.status(400).json({ error: 'Email required for Apple sign in' });
    }

    let user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      const randomPassword = Math.random().toString(36).slice(-16);
      user = await User.create({
        email: email.toLowerCase(),
        password: await bcrypt.hash(randomPassword, 10),
        credits: 5,
        name: name || '',
      });
    }

    const token = generateToken(user);

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        email: user.email,
        credits: user.credits,
      },
    });
  } catch (error) {
    console.error('Apple auth error:', error);
    res.status(500).json({ error: 'Apple authentication failed' });
  }
});

/**
 * GET /api/auth/google/callback
 * Handle Google OAuth callback
 */
router.get('/google/callback', async (req: any, res: any) => {
  try {
    const { code } = req.query;
    if (!code) {
      return res.status(400).json({ error: 'No code provided' });
    }

    const { tokens } = await googleOAuth2Client.getToken(code);
    googleOAuth2Client.setCredentials(tokens);

    const oauth2 = google.oauth2({ version: 'v2', auth: googleOAuth2Client });
    const { data } = await oauth2.userinfo.get();

    if (!data.email) {
      return res.status(400).json({ error: 'Could not get email from Google' });
    }

    let user = await User.findOne({ email: data.email.toLowerCase() });

    if (!user) {
      user = await User.create({
        email: data.email.toLowerCase(),
        password: await bcrypt.hash(tokens.access_token || 'google-oauth', 10),
        credits: 5,
        name: data.name || '',
      });
    }

    const token = generateToken(user);

    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/callback?token=${token}`);
  } catch (error) {
    console.error('Google callback error:', error);
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/login?error=google_auth_failed`);
  }
});

/**
 * POST /api/auth/register
 * Register a new user
 */
router.post('/register', async (req: any, res: any) => {
  try {
    const { email, password }: UserCredentials = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user with 5 free bonus credits
    const user = await User.create({
      email: email.toLowerCase(),
      password: hashedPassword,
      credits: 5, // Free bonus credits on signup
    });

    const token = generateToken(user);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        email: user.email,
        credits: user.credits,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

/**
 * POST /api/auth/login
 * Login user
 */
router.post('/login', async (req: any, res: any) => {
  try {
    const { email, password }: UserCredentials = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Compare password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = generateToken(user);

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        email: user.email,
        credits: user.credits,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

export default router;
