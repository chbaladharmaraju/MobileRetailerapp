const errorHandler = (err, req, res, next) => {
  console.error('Error:', err.message);
  console.error('Stack:', err.stack);

  // Multer errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ message: 'File size exceeds 5MB limit.' });
  }

  if (err.name === 'MulterError') {
    return res.status(400).json({ message: err.message });
  }

  // Prisma errors
  if (err.code === 'P2002') {
    const field = err.meta?.target?.[0] || 'field';
    return res.status(409).json({ message: `A record with this ${field} already exists.` });
  }

  if (err.code === 'P2025') {
    return res.status(404).json({ message: 'Record not found.' });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ message: 'Invalid token.' });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ message: 'Token expired.' });
  }

  // Default
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    message: err.message || 'Internal server error.',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = errorHandler;
