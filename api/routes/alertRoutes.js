const express = require("express");

const {
    createAlert,
    getAlerts,
    getAlertById,
    updateAlertStatus
} = require("../controllers/alertController");

const router = express.Router();

router.post("/", createAlert);

router.get("/", getAlerts);

router.get("/:id", getAlertById);

router.put("/:id", updateAlertStatus);

module.exports = router;