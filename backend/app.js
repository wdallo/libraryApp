const express = require("express");
const compression = require("compression");
const cors = require("cors");
const path = require("path");
const mongoose = require("mongoose");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
require("dotenv").config();

// Import routes
const authorRoutes = require("./routes/authorRoutes");
const bookRoutes = require("./routes/bookRoutes");
const userRoutes = require("./routes/userRoutes");
const bookCategoryRoutes = require("./routes/bookCategoryRoutes");
const adminRoutes = require("./routes/adminRoutes");
const reservationRoutes = require("./routes/reservationRoutes");
const { errorHandler } = require("./middleware/errorHandler");

const app = express();
const port = process.env.PORT || 3000;

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log("MongoDB connection error:", err));

const frontEnd = "http://localhost:5173";
const corsOptions = {
  origin: frontEnd, // Remove trailing slash for strict match
  credentials: true,
  optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
};

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10000, // limit each IP to 5 requests per windowMs for testing
  message: {
    error: "Too many requests from this IP, please try again later.",
    retryAfter: "15 minutes",
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers

  handler: (req, res) => {
    console.log(`Rate limit exceeded for IP: ${req.ip}`);
    const userAgent = req.get("User-Agent") || "";

    // Check if the request is from a browser or terminal/API client
    const isBrowser =
      userAgent.includes("Mozilla") ||
      userAgent.includes("Chrome") ||
      userAgent.includes("Safari") ||
      userAgent.includes("Firefox") ||
      userAgent.includes("Edge");

    if (isBrowser) {
      // For browser users - they will be redirected by the frontend interceptor
      res.status(429).json({
        error: "Too many requests from this IP, please try again later.",
        retryAfter: "15 minutes",
        userType: "browser",
      });
    } else {
      // For terminal/API users - provide a different help URL
      const baseUrl = `${req.protocol}://${req.get("host")}`;
      res.status(429).json({
        error: "Too many requests from this IP, please try again later.",
        retryAfter: "15 minutes",
        userType: "terminal",
        helpUrl: `${baseUrl}/rate-limits.html`,
        message: `For rate limit information and API usage guidelines, visit: ${baseUrl}/rate-limits.html`,
        contact:
          "If you need higher rate limits, contact support@yourlibrary.com",
      });
    }
  },
});

app.use(
  compression({
    level: 6, // Compression level (0-9, 6 is good balance)
    threshold: 1024, // Only compress responses larger than 1KB
    filter: (req, res) => {
      // Don't compress if the request includes a cache-control header to disable compression
      if (req.headers["x-no-compression"]) {
        return false;
      }
      // Use compression filter function
      return compression.filter(req, res);
    },
  })
);

// Security middleware
app.use(helmet());
app.use(morgan("combined"));
app.use(limiter);
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from public directory (for help pages)
app.use(express.static(path.join(__dirname, "public")));

// Serve static files with permissive CORS headers
app.use(
  "/uploads",
  (req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, OPTIONS");
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept"
    );
    res.header("Cross-Origin-Resource-Policy", "cross-origin");
    if (req.method === "OPTIONS") {
      res.sendStatus(200);
    } else {
      next();
    }
  },
  express.static(path.join(__dirname, "uploads"))
);

// Test endpoint to verify rate limiting behavior
app.get("/api/test-rate-limit", limiter, (req, res) => {
  const userAgent = req.get("User-Agent") || "";
  const isBrowser =
    userAgent.includes("Mozilla") ||
    userAgent.includes("Chrome") ||
    userAgent.includes("Safari") ||
    userAgent.includes("Firefox") ||
    userAgent.includes("Edge");

  res.json({
    message: "Request successful",
    userAgent: userAgent,
    detectedAs: isBrowser ? "browser" : "terminal",
    timestamp: new Date().toISOString(),
  });
});

// Routes
app.use("/api/authors", authorRoutes);
app.use("/api/books", bookRoutes);
app.use("/api/users", userRoutes);
app.use("/api/categories", bookCategoryRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/reservations", reservationRoutes);

// Error handling middleware
app.use(errorHandler);

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
