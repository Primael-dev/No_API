export function errorHandler(err, req, res, next) {
  console.error('[ERROR]', err);

  const isDevelopment = process.env.NODE_ENV === 'development';
  const message = isDevelopment ? err.message : 'Internal server error';
  const statusCode = err.statusCode || 500;

  res.status(statusCode).json({
    error: message,
    ...(isDevelopment && { stack: err.stack })
  });
}