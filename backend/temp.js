const express = require("express");
const mongoose = require("mongoose");
const signLog = require("./routes/auth");

const router = express.Router();
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("MongoDB Connected from temp"))
.catch(err => console.log(err));

router.use("/", signLog);

module.exports = router;
