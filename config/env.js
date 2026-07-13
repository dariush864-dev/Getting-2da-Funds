require('dotenv').config();

const required = ['STRIPE_SECRET_KEY', 'PAYMENTS_API_KEY'];

function loadEnv() {
  const missing = required.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  return {
    port: Number(process.env.PORT) || 3000,
    stripeSecretKey: process.env.STRIPE_SECRET_KEY,
    stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
    stripePublishableKey: process.env.STRIPE_PUBLISHABLE_KEY || '',
    paymentsApiKey: process.env.PAYMENTS_API_KEY,
    sanctuaryCoreWebhookUrl: process.env.SANCTUARY_CORE_WEBHOOK_URL || '',
    sanctuaryCoreWebhookSecret: process.env.SANCTUARY_CORE_WEBHOOK_SECRET || '',
  };
}

module.exports = { loadEnv };
