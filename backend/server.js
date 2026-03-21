const express = require("express");
const cors = require("cors");
require("dotenv").config();
const pdfRoutes = require("./routes/pdfRoutes");
const invoiceRoutes = require("./routes/invoiceRoute");
const ocrRoutes = require("./routes/ocrRoute")
const authRoutes = require("./temp");
const googleAuthRoutes = require("./routes/googleAuth");
const driveRoutes = require("./routes/driveRoutes")
const compressRoutes = require("./routes/compressRoutes")
const pdfToImg = require("./routes/pdfToImageRouteMain")

const app = express();
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
// Auth routes
app.use("/api/auth", authRoutes);
app.use("/api/auth", googleAuthRoutes);
// Other routes
app.use("/api/ocr", ocrRoutes);
app.use("/api/pdf", pdfRoutes);
app.use("/api/invoice", invoiceRoutes);
app.use("/api/drive",driveRoutes);
app.use("/api/compress",compressRoutes);
app.use("/api/pdf-to-image",pdfToImg)
app.listen(process.env.PORT || 5000, () => {
  console.log(`Server running on port ${process.env.PORT || 5000}`);
});
