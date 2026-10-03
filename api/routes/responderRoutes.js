const express = require("express");

const {
    createResponder,
    getResponders,
    getResponderById,
    updateResponderStatus
} = require("../controllers/responderController");

const router = express.Router();

// Register responder
router.post("/", createResponder);

// Get all responders
router.get("/", getResponders);

// Get single responder by ID
router.get("/:id", getResponderById);

// Update responder status
router.put("/:id", updateResponderStatus);

module.exports = router;