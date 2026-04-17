// apps/api/src/routes/stripe.ts
import { Router } from 'express';
import { raw } from 'express';
import Stripe from 'stripe';
import User from '../models/User';
import { config } from '../config';

const router = Router();

if (!config.stripe.secretKey || !config.stripe.webhookSecret) {
  console.warn('Stripe webhook secret not configured');
}

const stripe = new Stripe(config.stripe.secretKey, {
  apiVersion: '2023-10-16',
});

/**
 * POST /api/stripe/webhook
 * Stripe webhook endpoint for payment confirmation
 * Must use raw body parser for signature verification
 */
router.post(
  '/webhook',
  raw({ type: 'application/json' }),
  async (req: any, res: any) => {
    const sig = req.headers['stripe-signature'];

    if (!sig || !config.stripe.webhookSecret) {
      return res.status(400).json({ error: 'Missing signature or webhook secret not configured' });
    }

    try {
      const event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        config.stripe.webhookSecret
      );

      // Handle different event types
      switch (event.type) {
        case 'payment_intent.succeeded': {
          await handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent);
          break;
        }

        case 'payment_intent.payment_failed': {
          await handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent);
          break;
        }

        case 'payment_intent.canceled': {
          await handlePaymentIntentCanceled(event.data.object as Stripe.PaymentIntent);
          break;
        }

        default:
          console.log(`Unhandled event type: ${event.type}`);
      }

      // Return success response
      res.json({ received: true });
    } catch (error) {
      console.error('Webhook error:', error);
      const message = error instanceof Error ? error.message : 'Webhook error';
      res.status(400).json({ error: `Webhook Error: ${message}` });
    }
  }
);

/**
 * Handle successful payment intent
 */
async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  try {
    const { userId, creditsToAdd } = paymentIntent.metadata as any;

    if (!userId || !creditsToAdd) {
      console.error('Missing metadata in payment intent:', paymentIntent.id);
      return;
    }

    // Update user credits
    const user = await User.findByIdAndUpdate(
      userId,
      { $inc: { credits: parseInt(creditsToAdd, 10) } },
      { new: true }
    );

    if (!user) {
      console.error('User not found:', userId);
      return;
    }

    console.log(`✅ Payment confirmed for user ${userId}. Added ${creditsToAdd} credits. Total: ${user.credits}`);

    // TODO: Send confirmation email to user
    // TODO: Log transaction in database

  } catch (error) {
    console.error('Error handling payment success:', error);
  }
}

/**
 * Handle failed payment intent
 */
async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
  try {
    const { userId } = paymentIntent.metadata as any;

    if (!userId) {
      console.error('Missing userId in failed payment:', paymentIntent.id);
      return;
    }

    console.log(`❌ Payment failed for user ${userId}. Reason: ${paymentIntent.last_payment_error?.message}`);

    // TODO: Send failure notification email
    // TODO: Log failed transaction

  } catch (error) {
    console.error('Error handling payment failure:', error);
  }
}

/**
 * Handle canceled payment intent
 */
async function handlePaymentIntentCanceled(paymentIntent: Stripe.PaymentIntent) {
  try {
    const { userId } = paymentIntent.metadata as any;

    if (!userId) {
      console.error('Missing userId in canceled payment:', paymentIntent.id);
      return;
    }

    console.log(`⚠️ Payment canceled for user ${userId}.`);

    // TODO: Log canceled transaction

  } catch (error) {
    console.error('Error handling payment cancellation:', error);
  }
}

export default router;
