const { randomUUID } = require('crypto');

function createPaymentId() {
  return `pay_${randomUUID().replace(/-/g, '').slice(0, 16)}`;
}

module.exports = { createPaymentId };
