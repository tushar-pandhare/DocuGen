const express = require("express");
const router = express.Router();
const generatePDF = require("../utils/generatePDF");

router.post("/download", async (req, res) => {
  try {
    const pdf = await generatePDF(req.body);

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": "attachment; filename=invoice.pdf",
    });

    res.send(pdf);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "PDF generation failed" });
  }
});

router.post("/preview", async (req, res) => {
  try {
    const pdf = await generatePDF(req.body);
    res.contentType("application/pdf");
    res.send(pdf);
  } catch (err) {
    res.status(500).json({ error: "Preview failed" });
  }
});

module.exports = router;
