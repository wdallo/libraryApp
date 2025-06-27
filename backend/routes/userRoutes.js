const express = require("express");
const {
  registerUser,
  loginUser,
  getAllUsers,
  updateUser,
  deleteUser,
} = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// Public routes
router.post("/register", registerUser);
router.post("/login", loginUser);

// Protected routes
router.get("/", protect, getAllUsers); // Admin can get all users
router.put("/:id", protect, updateUser); // Users can update their own profile, admin can update any
router.delete("/:id", protect, deleteUser); // Users can delete their own account, admin can delete any

module.exports = router;
