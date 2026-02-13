const express = require("express");
const cors = require("cors");
require("dotenv").config();

const pdfRoutes = require("./routes/pdfRoutes");
const invoiceRoutes = require("./routes/invoiceRoute");
const authRoutes = require("./temp");

const app = express();

app.use(cors());
app.use(express.json());

// Auth routes
app.use("/api/auth", authRoutes);

// Other routes
app.use("/api/pdf", pdfRoutes);
app.use("/api/invoice", invoiceRoutes);

app.listen(process.env.PORT || 5000, () => {
  console.log(`Server running on port ${process.env.PORT || 5000}`);
});


// const express = require("express");
// const cors = require("cors");
// const pdfRoutes = require("./routes/pdfRoutes");
// const invoiceRoutes = require("./routes/invoiceRoute")

// const app = express();
// app.use(cors());
// app.use("/api/pdf", pdfRoutes);
// app.use(express.json())
// app.use("/api/pdf",invoiceRoutes)

// app.listen(50001, () => console.log("Server running on 50001"));
