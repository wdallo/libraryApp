const express = require("express");
const {
  getAdminDashboard,
  getUsers,
  updateUser,
  banUser,
  unbanUser,
  adminDeleteUser,
} = require("../controllers/adminController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

const router = express.Router();

// Protected routes (admin only)
router.get("/dashboard", protect, adminOnly, getAdminDashboard);

// User management routes
router.get("/users", protect, adminOnly, getUsers);
router.put("/users/:id", protect, adminOnly, updateUser);
router.put("/users/:id/ban", protect, adminOnly, banUser);
router.put("/users/:id/unban", protect, adminOnly, unbanUser);
router.delete("/users/:id", protect, adminOnly, adminDeleteUser);

module.exports = router;
