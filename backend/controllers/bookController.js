const asyncHandler = require("express-async-handler");
const Book = require("../models/Book");
const BookCategory = require("../models/BookCategory");

const fs = require("fs");
const path = require("path");

const getBooks = asyncHandler(async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build query
    let query = {};

    if (req.query.search) {
      query.title = { $regex: req.query.search, $options: "i" };
    }

    if (req.query.author) {
      query.author = req.query.author;
    }

    if (req.query.category) {
      // Handle category search by name or ID
      if (mongoose.Types.ObjectId.isValid(req.query.category)) {
        query.category = { $in: [req.query.category] };
      } else {
        // Find category by name first
        const category = await BookCategory.findOne({
          name: { $regex: req.query.category, $options: "i" },
        });
        if (category) {
          query.category = { $in: [category._id] };
        }
      }
    }

    console.log("getBooks - MongoDB query:", query);

    // Get books with proper population
    const books = await Book.find(query)
      .populate("author", "firstname lastname")
      .populate("category", "name")
      .populate("createdBy", "username")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalBooks = await Book.countDocuments(query);
    const totalPages = Math.ceil(totalBooks / limit);

    console.log("getBooks - Found books:", books.length);

    res.status(200).json({
      books,
      totalBooks,
      totalPages,
      currentPage: page,
      message:
        books.length > 0 ? "Books retrieved successfully" : "No books found",
    });
  } catch (error) {
    console.error("getBooks - Error:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

/**
 * Update Book (admin only)
 */
const updateBook = asyncHandler(async (req, res) => {
  const { title, description, category, time } = req.body;
  let picture = null;
  if (req.file) {
    picture = `/uploads/books/${req.file.filename}`;
  }

  const book = await Book.findById(req.params.id);
  if (!book) {
    res.status(404);
    throw new Error("Book was not found");
  }
  // Only admin can update
  if (req.user.role !== "admin") {
    res.status(403);
    throw new Error("Not authorized to update this book");
  }
  if (title) book.title = title;
  if (description) book.description = description;
  if (category) book.category = category;
  if (time) book.time = time;
  if (picture) book.picture = picture;
  // Allow admin to set approved status (accept boolean or string)
  if (typeof approved !== "undefined") {
    // Accept boolean, "approved", "pending", "true", "false"
    if (typeof approved === "boolean") {
      book.approved = approved;
    } else if (typeof approved === "string") {
      if (approved === "approved" || approved === "true") {
        book.approved = true;
      } else if (approved === "pending" || approved === "false") {
        book.approved = false;
      }
    } else {
      // fallback: treat anything else as false
      book.approved = false;
    }
  }

  await book.save();
  // Populate category with name for response
  await book.populate("category", "name");
  res.json({ message: "Book updated", book });
});

const deleteBook = asyncHandler(async (req, res) => {
  const book = await Book.findById(req.params.id);
  if (!book) {
    res.status(404);
    throw new Error("book not found");
  }
  // Only admin can delete
  if (req.user.role !== "admin") {
    res.status(403);
    throw new Error("Not authorized to delete this book");
  }

  // Delete photo file if exists
  if (book.picture) {
    // Remove leading slash if present from /uploads/books
    const pictureRelativePath = book.picture.startsWith("/")
      ? book.picture.slice(1)
      : book.picture;
    const picturePath = path.join(__dirname, "..", pictureRelativePath);
    fs.unlink(picturePath, (err) => {
      if (err) {
        console.error("Failed to delete picture:", err);
      }
    });
  }

  await book.deleteOne();
  res.json({ message: "book and photo deleted" });
});

/**
 * Get a single Book by ID (public)
 */
const getBookById = asyncHandler(async (req, res) => {
  const book = await Book.findOne({ _id: req.params.id })
    .populate("category", "name")
    .populate("createdBy", "userName email"); // <-- populate creator
  if (!book) {
    return res.status(404).json({ message: "Book was not found" });
  }
  res.json(book);
});

// Admin: create book
const createBook = asyncHandler(async (req, res) => {
  const { title, author, description, category, releaseYear } = req.body;

  if (!title || !author) {
    res.status(400);
    throw new Error("Title and author are required");
  }

  if (!category) {
    res.status(400);
    throw new Error("Category is required");
  }

  // Only admin can create books
  if (req.user.role !== "admin") {
    res.status(403);
    throw new Error("Not authorized to create books");
  }

  let picture = null;
  if (req.file) {
    picture = `/uploads/books/${req.file.filename}`;
  }

  const book = new Book({
    title,
    author, // Author ObjectId from frontend dropdown
    description,
    category: [category], // Convert single category to array
    releaseYear,
    picture,
    createdBy: req.user._id,
  });

  const createdBook = await book.save();
  console.log("Book created successfully:", createdBook);
  res.status(201).json(createdBook);
});

module.exports = {
  getBooks,
  updateBook,
  deleteBook,
  getBookById,
  createBook,
};
