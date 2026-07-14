const catalog = {
  course_basic: { id: 'course_basic', name: 'Basic Course', amount: 6500, currency: 'usd', type: 'fixed' },
  course_premium: { id: 'course_premium', name: 'Premium Course', amount: 11100, currency: 'usd', type: 'fixed' },
  couples_reading: { id: 'couples_reading', name: 'Couples Reading', amount: 22200, currency: 'usd', type: 'fixed' },
  
  // Notice the type is 'variable' and we set a 100 cent ($1.00) minimum so hackers can't charge pennies and cost you Stripe fees!
  donation: { id: 'donation', name: 'Donation', currency: 'usd', type: 'variable', minAmount: 100 } 
};

function resolveAmount(productId, quantity = 1, customAmount = null) {
  const product = catalog[productId];
  if (!product) return null;
  
  let finalAmount;

  if (product.type === 'fixed') {
    // SECURITY LOCK: If the item is fixed, completely ignore the frontend's custom amount.
    finalAmount = product.amount * quantity;
  } else if (product.type === 'variable') {
    // If it's a donation, verify the amount is valid and above the minimum
    if (!customAmount || isNaN(customAmount) || customAmount < product.minAmount) {
       return null; // This tells the server to reject the request
    }
    finalAmount = Math.round(customAmount);
  }

  return {
    amount: finalAmount,
    currency: product.currency,
    quantity: quantity
  };
}

module.exports = { catalog, resolveAmount };
