const { AppError } = require('../lib/errors');

function requireApiKey(req, res, next) {
  const apiKey = req.get('x-api-key');

  console.log('Received API key:', apiKey);
  console.log('Expected API key:', process.env.X_API_KEY);

  if (!apiKey || apiKey !== process.env.X_API_KEY) {
    return next(
      new AppError(
        401,
        'unauthorized',
        'Invalid or missing x-api-key header'
      )
    );
  }

  next();
}

module.exports = requireApiKey;
