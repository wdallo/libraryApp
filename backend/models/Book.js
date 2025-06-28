const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Author",
      required: true,
    },
    description: { type: String },
    picture: { type: String }, // URL or filename
    publishedDate: { type: Date }, // Alternative to releaseYear for better date handling
    pages: { type: Number },
    language: { type: String, default: "Unknown" },
    totalQuantity: { type: Number, default: 1 },
    availableQuantity: { type: Number, default: 1 },
    category: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "BookCategory",
        required: true,
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

const Book = mongoose.model("Book", bookSchema);
module.exports = Book;
