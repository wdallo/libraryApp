const asyncHandler = require("express-async-handler");
const Reservation = require("../models/Reservation");
const Book = require("../models/Book");

// @desc    Reserve a book
// @route   POST /api/reservations
// @access  Private
const reserveBook = asyncHandler(async (req, res) => {
  const { bookId } = req.body;

  if (!bookId) {
    res.status(400);
    throw new Error("Book ID is required");
  }

  // Check if book exists
  const book = await Book.findById(bookId);
  if (!book) {
    res.status(404);
    throw new Error("Book not found");
  }

  // Check if book is already reserved by someone else
  const existingReservation = await Reservation.findOne({
    book: bookId,
    status: "active",
  });

  if (existingReservation) {
    res.status(400);
    throw new Error("Book is already reserved");
  }

  // Check if user already has this book reserved
  const userReservation = await Reservation.findOne({
    book: bookId,
    user: req.user._id,
    status: "active",
  });

  if (userReservation) {
    res.status(400);
    throw new Error("You have already reserved this book");
  }

  // Create reservation with 14-day period
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 14); // 14 days from now

  const reservation = await Reservation.create({
    book: bookId,
    user: req.user._id,
    dueDate,
  });

  const populatedReservation = await Reservation.findById(reservation._id)
    .populate("book", "title author picture")
    .populate("user", "username email");

  res.status(201).json({
    message: "Book reserved successfully",
    reservation: populatedReservation,
  });
});

// @desc    Get user's reservations
// @route   GET /api/reservations
// @access  Private
const getUserReservations = asyncHandler(async (req, res) => {
  const reservations = await Reservation.find({
    user: req.user._id,
  })
    .populate("book", "title author picture")
    .sort({ createdAt: -1 });

  res.status(200).json({
    reservations,
    message: "Reservations retrieved successfully",
  });
});

// @desc    Extend reservation deadline
// @route   PUT /api/reservations/:id/extend
// @access  Private
const extendReservation = asyncHandler(async (req, res) => {
  const reservation = await Reservation.findById(req.params.id);

  if (!reservation) {
    res.status(404);
    throw new Error("Reservation not found");
  }

  // Check if user owns this reservation
  if (reservation.user.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("Not authorized to extend this reservation");
  }

  // Check if reservation is active
  if (reservation.status !== "active") {
    res.status(400);
    throw new Error("Can only extend active reservations");
  }

  // Check if user has used maximum extensions
  if (reservation.extensionsUsed >= 2) {
    res.status(400);
    throw new Error("Maximum number of extensions (2) already used");
  }

  // Extend by 7 days
  const previousDueDate = new Date(reservation.dueDate);
  const newDueDate = new Date(reservation.dueDate);
  newDueDate.setDate(newDueDate.getDate() + 7);

  // Update reservation
  reservation.dueDate = newDueDate;
  reservation.extensionsUsed += 1;
  reservation.extensionHistory.push({
    extendedAt: new Date(),
    previousDueDate,
    newDueDate,
  });

  await reservation.save();

  const populatedReservation = await Reservation.findById(reservation._id)
    .populate("book", "title author picture")
    .populate("user", "username email");

  res.status(200).json({
    message: `Reservation extended successfully. ${
      2 - reservation.extensionsUsed
    } extensions remaining.`,
    reservation: populatedReservation,
  });
});

// @desc    Request book return (user submits return request)
// @route   PUT /api/reservations/:id/return
// @access  Private
const requestBookReturn = asyncHandler(async (req, res) => {
  const reservation = await Reservation.findById(req.params.id);

  if (!reservation) {
    res.status(404);
    throw new Error("Reservation not found");
  }

  // Check if user owns this reservation
  if (reservation.user.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("Not authorized to return this reservation");
  }

  // Check if reservation is active
  if (reservation.status !== "active") {
    res.status(400);
    throw new Error("This reservation is not active");
  }

  // Update reservation status to pending return
  reservation.status = "pending_return";
  await reservation.save();

  res.status(200).json({
    message:
      "Return request submitted successfully. Waiting for admin approval.",
    reservation,
  });
});

// @desc    Approve book return (admin only)
// @route   PUT /api/reservations/:id/approve-return
// @access  Private/Admin
const approveBookReturn = asyncHandler(async (req, res) => {
  const reservation = await Reservation.findById(req.params.id);

  if (!reservation) {
    res.status(404);
    throw new Error("Reservation not found");
  }

  // Check if reservation is pending return
  if (reservation.status !== "pending_return") {
    res.status(400);
    throw new Error("This reservation is not pending return");
  }

  // Update reservation status to returned
  reservation.status = "returned";
  await reservation.save();

  const populatedReservation = await Reservation.findById(reservation._id)
    .populate("book", "title author picture")
    .populate("user", "username email");

  res.status(200).json({
    message: "Book return approved successfully",
    reservation: populatedReservation,
  });
});

// @desc    Return a book (DEPRECATED - use requestBookReturn instead)
// @route   PUT /api/reservations/:id/return-old
// @access  Private
const returnBook = asyncHandler(async (req, res) => {
  const reservation = await Reservation.findById(req.params.id);

  if (!reservation) {
    res.status(404);
    throw new Error("Reservation not found");
  }

  // Check if user owns this reservation
  if (reservation.user.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("Not authorized to return this reservation");
  }

  // Check if reservation is active
  if (reservation.status !== "active") {
    res.status(400);
    throw new Error("This reservation is not active");
  }

  // Update reservation status
  reservation.status = "returned";
  await reservation.save();

  res.status(200).json({
    message: "Book returned successfully",
    reservation,
  });
});

// @desc    Get all reservations (Admin only)
// @route   GET /api/reservations/admin
// @access  Private/Admin
const getAllReservations = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  let query = {};

  if (req.query.status) {
    query.status = req.query.status;
  }

  const reservations = await Reservation.find(query)
    .populate("book", "title author picture")
    .populate("user", "username email")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const totalReservations = await Reservation.countDocuments(query);
  const totalPages = Math.ceil(totalReservations / limit);

  res.status(200).json({
    reservations,
    totalReservations,
    totalPages,
    currentPage: page,
    message: "All reservations retrieved successfully",
  });
});

module.exports = {
  reserveBook,
  getUserReservations,
  extendReservation,
  requestBookReturn,
  approveBookReturn,
  returnBook,
  getAllReservations,
};
