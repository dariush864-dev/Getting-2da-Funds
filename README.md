# Payment Gateway

Standalone payment microservice for Stripe checkout. Designed to be called by `sanctuary-core` over HTTP while also serving a local demo checkout page.

## Quick start

1. Copy env template and fill in Stripe test keys:

```bash
cp .env.example .env
```

2. Install and run:

```bash
npm install
npm start
```

3. Open the demo checkout:

```
http://localhost:3000
```

## Environment variables

| Variable | Required | Purpose |
|---|---|---|
| `STRIPE_SECRET_KEY` | yes | Stripe secret key (`sk_test_...`) |
| `STRIPE_PUBLISHABLE_KEY` | yes for demo UI | Stripe publishable key (`pk_test_...`) |
| `PAYMENTS_API_KEY` | yes | Shared secret for sanctuary-core API calls |
| `STRIPE_WEBHOOK_SECRET` | recommended | Verifies Stripe webhook signatures |
| `SANCTUARY_CORE_WEBHOOK_URL` | optional | Where to POST payment status updates |
| `SANCTUARY_CORE_WEBHOOK_SECRET` | optional | Shared secret sent as `x-webhook-secret` |

## API for sanctuary-core

All protected routes require:

```
x-api-key: <PAYMENTS_API_KEY>
```

### Create Stripe payment intent

`POST /api/payments/intents`

```json
{
  "orderId": "ord_123",
  "productId": "course_basic",
  "quantity": 1,
  "customerId": "usr_456"
}
```

Response:

```json
{
  "paymentId": "pay_abc123",
  "provider": "stripe",
  "clientSecret": "pi_..._secret_...",
  "amount": 2500,
  "currency": "usd",
  "status": "pending",
  "orderId": "ord_123"
}
```

Use `clientSecret` with Stripe.js in your frontend.

### Get payment status

`GET /api/payments/:paymentId`

Returns normalized payment status: `pending`, `processing`, `succeeded`, `canceled`.

### Stripe webhooks

`POST /webhooks/stripe`

Configure this URL in the Stripe dashboard. When a payment succeeds, the gateway updates internal status and optionally notifies sanctuary-core.

## Server-side products

Prices are defined in `data/catalog.js`. The browser never sends raw amounts.

- `course_basic` — $25.00
- `course_premium` — $99.00
- `donation` — $10.00

## Test card

Use Stripe test card `4242 4242 4242 4242`, any future expiry, any CVC.

## sanctuary-core integration flow

1. sanctuary-core creates an order.
2. sanctuary-core calls `POST /api/payments/intents`.
3. sanctuary-core frontend confirms payment with Stripe.js using `clientSecret`.
4. Stripe webhook updates payment status in this service.
5. sanctuary-core polls `GET /api/payments/:paymentId` or receives callback at `SANCTUARY_CORE_WEBHOOK_URL`.
