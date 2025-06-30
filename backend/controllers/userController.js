const User = require("../models/User");
const { generateToken } = require("../functions/generateToken");
const bcryptjs = require("bcryptjs");
const asyncHandler = require("express-async-handler");

// Register a new user
const registerUser = asyncHandler(async (req, res) => {
  const { firstName, lastName, email, password } = req.body;

  // Debug logging
  console.log("Registration request body:", req.body);
  console.log("Extracted fields:", {
    firstName,
    lastName,
    email,
    password: password ? "***" : undefined,
  });

  // Check for existing email
  const emailExists = await User.findOne({ email });
  if (emailExists) {
    res.status(400);
    throw new Error("Email already exists");
  }

  const salt = await bcryptjs.genSalt(10);
  const hashedPassword = await bcryptjs.hash(password, salt);

  console.log("Attempting to create user with data:", {
    firstName,
    lastName,
    email,
    status: "active",
  });

  const user = await User.create({
    firstName,
    lastName,
    email,
    password: hashedPassword,
    role: "user",
    status: "active",
    lastLogin: null,
  });

  console.log("User created successfully:", user.email);

  const token = generateToken(user.id);
  if (user) {
    res.status(201).json({
      _id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      status: user.status,
      lastLogin: user.lastLogin,
      token: token,
    });
  } else {
    res.status(400);
    throw new Error("User registration failed, Invalid user data");
  }
});

// login user
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Debug logging
  console.log("Login request body:", req.body);
  console.log("Extracted fields:", {
    email,
    password: password ? "***" : undefined,
  });

  const user = await User.findOne({ email });
  console.log("User found:", user ? `Yes (${user.email})` : "No");

  if (user) {
    const passwordMatch = await bcryptjs.compare(password, user.password);
    console.log("Password match:", passwordMatch);
    console.log("User status:", user.status);
  }

  if (user && (await bcryptjs.compare(password, user.password))) {
    if (user.status === "banned") {
      res.status(403);
      throw new Error("Account is inactive. Contact admin.");
    }
    user.lastLogin = new Date();
    await user.save();
    res.json({
      message: "Login successfully",
      _id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      status: user.status,
      lastLogin: user.lastLogin,
      token: generateToken(user.id),
    });
  } else {
    res.status(400);
    throw new Error("Incorrect email or password");
  }
});

// GET users list (all users)
const getAllUsers = asyncHandler(async (req, res) => {
  const usersList = await User.find().select("-password");
  res.status(200).json(usersList);
});

// Update user info
const updateUser = asyncHandler(async (req, res) => {
  const { firstName, lastName, email, password } = req.body;
  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }
  if (req.user.id !== user.id && req.user.role !== "admin") {
    res.status(403);
    throw new Error("Not authorized to update this user");
  }
  if (firstName) user.firstName = firstName;
  if (lastName) user.lastName = lastName;
  if (email) user.email = email;
  if (password) {
    const salt = await bcryptjs.genSalt(10);
    user.password = await bcryptjs.hash(password, salt);
  }
  // Only admin can change role
  if (req.body.role && req.user.role === "admin") {
    user.role = req.body.role;
  }
  // Allow admin to update status (ban/unban user)
  if (req.body.status && req.user.role === "admin") {
    user.status = req.body.status; // Should be "active" or "banned"
  }
  await user.save();
  res.json({
    _id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    role: user.role,
    status: user.status,
  });
});

// Delete user (admin only)
const deleteUser = asyncHandler(async (req, res) => {
  // Only admin can delete users
  if (!req.user || req.user.role !== "admin") {
    res.status(403);
    throw new Error("Not authorized to delete users");
  }
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }
  await user.deleteOne();
  res.json({ message: "User deleted" });
});

module.exports = {
  registerUser,
  loginUser,
  getAllUsers,
  updateUser,
  deleteUser,
};
