const express = require("express");

const {
  createResponder,
  getResponders,
  updateAvailability
} = require("../controllers/responderController");

const {
  authenticate,
  authorize
} = require("../middleware/authMiddleware");


const router = express.Router();


router.post(
  "/",
  authenticate,
  authorize("ADMIN"),
  createResponder
);


router.get(
  "/",
  authenticate,
  authorize("ADMIN", "RESPONDER"),
  getResponders
);


router.patch(
  "/availability",
  authenticate,
  authorize("RESPONDER"),
  updateAvailability
);


module.exports = router;