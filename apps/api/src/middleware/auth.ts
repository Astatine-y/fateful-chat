// apps/api/src/middleware/auth.ts
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { AuthPayload, AuthRequest } from '../types';

export function auth(req: AuthRequest, res: any, next: any): void {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    res.status(401).json({ error: 'Missing authorization token' });
    return;
  }

  try {
    const decoded = jwt.verify(token, config.jwt.secret) as AuthPayload;
    req.user = decoded;
    next();
  } catch (error) {
    const message = error instanceof jwt.TokenExpiredError 
      ? 'Token expired' 
      : error instanceof jwt.JsonWebTokenError
      ? 'Invalid token'
      : 'Unauthorized';
    res.status(401).json({ error: message });
  }
}

// apps/api/src/routes/auth.ts
import { Router } from 'express';
import User from '../models/User';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

const router = Router();

router.post('/register', async (req, res) => {
  const { email, password } = req.body;
  const hashed = await bcrypt.hash(password, 10);
  const user = await User.create({ email, password: hashed });
  res.json({ token: jwt.sign({ id: user._id }, 'secret') });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ error: 'Invalid creds' });
  }
  res.json({ token: jwt.sign({ id: user._id }, 'secret') });
});

export default router;