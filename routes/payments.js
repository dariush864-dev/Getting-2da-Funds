const express = require('express');
const { AppError } = require('../lib/errors');
const { requireApiKey } = require('../middleware/auth');
const { resolveAmount } = require('../data/catalog');
const { createPayment, getPayment } = require('../data/payments');
const { createPaymentId } = require('../lib/id');
const { createPaymentIntent } = require('../services/stripeService');

function createPaymentsRouter({ stripe, apiKey }) {
  const router = express.Router();

  router.use(requireApiKey(apiKey));

  router.post('/intents', async (req, res, next) => {
    try {
      const { orderId, productId, quantity = 1, customerId, provider = 'stripe' } = req.body || {};

      if (!orderId || !productId) {
        throw new AppError(400, 'invalid_request', 'orderId and productId are required');
      }

      if (provider !== 'stripe') {
        throw new AppError(400, 'unsupported_provider', 'Only stripe is supported right now');
      }

      const pricing = resolveAmount(productId, quantity);
      if (!pricing) {
        throw new AppError(400, 'unknown_product', `Unknown productId: ${productId}`);
      }

      const paymentId = createPaymentId();
      const idempotencyKey = `intent_${orderId}_${productId}_${pricing.quantity}`;

      const paymentIntent = await createPaymentIntent(stripe, {
        amount: pricing.amount,
        currency: pricing.currency,
        metadata: {
          paymentId,
          orderId,
          productId,
          customerId: customerId || '',
        },
        idempotencyKey,
      });

      const payment = createPayment({
        id: paymentId,
        orderId,
        customerId: customerId || null,
        productId,
        quantity: pricing.quantity,
        amount: pricing.amount,
        currency: pricing.currency,
        provider: 'stripe',
        providerRef: paymentIntent.id,
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      res.status(201).json({
        paymentId: payment.id,
        provider: payment.provider,
        clientSecret: paymentIntent.client_secret,
        amount: payment.amount,
        currency: payment.currency,
        status: payment.status,
        orderId: payment.orderId,
      });
    } catch (error) {
      next(error);
    }
  });

  router.get('/:paymentId', (req, res, next) => {
    try {
      const payment = getPayment(req.params.paymentId);
      if (!payment) {
        throw new AppError(404, 'not_found', 'Payment not found');
      }

      res.json({
        paymentId: payment.id,
        orderId: payment.orderId,
        customerId: payment.customerId,
        productId: payment.productId,
        quantity: payment.quantity,
        amount: payment.amount,
        currency: payment.currency,
        provider: payment.provider,
        providerRef: payment.providerRef,
        status: payment.status,
        createdAt: payment.createdAt,
        updatedAt: payment.updatedAt,
      });
    } catch (error) {
      next(error);
    }
  });

  return router;
}

module.exports = { createPaymentsRouter };
