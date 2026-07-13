const payments = new Map();

function createPayment(record) {
  payments.set(record.id, record);
  return record;
}

function getPayment(paymentId) {
  return payments.get(paymentId) || null;
}

function updatePayment(paymentId, updates) {
  const existing = payments.get(paymentId);
  if (!existing) {
    return null;
  }

  const updated = {
    ...existing,
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  payments.set(paymentId, updated);
  return updated;
}

function findByProviderRef(provider, providerRef) {
  for (const payment of payments.values()) {
    if (payment.provider === provider && payment.providerRef === providerRef) {
      return payment;
    }
  }
  return null;
}

module.exports = {
  createPayment,
  getPayment,
  updatePayment,
  findByProviderRef,
};
