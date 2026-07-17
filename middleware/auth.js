const { AppError } = require('../lib/errors');

function requireApiKey(expectedApiKey) {
  return function(req, res, next) {
    const apiKey = req.get('x-api-key');

    // SECURITY PATCH: Do not log the actual key in production logs
    if (!apiKey || apiKey !== expectedApiKey) {
      console.warn('Unauthorized access attempt: Invalid API key provided');
      return next(
        new AppError(401, 'unauthorized', 'Invalid or missing x-api-key header')
      );
    }
    next();
  };
}

module.exports = requireApiKey;
