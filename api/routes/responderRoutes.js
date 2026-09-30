const express = require("express");

const {
    createResponder,
    getResponders,
    updateResponderStatus
} = require("../controllers/responderController");

const router = express.Router();

// Register responder
router.post("/", createResponder);

// Get all responders
router.get("/", getResponders);

// Update responder status
router.put("/:id", updateResponderStatus);

module.exports = router;