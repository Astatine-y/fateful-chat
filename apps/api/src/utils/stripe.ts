// apps/api/src/utils/stripe.ts
import Stripe from 'stripe';
import { config } from '../config';

if (!config.stripe.secretKey) {
  throw new Error('STRIPE_SECRET_KEY is not configured');
}

const stripe = new Stripe(config.stripe.secretKey as string, {
  apiVersion: '2023-08-16',
});

export interface PaymentIntentMetadata {
  userId?: string;
  creditsToAdd?: string;
  [key: string]: string | undefined;
}

export async function createPaymentIntent(
  amount: number,
  metadata?: PaymentIntentMetadata
) {
  try {
    // Amount should be in cents
    const amountInCents = Math.round(amount * 100);

    const metadataPayload: Stripe.MetadataParam = {};
  if (metadata?.userId) metadataPayload.userId = metadata.userId;
  if (metadata?.creditsToAdd) metadataPayload.creditsToAdd = metadata.creditsToAdd;

  const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: 'usd',
      payment_method_types: ['card'],
      metadata: metadataPayload,
    });

    return paymentIntent;
  } catch (error) {
    console.error('Stripe API error:', error);
    throw new Error('Failed to create payment intent');
  }
}

export async function retrievePaymentIntent(paymentIntentId: string) {
  try {
    return await stripe.paymentIntents.retrieve(paymentIntentId);
  } catch (error) {
    console.error('Stripe retrieval error:', error);
    throw new Error('Failed to retrieve payment intent');
  }
}

export default stripe;