import { Router } from 'express';
import { createPaymentIntent, retrievePaymentIntent } from '../utils/stripe';
import { auth } from '../middleware/auth';
import User from '../models/User';
import { AuthRequest } from '../types';

const router = Router();

/**
 * POST /api/payment/create-intent
 * Create a Stripe payment intent
 * Authenticated users only
 */
router.post('/create-intent', auth, async (req: AuthRequest<{ amount: number; creditsToAdd: number }>, res: any) => {
  try {
    const { amount, creditsToAdd } = req.body;

    // Validate input
    if (!amount || typeof amount !== 'number' || amount <= 0) {
      return res.status(400).json({ error: 'Valid amount is required' });
    }

    if (!creditsToAdd || typeof creditsToAdd !== 'number' || creditsToAdd <= 0) {
      return res.status(400).json({ error: 'creditsToAdd must be specified' });
    }

    // Create payment intent with metadata
    const paymentIntent = await createPaymentIntent(
      amount,
      {
        userId: req.user?.id.toString() || '',
        creditsToAdd: creditsToAdd.toString(),
      }
    );

    res.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount,
      creditsToAdd,
    });
  } catch (error) {
    console.error('Payment intent creation error:', error);
    res.status(500).json({ error: 'Failed to create payment intent' });
  }
});

/**
 * POST /api/payment/confirm
 * Confirm payment and add credits to user
 * Authenticated users only
 */
router.post('/confirm', auth, async (req: AuthRequest<{ paymentIntentId: string; creditsToAdd: number }>, res: any) => {
  try {
    const { paymentIntentId, creditsToAdd } = req.body;

    if (!paymentIntentId || !creditsToAdd) {
      return res.status(400).json({ error: 'paymentIntentId and creditsToAdd are required' });
    }

    // Verify payment intent
    const paymentIntent = await retrievePaymentIntent(paymentIntentId);

    if (paymentIntent.status !== 'succeeded') {
      return res.status(402).json({ error: 'Payment not completed', status: paymentIntent.status });
    }

    // Get user
    const user = await User.findById(req.user?.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update credits
    user.credits += creditsToAdd;
    await user.save();

    res.json({
      success: true,
      message: 'Credits added successfully',
      user: {
        id: user._id,
        email: user.email,
        credits: user.credits,
      },
    });
  } catch (error) {
    console.error('Payment confirmation error:', error);
    res.status(500).json({ error: 'Failed to confirm payment' });
  }
});

export default router;