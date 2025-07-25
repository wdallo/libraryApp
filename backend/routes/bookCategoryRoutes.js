const express = require("express");
const {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} = require("../controllers/bookCategorysController");
const { protect, adminOnly } = require("../middleware/authMiddleware");
const { validateCategory } = require("../middleware/validation");

const router = express.Router();

// Public routes
router.get("/", getAllCategories);
router.get("/:id", getCategoryById);

// Protected routes (admin only)
router.post("/", protect, adminOnly, validateCategory, createCategory);
router.put("/:id", protect, adminOnly, validateCategory, updateCategory);
router.delete("/:id", protect, adminOnly, deleteCategory);

module.exports = router;
