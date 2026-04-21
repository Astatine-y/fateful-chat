// apps/api/src/routes/subscription.ts
import { Router } from 'express';
import { config } from '../config';
import User from '../models/User';
import { auth } from '../middleware/auth';
import { AuthRequest } from '../types';

const router = Router();

const SUBSCRIPTION_PRICES = {
  monthly: {
    priceId: process.env.STRIPE_MONTHLY_PRICE_ID || 'price_monthly',
    amount: 9.99,
    credits: -1,
  },
  yearly: {
    priceId: process.env.STRIPE_YEARLY_PRICE_ID || 'price_yearly',
    amount: 79.99,
    credits: -1,
  },
};

router.post('/create-session', auth, async (req: AuthRequest, res: any) => {
  try {
    const { plan } = req.body;
    const price = SUBSCRIPTION_PRICES[plan as keyof typeof SUBSCRIPTION_PRICES];
    
    if (!price) {
      return res.status(400).json({ error: 'Invalid plan' });
    }

    const stripe = require('stripe')(config.stripe.secretKey);
    const user = await User.findById(req.user?.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{
        price: price.priceId,
        quantity: 1,
      }],
      success_url: `${process.env.FRONTEND_URL}/dashboard?subscription=success`,
      cancel_url: `${process.env.FRONTEND_URL}/dashboard?subscription=cancelled`,
      customer_email: user.email,
      metadata: {
        userId: user._id.toString(),
        plan,
      },
    });

    res.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error('Subscription error:', error);
    res.status(500).json({ error: 'Failed to create subscription session' });
  }
});

router.get('/status', auth, async (req: AuthRequest, res: any) => {
  try {
    const user = await User.findById(req.user?.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      isSubscribed: user.isSubscribed || false,
      plan: user.subscriptionPlan || null,
      expiresAt: user.subscriptionExpiresAt || null,
    });
  } catch (error) {
    console.error('Subscription status error:', error);
    res.status(500).json({ error: 'Failed to get subscription status' });
  }
});

router.post('/cancel', auth, async (req: AuthRequest, res: any) => {
  try {
    const user = await User.findById(req.user?.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (!user.stripeSubscriptionId) {
      return res.status(400).json({ error: 'No active subscription' });
    }

    const stripe = require('stripe')(config.stripe.secretKey);
    await stripe.subscriptions.cancel(user.stripeSubscriptionId);

    user.isSubscribed = false;
    user.subscriptionPlan = undefined;
    user.subscriptionExpiresAt = undefined;
    user.stripeSubscriptionId = undefined;
    await user.save();

    res.json({ success: true, message: 'Subscription cancelled' });
  } catch (error) {
    console.error('Cancel subscription error:', error);
    res.status(500).json({ error: 'Failed to cancel subscription' });
  }
});

export default router;