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

const PORT = 5001;

app.listen(PORT, () => {
    console.log(`API server running on port ${PORT}`);
});