const Stripe = require('stripe');

function createStripeClient(secretKey) {
  if (!secretKey) throw new Error('STRIPE_SECRET_KEY is missing');

  // DEBUG: Log the first 4 characters to verify key presence (do not log the whole 
key!)
  console.log('Stripe client initializing with key starting with:', 
secretKey.substring(0, 4));

  return new Stripe(secretKey, {
    apiVersion: '2025-02-24',
  });
}
// ... rest of file
