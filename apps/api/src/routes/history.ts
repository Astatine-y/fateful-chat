// apps/api/src/routes/history.ts
import { Router } from 'express';
import { auth } from '../middleware/auth';
import Calculation from '../models/Calculation';
import { AuthRequest } from '../types';

const router = Router();

router.post('/', auth, async (req: AuthRequest, res: any) => {
  try {
    const { year, month, day, hour, longitude, latitude, bazi, interpretation, isFree } = req.body;

    const calculation = await Calculation.create({
      userId: req.user?.id,
      year,
      month,
      day,
      hour,
      longitude,
      latitude,
      bazi,
      interpretation,
      isFree,
    });

    res.status(201).json({ success: true, id: calculation._id });
  } catch (error) {
    console.error('Save history error:', error);
    res.status(500).json({ error: 'Failed to save calculation' });
  }
});

router.get('/', auth, async (req: AuthRequest, res: any) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    
    const calculations = await Calculation.find({ userId: req.user?.id })
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    const total = await Calculation.countDocuments({ userId: req.user?.id });

    res.json({
      calculations,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
    });
  } catch (error) {
    console.error('Get history error:', error);
    res.status(500).json({ error: 'Failed to get history' });
  }
});

router.get('/:id', auth, async (req: AuthRequest, res: any) => {
  try {
    const calculation = await Calculation.findOne({
      _id: req.params.id,
      userId: req.user?.id,
    });

    if (!calculation) {
      return res.status(404).json({ error: 'Calculation not found' });
    }

    res.json(calculation);
  } catch (error) {
    console.error('Get calculation error:', error);
    res.status(500).json({ error: 'Failed to get calculation' });
  }
});

router.delete('/:id', auth, async (req: AuthRequest, res: any) => {
  try {
    await Calculation.findOneAndDelete({
      _id: req.params.id,
      userId: req.user?.id,
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Delete calculation error:', error);
    res.status(500).json({ error: 'Failed to delete calculation' });
  }
});

export default router;