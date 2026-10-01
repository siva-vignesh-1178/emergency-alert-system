const express = require("express");

const {
  register,
  login,
  getProfile
} = require("../controllers/authController");

const {
  authenticate
} = require("../middleware/authMiddleware");

const {
  authRateLimiter
} = require("../middleware/rateLimiter");


const router = express.Router();


router.post(
  "/register",
  authRateLimiter,
  register
);


router.post(
  "/login",
  authRateLimiter,
  login
);


router.get(
  "/profile",
  authenticate,
  getProfile
);


module.exports = router;