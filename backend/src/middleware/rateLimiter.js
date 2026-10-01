const rateLimit = require("express-rate-limit");

const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,

  message: {
    success: false,
    message: "Too many authentication attempts"
  },

  standardHeaders: true,
  legacyHeaders: false
});


const alertRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 5,

  message: {
    success: false,
    message: "Too many alert requests"
  },

  standardHeaders: true,
  legacyHeaders: false
});


module.exports = {
  authRateLimiter,
  alertRateLimiter
};