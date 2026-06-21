// //pdftoimage.js
// const pdf = require("pdf-poppler");
// const path = require("path");
// const fs = require("fs");
// const { v4: uuidv4 } = require("uuid");

// router.post("/pdf", upload.single("file"), async (req, res) => {
//   try {
//     const pdfPath = req.file.path;

//     // 🔥 unique folder for each request
//     const uniqueFolder = `uploads/${uuidv4()}`;
//     fs.mkdirSync(uniqueFolder, { recursive: true });

//     const opts = {
//       format: "jpeg",
//       out_dir: uniqueFolder,
//       out_prefix: "page",
//       page: null,
//     };

//     await pdf.convert(pdfPath, opts);

//     // 🔥 ONLY READ CURRENT PDF IMAGES
//     const files = fs.readdirSync(uniqueFolder);

//     const images = files
//       .filter((file) => file.endsWith(".jpg"))
//       .map((file) => ({
//         name: file,
//         download: `http://localhost:5000/${uniqueFolder}/${file}`,
//       }));

//     res.json({ images });

//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "PDF conversion failed" });
//   }
// });
// const pdf2img = require('pdf-img-convert'); // Install: npm install pdf-img-convert

