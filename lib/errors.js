class AppError extends Error {
  constructor(status, code, message) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

function sendError(res, error) {
  const status = error.status || 500;
  const code = error.code || 'internal_error';
  const message = error.message || 'Something went wrong';

  res.status(status).json({
    error: { code, message },
  });
}

module.exports = { AppError, sendError };
