const mongoose = require("mongoose");

const authorSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true }, // fix: 'require' -> 'required'
    birthday: { type: Date },
    picture: { type: String }, // URL or filename
    bio: { type: String },
  },
  { timestamps: true }
);

const Author = mongoose.model("Author", authorSchema);
module.exports = Author;
