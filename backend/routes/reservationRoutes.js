const express = require("express");
const {
  reserveBook,
  getUserReservations,
  extendReservation,
  requestBookReturn,
  approveBookReturn,
  returnBook,
  getAllReservations,
} = require("../controllers/reservationController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

const router = express.Router();

// User routes
router.post("/", protect, reserveBook);
router.get("/", protect, getUserReservations);
router.put("/:id/extend", protect, extendReservation);
router.put("/:id/return", protect, requestBookReturn);

// Admin routes
router.get("/admin", protect, adminOnly, getAllReservations);
router.put("/:id/approve-return", protect, adminOnly, approveBookReturn);

module.exports = router;
