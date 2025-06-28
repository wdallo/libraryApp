const mongoose = require("mongoose");

const reservationSchema = new mongoose.Schema(
  {
    book: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Book",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    reservedAt: {
      type: Date,
      default: Date.now,
    },
    dueDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "returned", "overdue", "pending_return"],
      default: "active",
    },
    extensionsUsed: {
      type: Number,
      default: 0,
      max: 2, // Maximum 2 extensions allowed
    },
    extensionHistory: [
      {
        extendedAt: Date,
        previousDueDate: Date,
        newDueDate: Date,
      },
    ],
  },
  { timestamps: true }
);

// Index for efficient queries
reservationSchema.index({ book: 1, status: 1 });
reservationSchema.index({ user: 1, status: 1 });

const Reservation = mongoose.model("Reservation", reservationSchema);
module.exports = Reservation;
