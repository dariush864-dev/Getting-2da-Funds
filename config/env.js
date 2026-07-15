require('dotenv').config();

// We updated the required key to X_API_KEY
const required = ['STRIPE_SECRET_KEY', 'X_API_KEY'];

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
    // Point this to X_API_KEY
    paymentsApiKey: process.env.X_API_KEY, 
    sanctuaryCoreWebhookUrl: process.env.SANCTUARY_CORE_WEBHOOK_URL || '',
    sanctuaryCoreWebhookSecret: process.env.SANCTUARY_CORE_WEBHOOK_SECRET || '',
  };
}

module.exports = { loadEnv };
