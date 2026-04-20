// apps/api/src/routes/analytics.ts
import { Router } from 'express';
import { auth } from '../middleware/auth';
import { AuthRequest } from '../types';

const router = Router();

const events: Map<string, any[]> = new Map();
const dailyStats = {
  totalCalculations: 0,
  totalUsers: 0,
  totalRevenue: 0,
  freeCalculations: 0,
  paidCalculations: 0,
  subscriptions: 0,
};

function getDateKey(): string {
  return new Date().toISOString().split('T')[0];
}

router.post('/track', async (req: AuthRequest, res: any) => {
  try {
    const { event, properties } = req.body;
    const today = getDateKey();
    
    if (!events.has(today)) {
      events.set(today, []);
    }
    
    events.get(today)!.push({
      event,
      properties,
      userId: req.user?.id,
      timestamp: new Date().toISOString(),
    });

    switch (event) {
      case 'calculation':
        dailyStats.totalCalculations++;
        if (properties?.free) {
          dailyStats.freeCalculations++;
        } else {
          dailyStats.paidCalculations++;
        }
        break;
      case 'registration':
        dailyStats.totalUsers++;
        break;
      case 'subscription':
        dailyStats.subscriptions++;
        dailyStats.totalRevenue += properties?.amount || 0;
        break;
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Analytics track error:', error);
    res.status(500).json({ error: 'Tracking failed' });
  }
});

router.get('/stats', async (req: AuthRequest, res: any) => {
  try {
    const { period = '7d' } = req.query;
    const days = parseInt(period as string) || 7;
    
    const stats = {
      period,
      totalCalculations: dailyStats.totalCalculations,
      totalUsers: dailyStats.totalUsers,
      totalRevenue: dailyStats.totalRevenue,
      freeCalculations: dailyStats.freeCalculations,
      paidCalculations: dailyStats.paidCalculations,
      subscriptions: dailyStats.subscriptions,
      daily: [] as any[],
    };

    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const key = date.toISOString().split('T')[0];
      const dayEvents = events.get(key) || [];
      
      const calculations = dayEvents.filter(e => e.event === 'calculation').length;
      const users = dayEvents.filter(e => e.event === 'registration').length;
      
      stats.daily.push({
        date: key,
        calculations,
        users,
      });
    }

    res.json(stats);
  } catch (error) {
    console.error('Analytics stats error:', error);
    res.status(500).json({ error: 'Failed to get stats' });
  }
});

router.get('/realtime', async (req: AuthRequest, res: any) => {
  try {
    const today = getDateKey();
    const dayEvents = events.get(today) || [];
    const uniqueUsers = new Set(dayEvents.map(e => e.userId).filter(Boolean));
    
    res.json({
      activeUsers: uniqueUsers.size,
      calculationsToday: dayEvents.filter(e => e.event === 'calculation').length,
      registrationsToday: dayEvents.filter(e => e.event === 'registration').length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Realtime error:', error);
    res.status(500).json({ error: 'Failed to get realtime stats' });
  }
});

export default router;