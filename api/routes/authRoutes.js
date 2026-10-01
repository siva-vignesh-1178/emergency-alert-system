const express = require("express");

const {
    register,
    login
} = require("../controllers/authController");

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

module.exports = router;