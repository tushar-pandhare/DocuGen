const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();
const RouteLoader = require("./utils/routeLoader");

const app = express();

// ==================== ENV VALIDATION ====================
if (!process.env.JWT_SECRET) {
  console.error("❌ JWT_SECRET is not set in .env — authentication will not work.");
  process.exit(1);
}

if (!process.env.MONGO_URI) {
  console.error("❌ MONGO_URI is not set in .env — server cannot start.");
  process.exit(1);
}

// ==================== MONGODB ====================
mongoose
  .connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 5000,
    bufferCommands: false,
  })
  .then(() => console.log("✅ Database connected"))
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  });

// ==================== CORS ====================
const allowedOrigins = [
  "https://docu-gen-eight.vercel.app",
  "http://localhost:5173",
  "http://localhost:3000",
];

if (process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL);
}

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

// ==================== BODY PARSER ====================
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// ==================== REQUEST LOGGER (dev only) ====================
if (process.env.NODE_ENV === "development") {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.originalUrl}`);
    next();
  });
}

// ==================== ROUTE LOADER ====================
const routeLoader = new RouteLoader(app);

// ==================== AUTH ROUTES (eager) ====================
const authRoutes = require("./routes/auth");
const googleAuthRoutes = require("./routes/googleAuth");

app.use("/api/auth", authRoutes);
app.use("/api/auth", googleAuthRoutes);

// ==================== LAZY LOADED ROUTES ====================
routeLoader.lazyLoad("/api/ocr", "./routes/ocrRoute");
routeLoader.lazyLoad("/api/pdf", "./routes/pdfRoutes");
routeLoader.lazyLoad("/api/invoice", "./routes/invoiceRoute");
routeLoader.lazyLoad("/api/drive", "./routes/driveRoutes");
routeLoader.lazyLoad("/api/compress", "./routes/compressRoutes");
routeLoader.lazyLoad("/api/pdf-to-image", "./routes/pdfToImageRouteMain");
routeLoader.lazyLoad("/api", "./routes/templateRoutes");
routeLoader.lazyLoad("/api/ai", "./routes/aiAssistantRoute");

// ==================== HEALTH CHECK ====================
app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// ==================== 404 HANDLER ====================
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// ==================== ERROR HANDLER ====================
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({
    success: false,
    message: "Internal Server Error",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

// ==================== SERVER ====================
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`🚀 DocuGen server running on port ${PORT} (${process.env.NODE_ENV || "development"})`);
});

// ==================== GRACEFUL SHUTDOWN ====================
const shutdown = () => {
  server.close(() => {
    mongoose.connection.close(false, () => process.exit(0));
  });
  setTimeout(() => process.exit(1), 10000);
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

module.exports = app;
