const express = require('express');
const path = require('path');
const { loadEnv } = require('./config/env');
const { createStripeClient } = require('./services/stripeService');
const { createPaymentsRouter } = require('./routes/payments');
const { createPublicRouter } = require('./routes/public');
const { createWebhooksRouter } = require('./routes/webhooks');
const { errorHandler } = require('./middleware/errors');

const config = loadEnv();
const stripe = createStripeClient(config.stripeSecretKey);
const app = express();

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'payment-gateway' });
});

app.use('/webhooks', createWebhooksRouter({ stripe, config }));

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/payments', createPaymentsRouter({ stripe, apiKey: config.paymentsApiKey }));
app.use(
  '/api/public',
  createPublicRouter({ stripe, publishableKey: config.stripePublishableKey })
);

app.use(errorHandler);

app.listen(config.port, () => {
  console.log(`Payment gateway running on http://localhost:${config.port}`);
  console.log(`Health check: http://localhost:${config.port}/health`);
  console.log(`Demo checkout: http://localhost:${config.port}/`);
});
