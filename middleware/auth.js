const { AppError } = require('../lib/errors');

function requireApiKey(req, res, next) {
    const apiKey = req.get('x-api-key');
    // It will look for X_API_KEY in your Vercel settings automatically
    if (!apiKey || apiKey !== process.env.X_API_KEY) {
      return next(new AppError(401, 'unauthorized', 'Invalid or missing 
x-api-key header'));
    }
    next();
}

module.exports = requireApiKey;
