const express = require('express');
const path = require('path');
const helmet = require('helmet');
const cors = require('cors');
const requireApiKey = require('./middleware/auth');
const { loadEnv } = require('./config/env');
const { createStripeClient } = require('./services/stripeService');
const { createPaymentsRouter } = require('./routes/payments');
const { createPublicRouter } = require('./routes/public');
const { createWebhooksRouter } = require('./routes/webhooks');
const { errorHandler } = require('./middleware/errors');

const config = loadEnv();
const stripe = createStripeClient(config.stripeSecretKey);
const app = express();

// Security Middleware
app.use(helmet()); 
app.use(cors()); 

// Webhooks must be parsed as raw buffers before express.json()
app.use('/webhooks', createWebhooksRouter({ stripe, config }));

// Standard JSON parsing for other routes
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'payment-gateway' });
});

app.use('/api/payments', requireApiKey(config.paymentsApiKey), createPaymentsRouter({ 
stripe }));
app.use(
  '/api/public',
  createPublicRouter({ stripe, publishableKey: config.stripePublishableKey })
);

app.use(errorHandler);

// VERCEL SERVERLESS FIX: Only listen on a port if NOT in production
if (process.env.NODE_ENV !== 'production') {
  app.listen(config.port, () => {
    console.log(`Payment gateway running locally on port ${config.port}`);
  });
}

// Export the app for Vercel's serverless functions
module.exports = app;
