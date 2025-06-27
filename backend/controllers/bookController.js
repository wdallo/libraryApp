const asyncHandler = require("express-async-handler");
const Book = require("../models/Book");
const BookCategory = require("../models/BookCategory");

const fs = require("fs");
const path = require("path");

const getBooks = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  // Filtering
  const filter = { approved: true };
  if (req.query.search) {
    filter.title = { $regex: "^" + req.query.search, $options: "i" };
  }
  if (req.query.category) {
    const categoryDoc = await BookCategory.findOne({
      name: req.query.category.toLowerCase(),
    });
    if (categoryDoc) {
      filter.category = categoryDoc._id;
    } else {
      return res.json({ books: [], totalPages: 0, totalBooks: 0 });
    }
  }

  // Sorting
  let sort = {};
  if (req.query.sort) {
    if (req.query.sort === "date-asc") sort.time = 1;
    else if (req.query.sort === "date-desc") sort.time = -1;
    else if (req.query.sort === "title-asc") sort.title = 1;
    else if (req.query.sort === "title-desc") sort.title = -1;
  }

  const [books, total] = await Promise.all([
    Book.find(filter).sort(sort).skip(skip).limit(limit),
    Book.countDocuments(filter),
  ]);

  // Search check:

  if (books.length === 0) {
    return res.status(404).json({
      message: "Data Not Found",
      books: [],
      totalPages: 0,
      totalBooks: 0,
    });
  }

  res.json({
    books,
    totalPages: Math.ceil(total / limit),
    totalBooks: total,
  });
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
  const { title, author, description, publishedDate } = req.body;

  if (!title || !author) {
    res.status(400);
    throw new Error("Title and author are required");
  }

  // Only admin can create books
  if (req.user.role !== "admin") {
    res.status(403);
    throw new Error("Not authorized to create books");
  }

  const book = new Book({
    title,
    author,
    description,
    publishedDate,
  });

  const createdBook = await book.save();
  res.status(201).json(createdBook);
});

module.exports = {
  getBooks,
  updateBook,
  deleteBook,
  getBookById,
  createBook,
};
