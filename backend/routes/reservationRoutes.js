const express = require("express");
const {
  reserveBook,
  getUserReservations,
  extendReservation,
  requestBookReturn,
  approveBookReturn,
  returnBook,
  getAllReservations,
  approveReservation,
  rejectReservation,
  getPendingReservations,
} = require("../controllers/reservationController");
const { protect, adminOnly } = require("../middleware/authMiddleware");
const { validateReservation } = require("../middleware/validation");

const router = express.Router();

// User routes
router.post("/", protect, validateReservation, reserveBook);
router.get("/", protect, getUserReservations);
router.put("/:id/extend", protect, extendReservation);
router.put("/:id/return", protect, requestBookReturn);

// Admin routes
router.get("/admin", protect, adminOnly, getAllReservations);
router.get("/pending", protect, adminOnly, getPendingReservations);
router.put("/:id/approve", protect, adminOnly, approveReservation);
router.put("/:id/reject", protect, adminOnly, rejectReservation);
router.put("/:id/approve-return", protect, adminOnly, approveBookReturn);

module.exports = router;
