const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, "Please enter your firstname"],
    },
    lastName: {
      type: String,
      required: [true, "Please enter your lastname"],
    },
    email: {
      type: String,
      required: [true, "Please enter your email"],
      unique: true,
    },
    password: {
      type: String,
      required: [true, "Please enter your password"],
    },
    role: {
      type: String,
      enum: ["user", "admin"], // Specifikuojame leidžiamas rolių reikšmes
      default: "user",
    },
    status: {
      type: String,
      enum: ["active", "banned"],
      default: "active",
    },
    lastLogin: { type: Date }, // Naujas laukas
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);
module.exports = User;
