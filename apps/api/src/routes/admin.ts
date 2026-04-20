// apps/api/src/routes/admin.ts
import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import Calculation from '../models/Calculation';
import Admin from '../models/Admin';
import { config } from '../config';

const router = Router();

function adminAuth(req: any, res: any, next: any) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'No authorization header' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, config.jwt.secret as string) as any;
    req.admin = decoded;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}

router.post('/login', async (req: any, res: any) => {
  try {
    const { email, password } = req.body;
    const admin = await Admin.findOne({ email }).select('+password');
    
    if (!admin) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const isValid = await bcrypt.compare(password, admin.password);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const token = jwt.sign(
      { id: admin._id, email: admin.email, role: admin.role },
      config.jwt.secret,
      { expiresIn: '24h' }
    );
    
    res.json({ token, role: admin.role });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

router.get('/users', adminAuth, async (req: any, res: any) => {
  try {
    const { page = 1, limit = 50, search } = req.query;
    const query: any = {};
    
    if (search) {
      query.$or = [
        { email: { $regex: search, $options: 'i' } },
      ];
    }
    
    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));
    
    const total = await User.countDocuments(query);
    
    res.json({
      users,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to get users' });
  }
});

router.get('/stats', adminAuth, async (req: any, res: any) => {
  try {
    const [
      totalUsers,
      totalCalculations,
      activeToday,
      totalRevenue,
      subscriptionCount,
    ] = await Promise.all([
      User.countDocuments(),
      Calculation.countDocuments(),
      User.countDocuments({
        lastActive: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
      }),
      User.aggregate([
        { $group: { _id: null, total: { $sum: '$credits' } } }
      ]),
      User.countDocuments({ isSubscribed: true }),
    ]);
    
    const recentUsers = await User.find()
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(10);
    
    const recentCalculations = await Calculation.find()
      .sort({ createdAt: -1 })
      .limit(10);
    
    res.json({
      totalUsers,
      totalCalculations,
      activeToday,
      totalRevenue: totalRevenue[0]?.total || 0,
      subscriptionCount,
      recentUsers,
      recentCalculations,
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Failed to get stats' });
  }
});

router.patch('/users/:id', adminAuth, async (req: any, res: any) => {
  try {
    const { credits, isSubscribed, subscriptionPlan } = req.body;
    const updates: any = {};
    
    if (credits !== undefined) updates.credits = credits;
    if (isSubscribed !== undefined) updates.isSubscribed = isSubscribed;
    if (subscriptionPlan !== undefined) updates.subscriptionPlan = subscriptionPlan;
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

router.delete('/users/:id', adminAuth, async (req: any, res: any) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    await Calculation.deleteMany({ userId: req.params.id });
    res.json({ success: true });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

export default router;