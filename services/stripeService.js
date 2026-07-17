const Stripe = require('stripe');

function createStripeClient(secretKey) {
  if (!secretKey) throw new Error('STRIPE_SECRET_KEY is missing');
  return new Stripe(secretKey, {
    apiVersion: '2025-02-24',
  });
}

async function createPaymentIntent(stripe, { amount, currency, metadata, 
idempotencyKey }) {
  return stripe.paymentIntents.create(
    {
      amount,
      currency,
      automatic_payment_methods: { enabled: true },
      metadata,
    },
    idempotencyKey ? { idempotencyKey } : undefined
  );
}

function mapStripeStatus(stripeStatus) {
  const map = {
    requires_payment_method: 'pending',
    requires_confirmation: 'pending',
    requires_action: 'pending',
    processing: 'processing',
    requires_capture: 'processing',
    canceled: 'canceled',
    succeeded: 'succeeded',
  };
  return map[stripeStatus] || 'pending';
}

function verifyWebhookEvent(stripe, payload, signature, webhookSecret) {
  return stripe.webhooks.constructEvent(payload, signature, webhookSecret);
}

module.exports = {
  createStripeClient,
  createPaymentIntent,
  mapStripeStatus,
  verifyWebhookEvent,
};
