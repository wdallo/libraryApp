const express = require("express");
const multer = require("multer");
const path = require("path");
const {
  getBooks,
  updateBook,
  deleteBook,
  getBookById,
  createBook,
} = require("../controllers/bookController");
const { protect, adminOnly } = require("../middleware/authMiddleware");
const { validateBook } = require("../middleware/validation");

const router = express.Router();

// Configure multer for book cover uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/books/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "book-" + uniqueSuffix + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  // Accept only image files
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed"), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

// Public routes
router.get("/", getBooks);
router.get("/:id", getBookById);
// Protected routes (admin only)
router.post(
  "/",
  protect,
  adminOnly,
  upload.single("picture"),
  validateBook,
  createBook
);
router.put(
  "/:id",
  protect,
  adminOnly,
  upload.single("picture"),
  validateBook,
  updateBook
);
router.delete("/:id", protect, adminOnly, deleteBook);

module.exports = router;
