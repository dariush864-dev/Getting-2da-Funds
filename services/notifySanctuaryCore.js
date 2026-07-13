async function notifySanctuaryCore(config, payment) {
  if (!config.sanctuaryCoreWebhookUrl) {
    return;
  }

  const body = JSON.stringify({
    event: 'payment.updated',
    payment: {
      id: payment.id,
      orderId: payment.orderId,
      customerId: payment.customerId,
      productId: payment.productId,
      amount: payment.amount,
      currency: payment.currency,
      provider: payment.provider,
      providerRef: payment.providerRef,
      status: payment.status,
      updatedAt: payment.updatedAt,
    },
  });

  const headers = {
    'Content-Type': 'application/json',
  };

  if (config.sanctuaryCoreWebhookSecret) {
    headers['x-webhook-secret'] = config.sanctuaryCoreWebhookSecret;
  }

  try {
    await fetch(config.sanctuaryCoreWebhookUrl, {
      method: 'POST',
      headers,
      body,
    });
  } catch (error) {
    console.error('Failed to notify sanctuary-core:', error.message);
  }
}

module.exports = { notifySanctuaryCore };
