const mongoose = require("mongoose");

const bookCategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    set: (v) => v.toLowerCase(), // always store as lowercase
  },
  description: { type: String },
});

const BookCategory = mongoose.model("BookCategory", bookCategorySchema);
module.exports = BookCategory;
