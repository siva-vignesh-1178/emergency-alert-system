const express = require("express");

const {
  createAlert,
  getMyAlerts,
  getAllAlerts,
  getAlertById,
  acknowledgeAlert,
  resolveAlert,
  cancelAlert
} = require("../controllers/alertController");

const {
  authenticate,
  authorize
} = require("../middleware/authMiddleware");

const {
  alertRateLimiter
} = require("../middleware/rateLimiter");


const router = express.Router();


router.post(
  "/",
  authenticate,
  authorize("STUDENT"),
  alertRateLimiter,
  createAlert
);


router.get(
  "/my",
  authenticate,
  authorize("STUDENT"),
  getMyAlerts
);


router.get(
  "/",
  authenticate,
  authorize("RESPONDER", "ADMIN"),
  getAllAlerts
);


router.get(
  "/:id",
  authenticate,
  getAlertById
);


router.patch(
  "/:id/acknowledge",
  authenticate,
  authorize("RESPONDER", "ADMIN"),
  acknowledgeAlert
);


router.patch(
  "/:id/resolve",
  authenticate,
  authorize("RESPONDER", "ADMIN"),
  resolveAlert
);


router.patch(
  "/:id/cancel",
  authenticate,
  authorize("STUDENT"),
  cancelAlert
);


module.exports = router;