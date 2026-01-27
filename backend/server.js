// const express = require("express");
// const cors = require("cors");
// const pdfRoutes = require("./routes/pdfRoutes");
// const app = express();
// app.use(cors());
// app.use(express.json());
// app.use("/api/pdf", pdfRoutes);
// app.use((err, req, res, next) => {
//   console.error("GLOBAL ERROR:", err);
//   res.status(500).send(err.stack || err);
// });
// app.listen(5000, () => console.log("Server running on 5000"));

const express = require("express");
const cors = require("cors");
const pdfRoutes = require("./routes/pdfRoutes");

const app = express();
app.use(cors());
app.use("/api/pdf", pdfRoutes);

app.listen(5000, () => console.log("Server running on 5000"));
