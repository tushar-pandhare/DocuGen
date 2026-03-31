// const express = require("express");
// const cors = require("cors");
// require("dotenv").config();
// const pdfRoutes = require("./routes/pdfRoutes");
// const invoiceRoutes = require("./routes/invoiceRoute");
// const ocrRoutes = require("./routes/ocrRoute")
// const authRoutes = require("./temp");
// const googleAuthRoutes = require("./routes/googleAuth");
// const driveRoutes = require("./routes/driveRoutes")
// const compressRoutes = require("./routes/compressRoutes")
// const pdfToImg = require("./routes/pdfToImageRouteMain")

// const app = express();
// app.use(cors());
// app.use(express.json({ limit: "50mb" }));
// app.use(express.urlencoded({ limit: "50mb", extended: true }));
// // Auth routes
// app.use("/api/auth", authRoutes);
// app.use("/api/auth", googleAuthRoutes);
// // Other routes
// app.use("/api/ocr", ocrRoutes);
// app.use("/api/pdf", pdfRoutes);
// app.use("/api/invoice", invoiceRoutes);
// app.use("/api/drive",driveRoutes);
// app.use("/api/compress",compressRoutes);
// app.use("/api/pdf-to-image",pdfToImg)
// app.listen(process.env.PORT || 5000, () => {
//   console.log(`Server running on port ${process.env.PORT || 5000}`);
// });

const express = require("express");
const cors = require("cors");
require("dotenv").config();
const RouteLoader = require("./utils/routeLoader");

const app = express();

// ==================== MIDDLEWARE ====================
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Request logging middleware (lightweight)
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
  });
}

// ==================== INITIALIZE ROUTE LOADER ====================
const routeLoader = new RouteLoader(app);

// Load essential routes immediately (auth is always needed)
const authRoutes = require("./temp");
const googleAuthRoutes = require("./routes/googleAuth");

app.use("/api/auth", authRoutes);
app.use("/api/auth", googleAuthRoutes);

// Lazy load other routes
routeLoader.lazyLoad("/api/ocr", "./routes/ocrRoute");
routeLoader.lazyLoad("/api/pdf", "./routes/pdfRoutes");
routeLoader.lazyLoad("/api/invoice", "./routes/invoiceRoute");
routeLoader.lazyLoad("/api/drive", "./routes/driveRoutes");
routeLoader.lazyLoad("/api/compress", "./routes/compressRoutes");
routeLoader.lazyLoad("/api/pdf-to-image", "./routes/pdfToImageRouteMain");

// ==================== HEALTH CHECK ====================
app.get("/health", (req, res) => {
  res.json({ 
    status: "healthy",
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    timestamp: new Date().toISOString(),
    loadedRoutes: Array.from(routeLoader.loadedRoutes.keys())
  });
});

// ==================== ERROR HANDLING ====================
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// ==================== START SERVER ====================
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════╗
║     🚀 DocuGen API Server Started!            ║
╠═══════════════════════════════════════════════╣
║  📡 Port: ${PORT.padEnd(38)}║
║  🌍 Environment: ${(process.env.NODE_ENV || 'development').padEnd(32)}║
║  ⚡ Routes: Loaded on demand                  ║
║  🔗 Health: http://localhost:${PORT}/health     ║
╚═══════════════════════════════════════════════╝
  `);
});

// ==================== GRACEFUL SHUTDOWN ====================
const shutdown = async () => {
  console.log('\n🛑 Shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
  
  // Force close after 10 seconds
  setTimeout(() => {
    console.error('⚠️ Forced shutdown');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

module.exports = app;