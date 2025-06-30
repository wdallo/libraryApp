const express = require("express");
const multer = require("multer");
const path = require("path");
const {
  getAuthors,
  getAuthorById,
  createAuthor,
  updateAuthor,
  deleteAuthor,
} = require("../controllers/authorController");
const { protect, adminOnly } = require("../middleware/authMiddleware");
const { validateAuthor } = require("../middleware/validation");

const router = express.Router();

// Configure multer for author picture uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/authors/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "author-" + uniqueSuffix + path.extname(file.originalname));
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
router.get("/", getAuthors);
router.get("/:id", getAuthorById);

// Protected routes (admin only)
router.post(
  "/",
  protect,
  adminOnly,
  upload.single("picture"),
  validateAuthor,
  createAuthor
);
router.put(
  "/:id",
  protect,
  adminOnly,
  upload.single("picture"),
  validateAuthor,
  updateAuthor
);
router.delete("/:id", protect, adminOnly, deleteAuthor);

module.exports = router;
