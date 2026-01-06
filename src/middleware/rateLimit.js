const requestCounts = new Map();

export function rateLimitMiddleware(req, res, next) {
  const ip = req.headers['x-forwarded-for'] || req.ip;
  const now = Date.now();
  const windowMs = parseInt(process.env.RATE_LIMIT_WINDOW_MS || 900000);
  const maxRequests = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || 100);

  const key = ip;
  const record = requestCounts.get(key) || { count: 0, resetTime: now + windowMs };

  if (now > record.resetTime) {
    record.count = 1;
    record.resetTime = now + windowMs;
  } else {
    record.count++;
  }

  requestCounts.set(key, record);

  if (record.count > maxRequests) {
    return res.status(429).json({ error: 'Too many requests' });
  }

  res.setHeader('X-RateLimit-Limit', maxRequests);
  res.setHeader('X-RateLimit-Remaining', Math.max(0, maxRequests - record.count));
  res.setHeader('X-RateLimit-Reset', record.resetTime);

  next();
}