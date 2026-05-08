function notFoundHandler(req, res) {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.originalUrl} not found`,
  });
}

function errorHandler(err, _req, res, _next) {
  const status = err.status || 500;
  const message = err.message || 'Internal server error';

  res.status(status).json({
    error: status >= 500 ? 'Internal Server Error' : 'Request Error',
    message,
    ...(process.env.NODE_ENV !== 'production' ? { details: err.details || null } : {}),
  });
}

module.exports = {
  notFoundHandler,
  errorHandler,
};
