const express = require("express");
const cors = require("cors");
require("dotenv").config();
const pdfRoutes = require("./routes/pdfRoutes");
const invoiceRoutes = require("./routes/invoiceRoute");
const authRoutes = require("./temp");
const googleAuthRoutes = require("./routes/googleAuth");
const app = express();
app.use(cors());
app.use(express.json());
// Auth routes
app.use("/api/auth", authRoutes);
app.use("/api/auth", googleAuthRoutes);
// Other routes
app.use("/api/pdf", pdfRoutes);
app.use("/api/invoice", invoiceRoutes);
app.listen(process.env.PORT || 5000, () => {
  console.log(`Server running on port ${process.env.PORT || 5000}`);
});
