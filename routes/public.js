const express = require('express');
const { AppError } = require('../lib/errors');
const { resolveAmount } = require('../data/catalog');
const { createPayment } = require('../data/payments');
const { createPaymentId } = require('../lib/id');
const { createPaymentIntent } = require('../services/stripeService');

function createPublicRouter({ stripe, publishableKey }) {
  const router = express.Router();

  router.get('/config', (req, res) => {
    res.json({
      stripePublishableKey: publishableKey || null,
      products: ['course_basic', 'course_premium', 'donation'],
    });
  });

  router.post('/checkout/stripe', async (req, res, next) => {
    try {
      const { productId, quantity = 1 } = req.body || {};

      if (!productId) {
        throw new AppError(400, 'invalid_request', 'productId is required');
      }

      const pricing = resolveAmount(productId, quantity);
      if (!pricing) {
        throw new AppError(400, 'unknown_product', `Unknown productId: ${productId}`);
      }

      const paymentId = createPaymentId();
      const orderId = `demo_${paymentId}`;

      const paymentIntent = await createPaymentIntent(stripe, {
        amount: pricing.amount,
        currency: pricing.currency,
        metadata: {
          paymentId,
          orderId,
          productId,
          source: 'demo_checkout',
        },
        idempotencyKey: `demo_${paymentId}`,
      });

      createPayment({
        id: paymentId,
        orderId,
        customerId: null,
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
        paymentId,
        clientSecret: paymentIntent.client_secret,
        amount: pricing.amount,
        currency: pricing.currency,
        productName: pricing.product.name,
      });
    } catch (error) {
      next(error);
    }
  });

  return router;
}

module.exports = { createPublicRouter };
