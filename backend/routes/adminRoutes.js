const express = require("express");
const {
  getAdminDashboard,
  adminDeleteUser,
} = require("../controllers/adminController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

const router = express.Router();

// Protected routes (admin only)
router.get("/dashboard", protect, adminOnly, getAdminDashboard);
router.delete("/users/:id", protect, adminOnly, adminDeleteUser);

module.exports = router;
