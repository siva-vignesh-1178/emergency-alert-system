const express = require("express");

const {
    register,
    login,
    getMe
} = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Test route
router.get("/test", (req, res) => {
    res.json({
        message: "Authentication API is working"
    });
});

// Register
router.post("/register", register);

// Login
router.post("/login", login);

// Get current user profile (Protected)
router.get("/me", authMiddleware, getMe);

module.exports = router;