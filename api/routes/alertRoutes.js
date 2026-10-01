const express = require("express");

const {
    createAlert,
    getAlerts,
    updateAlertStatus
} = require("../controllers/alertController");

const router = express.Router();

router.post("/", createAlert);

router.get("/", getAlerts);

router.put("/:id", updateAlertStatus);

module.exports = router;