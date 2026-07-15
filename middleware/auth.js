const { AppError } = require('../lib/errors');

function requireApiKey(expectedApiKey) {
  return function(req, res, next) {
    const apiKey = req.get('x-api-key');

    console.log('Received API key:', apiKey);
    console.log('Expected API key:', expectedApiKey);

    if (!apiKey || apiKey !== expectedApiKey) {
      return next(
        new AppError(
          401,
          'unauthorized',
          'Invalid or missing x-api-key header'
        )
      );
    }

    next();
  };
}

module.exports = requireApiKey;
