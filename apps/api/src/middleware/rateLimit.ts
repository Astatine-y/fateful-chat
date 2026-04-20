import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';

const requestCounts = new Map<string, { count: number; resetTime: number }>();

const WINDOW_MS = 60 * 60 * 1000;
const MAX_REQUESTS = 100;

export function rateLimit(req: AuthRequest, res: Response, next: NextFunction) {
  const clientId = req.ip || req.connection?.remoteAddress || 'unknown';
  const now = Date.now();
  
  let record = requestCounts.get(clientId);
  
  if (!record || now > record.resetTime) {
    record = { count: 1, resetTime: now + WINDOW_MS };
    requestCounts.set(clientId, record);
    next();
    return;
  }
  
  if (record.count >= MAX_REQUESTS) {
    res.status(429).json({
      error: 'Too many requests',
      message: `Rate limit exceeded. Max ${MAX_REQUESTS} requests per hour.`,
      resetTime: new Date(record.resetTime).toISOString(),
    });
    return;
  }
  
  record.count++;
  next();
}

export function clearExpiredCounts() {
  const now = Date.now();
  for (const [key, record] of requestCounts.entries()) {
    if (now > record.resetTime) {
      requestCounts.delete(key);
    }
  }
}

setInterval(clearExpiredCounts, WINDOW_MS);