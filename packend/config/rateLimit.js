import rateLimit from 'express-rate-limit';

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV?.trim() === 'development' ? Infinity : 5,
  message: 'Too many requests, try again later',
});
export default authLimiter;
