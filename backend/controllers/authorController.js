const asyncHandler = require("express-async-handler");
const Author = require("../models/Author");
const fs = require("fs");
const path = require("path");

/**
 * Get all authors (public)
 * GET /api/authors
 */
const getAuthors = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  // Filtering
  const filter = {};
  if (req.query.search) {
    filter.$or = [
      { firstname: { $regex: req.query.search, $options: "i" } },
      { lastname: { $regex: req.query.search, $options: "i" } },
    ];
  }

  // Sorting
  let sort = {};
  if (req.query.sort) {
    if (req.query.sort === "name-asc") sort.firstname = 1;
    else if (req.query.sort === "name-desc") sort.firstname = -1;
    else if (req.query.sort === "created-asc") sort.createdAt = 1;
    else if (req.query.sort === "created-desc") sort.createdAt = -1;
  }

  const [authors, total] = await Promise.all([
    Author.find(filter).sort(sort).skip(skip).limit(limit),
    Author.countDocuments(filter),
  ]);

  if (authors.length === 0) {
    return res.status(404).json({
      message: "No authors found",
      authors: [],
      totalPages: 0,
      totalAuthors: 0,
    });
  }

  res.json({
    authors,
    totalPages: Math.ceil(total / limit),
    totalAuthors: total,
  });
});

/**
 * Get a single author by ID (public)
 * GET /api/authors/:id
 */
const getAuthorById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Validate ObjectId format
  if (!id.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(400).json({ message: "Invalid author ID format" });
  }

  const author = await Author.findById(id);

  if (!author) {
    return res.status(404).json({ message: "Author not found" });
  }

  res.json(author);
});

/**
 * Create a new author (admin only)
 * POST /api/authors
 */
const createAuthor = asyncHandler(async (req, res) => {
  const { firstname, lastname, birthday, bio } = req.body;
  let picture = null;

  if (req.file) {
    picture = `/uploads/authors/${req.file.filename}`;
  }

  if (!firstname || !lastname) {
    res.status(400);
    throw new Error("First name and last name are required");
  }

  // Only admin can create authors
  if (req.user.role !== "admin") {
    res.status(403);
    throw new Error("Not authorized to create authors");
  }

  const author = new Author({
    firstname,
    lastname,
    birthday,
    picture,
    bio,
  });

  const createdAuthor = await author.save();
  res.status(201).json(createdAuthor);
});

/**
 * Update an author (admin only)
 * PUT /api/authors/:id
 */
const updateAuthor = asyncHandler(async (req, res) => {
  const { firstname, lastname, birthday, bio } = req.body;
  let picture = null;

  if (req.file) {
    picture = `/uploads/authors/${req.file.filename}`;
  }

  const author = await Author.findById(req.params.id);

  if (!author) {
    res.status(404);
    throw new Error("Author not found");
  }

  // Only admin can update authors
  if (req.user.role !== "admin") {
    res.status(403);
    throw new Error("Not authorized to update this author");
  }

  // Update fields if provided
  if (firstname) author.firstname = firstname;
  if (lastname) author.lastname = lastname;
  if (birthday) author.birthday = birthday;
  if (bio) author.bio = bio;
  if (picture) author.picture = picture;

  const updatedAuthor = await author.save();
  res.json({ message: "Author updated", author: updatedAuthor });
});

/**
 * Delete an author (admin only)
 * DELETE /api/authors/:id
 */
const deleteAuthor = asyncHandler(async (req, res) => {
  const author = await Author.findById(req.params.id);

  if (!author) {
    res.status(404);
    throw new Error("Author not found");
  }

  // Only admin can delete authors
  if (req.user.role !== "admin") {
    res.status(403);
    throw new Error("Not authorized to delete this author");
  }

  // Delete picture file if exists
  if (author.picture) {
    const pictureRelativePath = author.picture.startsWith("/")
      ? author.picture.slice(1)
      : author.picture;
    const picturePath = path.join(__dirname, "..", pictureRelativePath);
    fs.unlink(picturePath, (err) => {
      if (err) {
        console.error("Failed to delete author picture:", err);
      }
    });
  }

  await author.deleteOne();
  res.json({ message: "Author and picture deleted" });
});

module.exports = {
  getAuthors,
  getAuthorById,
  createAuthor,
  updateAuthor,
  deleteAuthor,
};
