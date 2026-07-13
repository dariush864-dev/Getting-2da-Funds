const Stripe = require('stripe');

function createStripeClient(secretKey) {
  return new Stripe(secretKey);
}

async function createPaymentIntent(stripe, { amount, currency, metadata, idempotencyKey }) {
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
  if (!webhookSecret) {
    throw new Error('STRIPE_WEBHOOK_SECRET is not configured');
  }
  return stripe.webhooks.constructEvent(payload, signature, webhookSecret);
}

module.exports = {
  createStripeClient,
  createPaymentIntent,
  mapStripeStatus,
  verifyWebhookEvent,
};
