// const express = require("express");
// const router = express.Router();
// const multer = require("multer");
// const fs = require("fs");
// const path = require("path");
// const pdf = require("pdf-poppler");

// const upload = multer({ dest: "uploads/" });

// router.post("/", upload.single("file"), async (req, res) => {
//   try {
//     const file = req.file;

//     if (!file || file.mimetype !== "application/pdf") {
//       return res.status(400).json({ message: "Upload a valid PDF" });
//     }

//     const outputDir = path.join(__dirname, "../output");
//     if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);

//     const options = {
//       format: "jpeg",
//       out_dir: outputDir,
//       out_prefix: path.parse(file.originalname).name,
//       page: null, // all pages
//     };

//     await pdf.convert(file.path, options);

//     // Read generated images
//     const files = fs.readdirSync(outputDir);

//     const images = files.map((f) => {
//       const filePath = path.join(outputDir, f);
//       const data = fs.readFileSync(filePath, { encoding: "base64" });

//       return {
//         name: f,
//         download: `data:image/jpeg;base64,${data}`,
//       };
//     });

//     // Cleanup
//     fs.unlinkSync(file.path);

//     res.json({ images });

//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Conversion failed" });
//   }
// });

// module.exports = router;

const express = require("express");
const router = express.Router();
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const pdf = require("pdf-poppler");

const upload = multer({ dest: "uploads/" });

router.post("/", upload.single("file"), async (req, res) => {
  try {
    const file = req.file;
    const uploadToDrive = req.body.uploadToDrive === 'true' || req.body.uploadToDrive === true;

    if (!file || file.mimetype !== "application/pdf") {
      return res.status(400).json({ message: "Upload a valid PDF" });
    }

    const outputDir = path.join(__dirname, "../output");
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);

    const options = {
      format: "jpeg",
      out_dir: outputDir,
      out_prefix: path.parse(file.originalname).name,
      page: null,
    };

    await pdf.convert(file.path, options);

    const files = fs.readdirSync(outputDir);
    const images = files.map((f) => {
      const filePath = path.join(outputDir, f);
      const data = fs.readFileSync(filePath, { encoding: "base64" });
      return {
        name: f,
        download: `data:image/jpeg;base64,${data}`,
      };
    });

    // Cleanup
    fs.unlinkSync(file.path);
    files.forEach(f => fs.unlinkSync(path.join(outputDir, f)));

    res.json({ images, uploadedToDrive: uploadToDrive });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Conversion failed" });
  }
});

module.exports = router;