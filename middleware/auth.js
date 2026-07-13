const { AppError } = require('../lib/errors');

function requireApiKey(expectedKey) {
  return (req, res, next) => {
    const apiKey = req.get('x-api-key');
    if (!apiKey || apiKey !== expectedKey) {
      return next(new AppError(401, 'unauthorized', 'Invalid or missing x-api-key header'));
    }
    next();
  };
}

module.exports = { requireApiKey };
