const BookCategory = require("../models/BookCategory");
const Book = require("../models/Book"); // Make sure Book model is imported
const mongoose = require("mongoose");
const asyncHandler = require("express-async-handler");

/**
 * Get all Book categories
 */
// Get all Book categories with book count (no pagination)
const getAllCategoriesWithBookCount = asyncHandler(async (req, res) => {
  try {
    const categories = await BookCategory.find();
    // For each category, count books that include this category in their array
    const categoriesWithBookCount = await Promise.all(
      categories.map(async (category) => {
        const bookCount = await Book.countDocuments({
          category: { $in: [category._id] },
        });
        return {
          ...category.toObject(),
          bookCount,
        };
      })
    );
    res.json(categoriesWithBookCount);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

// Get all categories with book count and pagination
const getCategories = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  let query = {};
  if (req.query.search) {
    query.name = { $regex: req.query.search, $options: "i" };
  }

  const categories = await BookCategory.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  // Aggregate to count books per category (Book.category is an array)
  const categoryIds = categories.map((cat) => cat._id);
  const bookCounts = await Book.aggregate([
    { $unwind: "$category" },
    { $match: { category: { $in: categoryIds } } },
    { $group: { _id: "$category", count: { $sum: 1 } } },
  ]);
  const countMap = {};
  bookCounts.forEach((bc) => {
    countMap[bc._id.toString()] = bc.count;
  });

  const categoriesWithBookCount = categories.map((category) => ({
    ...category.toObject(),
    bookCount: countMap[category._id.toString()] || 0,
  }));

  const totalCategories = await BookCategory.countDocuments(query);
  const totalPages = Math.ceil(totalCategories / limit);

  res.status(200).json({
    categories: categoriesWithBookCount,
    totalCategories,
    totalPages,
    currentPage: page,
    message:
      categoriesWithBookCount.length > 0
        ? "Categories retrieved successfully"
        : "No categories found",
  });
});
// Get single category by ID with book count and books
const getCategoryById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid category ID" });
    }

    const category = await BookCategory.findById(id);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    // Find all books that include this category
    const books = await Book.find({ category: { $in: [category._id] } })
      .populate("author", "firstName lastName")
      .populate("category", "name");
    const bookCount = books.length;

    const categoryWithBookCount = {
      ...category.toObject(),
      bookCount,
      books,
    };

    res.status(200).json(categoryWithBookCount);
  } catch (error) {
    console.error("getCategoryById error:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

// Create new category (admin only)
const createCategory = asyncHandler(async (req, res) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ message: "Access denied" });
  }
  const { name, description } = req.body;

  if (!name) {
    return res.status(400).json({ message: "Category name is required" });
  }

  const existingCategory = await BookCategory.findOne({
    name: { $regex: new RegExp(`^${name}$`, "i") },
  });

  if (existingCategory) {
    return res.status(400).json({ message: "Category already exists" });
  }

  const category = new BookCategory({
    name,
    description: description || "",
  });

  await category.save();

  const categoryWithBookCount = {
    ...category.toObject(),
    bookCount: 0,
  };

  res.status(201).json({
    message: "Category created successfully",
    category: categoryWithBookCount,
  });
});

// Update category (admin only)
const updateCategory = asyncHandler(async (req, res) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ message: "Access denied" });
  }
  const { id } = req.params;
  const { name, description } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid category ID" });
  }

  if (!name) {
    return res.status(400).json({ message: "Category name is required" });
  }

  const category = await BookCategory.findByIdAndUpdate(
    id,
    { name, description },
    { new: true, runValidators: true }
  );

  if (!category) {
    return res.status(404).json({ message: "Category not found" });
  }

  const bookCount = await Book.countDocuments({
    category: { $in: [category._id] },
  });

  const categoryWithBookCount = {
    ...category.toObject(),
    bookCount,
  };

  res.status(200).json({
    message: "Category updated successfully",
    category: categoryWithBookCount,
  });
});

// Delete category (admin only)
const deleteCategory = asyncHandler(async (req, res) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ message: "Access denied" });
  }
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid category ID" });
  }

  const bookCount = await Book.countDocuments({
    category: { $in: [id] },
  });

  if (bookCount > 0) {
    return res.status(400).json({
      message: `Cannot delete category. It has ${bookCount} book(s) associated with it.`,
    });
  }

  const category = await BookCategory.findByIdAndDelete(id);
  if (!category) {
    return res.status(404).json({ message: "Category not found" });
  }

  res.status(200).json({ message: "Category deleted successfully" });
});

module.exports = {
  getAllCategories: getAllCategoriesWithBookCount,
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
};
