const express = require('express');
const { AppError } = require('../lib/errors');

const { resolveAmount } = require('../data/catalog');
const { createPayment, getPayment } = require('../data/payments');
const { createPaymentId } = require('../lib/id');
const { createPaymentIntent } = require('../services/stripeService');

function createPaymentsRouter({ stripe, apiKey }) {
  const router = express.Router();

  router.post('/intents', async (req, res, next) => {
    try {
      // Look for customAmount coming from the frontend
      const { orderId, productId, quantity = 1, customerId, customAmount, provider = 'stripe' } = req.body || {};

      if (!orderId || !productId) {
        throw new AppError(400, 'invalid_request', 'orderId and productId are required');
      }

      // Pass the customAmount securely into our catalog check
      const pricing = resolveAmount(productId, quantity, customAmount);
      if (!pricing) {
        throw new AppError(400, 'invalid_pricing', 'Invalid product or custom donation amount is too low.');
      }

      const paymentId = createPaymentId();
      const idempotencyKey = `intent_${orderId}_${productId}_${pricing.quantity}`;

      const paymentIntent = await createPaymentIntent(stripe, {
        amount: pricing.amount,
        currency: pricing.currency,
        metadata: { paymentId, orderId, productId, customerId: customerId || '' },
        idempotencyKey,
      });

      const payment = createPayment({
        id: paymentId, orderId, customerId: customerId || null, productId,
        quantity: pricing.quantity, amount: pricing.amount, currency: pricing.currency,
        provider: 'stripe', providerRef: paymentIntent.id, status: 'pending',
        createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
      });

      res.status(201).json({
        paymentId: payment.id, provider: payment.provider, clientSecret: paymentIntent.client_secret,
        amount: payment.amount, currency: payment.currency, status: payment.status, orderId: payment.orderId,
      });
    } catch (error) {
      next(error);
    }
  });

  router.get('/:paymentId', (req, res, next) => {
    try {
      const payment = getPayment(req.params.paymentId);
      if (!payment) throw new AppError(404, 'not_found', 'Payment not found');
      res.json(payment);
    } catch (error) { next(error); }
  });

  return router;
}
module.exports = { createPaymentsRouter };
