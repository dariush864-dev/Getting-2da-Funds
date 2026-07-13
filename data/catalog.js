const PRODUCTS = {
  course_basic: {
    name: 'Basic Course',
    amount: 2500,
    currency: 'usd',
  },
  course_premium: {
    name: 'Premium Course',
    amount: 9900,
    currency: 'usd',
  },
  donation: {
    name: 'Donation',
    amount: 1000,
    currency: 'usd',
  },
};

function getProduct(productId) {
  return PRODUCTS[productId] || null;
}

function resolveAmount(productId, quantity = 1) {
  const product = getProduct(productId);
  if (!product) {
    return null;
  }

  const qty = Math.max(1, Math.min(Number(quantity) || 1, 99));
  return {
    product,
    amount: product.amount * qty,
    currency: product.currency,
    quantity: qty,
  };
}

module.exports = { getProduct, resolveAmount, PRODUCTS };
