const Tesseract = require("tesseract.js");
const fs = require("fs");
const path = require("path");
const poppler = require("pdf-poppler");

exports.extractText = async (req, res) => {
  try {
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // ✅ IF IMAGE
    if (file.mimetype.startsWith("image")) {
      const result = await Tesseract.recognize(file.buffer, "eng");
      return res.json({ text: result.data.text });
    }

    // ✅ IF PDF
    if (file.mimetype === "application/pdf") {
      const tempPath = path.join(__dirname, "../temp.pdf");
      fs.writeFileSync(tempPath, file.buffer);

      const outputDir = path.join(__dirname, "../output");

      const opts = {
        format: "png",
        out_dir: outputDir,
        out_prefix: "page",
        page: null,
      };

      await poppler.convert(tempPath, opts);

      const files = fs.readdirSync(outputDir);

      let fullText = "";

      for (const img of files) {
        const imgPath = path.join(outputDir, img);

        const result = await Tesseract.recognize(imgPath, "eng");
        fullText += result.data.text + "\n";
      }

      return res.json({ text: fullText });
    }

    res.status(400).json({ message: "Unsupported file type" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "OCR failed" });
  }
};