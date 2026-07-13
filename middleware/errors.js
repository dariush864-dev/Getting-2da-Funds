const { sendError } = require('../lib/errors');

function errorHandler(err, req, res, next) {
  console.error(err);
  sendError(res, err);
}

module.exports = { errorHandler };
