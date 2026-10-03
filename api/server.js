require("dotenv").config();
const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const alertRoutes = require("./routes/alertRoutes");
const responderRoutes = require("./routes/responderRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/alerts", alertRoutes);
app.use("/api/responders", responderRoutes);

app.get("/", (req, res) => {
    res.json({
        message: "Emergency Alert API is running"
    });
});

// 404 Not Found handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `Route not found: ${req.method} ${req.originalUrl}`
    });
});

// Centralized error handler
app.use((err, req, res, next) => {
    console.error("Internal Server Error:", err);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || "Internal server error"
    });
});

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
    console.log(`API server running on port ${PORT}`);
});

module.exports = app;