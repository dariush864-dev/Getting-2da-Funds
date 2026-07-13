const express = require('express');
const { findByProviderRef, getPayment, updatePayment } = require('../data/payments');
const { mapStripeStatus, verifyWebhookEvent } = require('../services/stripeService');
const { notifySanctuaryCore } = require('../services/notifySanctuaryCore');

function createWebhooksRouter({ stripe, config }) {
  const router = express.Router();

  router.post('/stripe', express.raw({ type: 'application/json' }), async (req, res) => {
    const signature = req.get('stripe-signature');

    if (!signature) {
      return res.status(400).send('Missing stripe-signature header');
    }

    if (!config.stripeWebhookSecret) {
      console.warn('Stripe webhook received but STRIPE_WEBHOOK_SECRET is not set');
      return res.status(503).send('Webhook secret not configured');
    }

    let event;
    try {
      event = verifyWebhookEvent(stripe, req.body, signature, config.stripeWebhookSecret);
    } catch (error) {
      console.error('Stripe webhook verification failed:', error.message);
      return res.status(400).send(`Webhook Error: ${error.message}`);
    }

    try {
      if (event.type === 'payment_intent.succeeded' || event.type === 'payment_intent.payment_failed') {
        const paymentIntent = event.data.object;
        const payment =
          findByProviderRef('stripe', paymentIntent.id) ||
          (paymentIntent.metadata?.paymentId
            ? getPayment(paymentIntent.metadata.paymentId)
            : null);

        if (payment) {
          const status =
            event.type === 'payment_intent.succeeded'
              ? 'succeeded'
              : mapStripeStatus(paymentIntent.status);

          const updated = updatePayment(payment.id, { status });
          await notifySanctuaryCore(config, updated);
        }
      }
    } catch (error) {
      console.error('Stripe webhook handler failed:', error.message);
      return res.status(500).send('Webhook handler failed');
    }

    res.json({ received: true });
  });

  return router;
}

module.exports = { createWebhooksRouter };
