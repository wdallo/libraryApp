const express = require("express");
const {
  registerUser,
  loginUser,
  getAllUsers,
  updateUser,
  deleteUser,
} = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware");
const {
  validateUserRegistration,
  validateUserLogin,
  validateUserUpdate,
} = require("../middleware/validation");

const router = express.Router();

// Public routes
router.post("/register", validateUserRegistration, registerUser);
router.post("/login", validateUserLogin, loginUser);

// Protected routes
router.get("/", protect, getAllUsers); // Admin can get all users
router.put("/:id", protect, validateUserUpdate, updateUser); // Users can update their own profile, admin can update any
router.delete("/:id", protect, deleteUser); // Users can delete their own account, admin can delete any

module.exports = router;
