const asyncHandler = require("express-async-handler");
const mongoose = require("mongoose");
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
      .populate("author", "firstName lastName")
      .populate("category", "name")
      .populate("createdBy", "firstName")
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
  try {
    console.log("📖 updateBook - Received data:", {
      id: req.params.id,
      body: req.body,
    });

    const book = await Book.findById(req.params.id);

    if (!book) {
      console.log("❌ updateBook - Book not found:", req.params.id);
      res.status(404);
      throw new Error("Book not found");
    }

    console.log("📖 updateBook - Found book:", book.title);

    const {
      title,
      author,
      category,
      description,
      pages,
      language,
      publishedDate,
      totalQuantity,
      availableQuantity,
    } = req.body;

    // Update book fields
    book.title = title || book.title;
    book.author = author || book.author;
    book.category = category || book.category;
    book.description = description || book.description;
    book.pages = pages || book.pages;
    book.language = language || book.language;
    book.publishedDate = publishedDate || book.publishedDate;
    book.totalQuantity =
      totalQuantity !== undefined
        ? parseInt(totalQuantity)
        : book.totalQuantity;
    book.availableQuantity =
      availableQuantity !== undefined
        ? parseInt(availableQuantity)
        : book.availableQuantity;

    console.log("📖 updateBook - About to save book with data:", {
      title: book.title,
      author: book.author,
      category: book.category,
      totalQuantity: book.totalQuantity,
      availableQuantity: book.availableQuantity,
    });

    const updatedBook = await book.save();
    console.log("✅ updateBook - Book saved successfully");

    await updatedBook.populate("category", "name");
    console.log("✅ updateBook - Book populated successfully");

    res.json(updatedBook);
  } catch (error) {
    console.error("❌ updateBook - Error:", error.message);
    console.error("❌ updateBook - Stack:", error.stack);
    res.status(500);
    throw new Error(`Error updating book: ${error.message}`);
  }
});

const deleteBook = asyncHandler(async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);

    if (!book) {
      res.status(404);
      throw new Error("Book not found");
    }

    // Check if book has active reservations
    const Reservation = require("../models/Reservation");
    const activeReservations = await Reservation.countDocuments({
      book: book._id,
      status: { $in: ["pending", "active"] },
    });

    if (activeReservations > 0) {
      res.status(400);
      throw new Error("Cannot delete book with active reservations");
    }

    // Delete the book file if it exists
    if (book.picture) {
      const imagePath = path.join(
        __dirname,
        "..",
        "uploads",
        "books",
        book.picture
      );
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    await book.deleteOne();
    res.json({ message: "Book deleted successfully" });
  } catch (error) {
    res.status(500);
    throw new Error("Error deleting book");
  }
});

/**
 * Get a single Book by ID (public)
 */
const getBookById = asyncHandler(async (req, res) => {
  const book = await Book.findOne({ _id: req.params.id })
    .populate("author", "firstName lastName")
    .populate("category", "name")
    .populate("createdBy", "username email");

  if (!book) {
    return res.status(404).json({ message: "Book was not found" });
  }

  // Ensure category is always an array for consistency
  let bookObj = book.toObject();
  if (!Array.isArray(bookObj.category)) {
    bookObj.category = bookObj.category ? [bookObj.category] : [];
  }

  res.json(bookObj);
});

// Admin: create book
const createBook = asyncHandler(async (req, res) => {
  const {
    title,
    author,
    description,
    category,
    releaseYear,
    publishedDate,
    pages,
    language,
    totalQuantity,
    availableQuantity,
  } = req.body;

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

  // Handle picture upload (optional)
  let picture = null;
  if (req.file) {
    picture = `/uploads/books/${req.file.filename}`;
  }

  const book = new Book({
    title,
    author, // Author ObjectId from frontend dropdown
    description,
    category: Array.isArray(category) ? category : [category], // Ensure category is always an array
    releaseYear: releaseYear || publishedDate,
    publishedDate: publishedDate || releaseYear,
    pages: pages ? parseInt(pages) : undefined,
    language: language || "English",
    totalQuantity: totalQuantity ? parseInt(totalQuantity) : 1,
    availableQuantity: availableQuantity
      ? parseInt(availableQuantity)
      : totalQuantity
      ? parseInt(totalQuantity)
      : 1,
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
