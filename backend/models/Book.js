const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    author: { type: String, require: true },
    description: { type: String },
    picture: { type: String }, // URL or filename
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
