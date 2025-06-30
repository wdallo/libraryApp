const asyncHandler = require("express-async-handler");
const User = require("../models/User");
const Book = require("../models/Book");
const BookCategory = require("../models/BookCategory");
const Reservation = require("../models/Reservation");

// Admin dashboard with stats
const getAdminDashboard = asyncHandler(async (req, res) => {
  try {
    // Get counts
    const totalUsers = await User.countDocuments();
    const totalBooks = await Book.countDocuments();
    const totalCategories = await BookCategory.countDocuments();
    const totalReservations = await Reservation.countDocuments();

    // Get reservation stats
    const activeReservations = await Reservation.countDocuments({
      status: "active",
    });
    const pendingReservations = await Reservation.countDocuments({
      status: "pending",
    });
    const overdueReservations = await Reservation.countDocuments({
      status: "active",
      dueDate: { $lt: new Date() },
    });

    // Get recent activity (last 15 reservation actions)
    const recentReservations = await Reservation.find()
      .populate("user", "firstName lastName")
      .populate("book", "title")
      .populate("approvedBy", "firstName lastName")
      .populate("rejectedBy", "firstName lastName")
      .populate("returnApprovedBy", "firstName lastName")
      .sort({ updatedAt: -1 })
      .limit(15);

    const recentActivity = [];

    recentReservations.forEach((reservation) => {
      const userName =
        `${reservation.user?.firstName || ""} ${
          reservation.user?.lastName || ""
        }`.trim() || "Unknown User";
      const bookTitle = reservation.book?.title || "Unknown Book";

      // Add the main reservation action
      let message, icon, color, time;

      switch (reservation.status) {
        case "pending":
          message = `${userName} requested to reserve "${bookTitle}"`;
          icon = "fa-clock";
          color = "warning";
          time = reservation.createdAt;
          break;
        case "active":
          const approverName = reservation.approvedBy
            ? `${reservation.approvedBy.firstName || ""} ${
                reservation.approvedBy.lastName || ""
              }`.trim()
            : "Admin";
          message = `${approverName} approved reservation of "${bookTitle}" for ${userName}`;
          icon = "fa-check-circle";
          color = "success";
          time = reservation.approvedAt || reservation.updatedAt;
          break;
        case "cancelled":
          const rejectorName = reservation.rejectedBy
            ? `${reservation.rejectedBy.firstName || ""} ${
                reservation.rejectedBy.lastName || ""
              }`.trim()
            : "Admin";
          message = `${rejectorName} rejected reservation of "${bookTitle}" by ${userName}`;
          icon = "fa-times-circle";
          color = "danger";
          time = reservation.rejectedAt || reservation.updatedAt;
          break;
        case "pending_return":
          message = `${userName} requested to return "${bookTitle}"`;
          icon = "fa-undo";
          color = "info";
          time = reservation.updatedAt;
          break;
        case "returned":
          const returnApproverName = reservation.returnApprovedBy
            ? `${reservation.returnApprovedBy.firstName || ""} ${
                reservation.returnApprovedBy.lastName || ""
              }`.trim()
            : "Admin";
          message = `${returnApproverName} approved return of "${bookTitle}" from ${userName}`;
          icon = "fa-check";
          color = "secondary";
          time = reservation.returnedAt || reservation.updatedAt;
          break;
        default:
          message = `${userName} reserved "${bookTitle}"`;
          icon = "fa-bookmark";
          color = "primary";
          time = reservation.createdAt;
      }

      recentActivity.push({
        message,
        time: time ? time.toLocaleDateString() : "Unknown",
        icon,
        color,
        reservationId: reservation._id,
        status: reservation.status,
      });
    });

    const stats = {
      totalUsers,
      totalBooks,
      totalCategories,
      totalReservations,
      activeReservations,
      pendingReservations,
      overdueReservations,
    };

    res.json({ stats, recentActivity });
  } catch (error) {
    res.status(500);
    throw new Error("Error fetching dashboard data");
  }
});

// Get all users for admin management
const getUsers = asyncHandler(async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.json({ users });
  } catch (error) {
    res.status(500);
    throw new Error("Error fetching users");
  }
});

// Update user
const updateUser = asyncHandler(async (req, res) => {
  try {
    const { firstName, lastName, email, role } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }

    user.firstName = firstName || user.firstName;
    user.lastName = lastName || user.lastName;
    user.email = email || user.email;
    user.role = role || user.role;

    const updatedUser = await user.save();
    res.json({ message: "User updated successfully", user: updatedUser });
  } catch (error) {
    res.status(500);
    throw new Error("Error updating user");
  }
});

// Ban user
const banUser = asyncHandler(async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }

    user.status = "banned";
    await user.save();

    res.json({ message: "User banned successfully" });
  } catch (error) {
    res.status(500);
    throw new Error("Error banning user");
  }
});

// Unban user
const unbanUser = asyncHandler(async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }

    user.status = "active";
    await user.save();

    res.json({ message: "User unbanned successfully" });
  } catch (error) {
    res.status(500);
    throw new Error("Error unbanning user");
  }
});

// Admin: delete user
const adminDeleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }
  await user.deleteOne();
  res.json({ message: "User deleted by admin" });
});

module.exports = {
  getAdminDashboard,
  getUsers,
  updateUser,
  banUser,
  unbanUser,
  adminDeleteUser,
};
