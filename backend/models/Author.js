const mongoose = require("mongoose");

const authorSchema = new mongoose.Schema(
  {
    firstname: { type: String, required: true },
    lastname: { type: String, require: true },
    birthday: { type: Date },
    picture: { type: String }, // URL or filename
    bio: { type: String },
  },
  { timestamps: true }
);

const Author = mongoose.model("Author", authorSchema);
module.exports = Author;
