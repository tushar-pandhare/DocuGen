// const express = require("express");
// const router = express.Router();
// const puppeteer = require("puppeteer");
// const upload = require("../utils/multer");
// router.post("/img", upload.single("image"), async (req, res) => {
//   try {
//     if (!req.file) {
//       return res.status(400).json({ error: "No file uploaded" });
//     }

//     const imageUrl = req.file.secure_url;
//     console.log("FILE:", req.file);
//     console.log("IMAGE URL:", req.file.secure_url);

//     const browser = await puppeteer.launch({
//       headless: true,
//       executablePath: puppeteer.executablePath(),
//       args: ["--no-sandbox", "--disable-setuid-sandbox"],
//     });

//     const page = await browser.newPage();

//     await page.setContent(
//       `
//       <html>
//         <body style="margin:0;display:flex;justify-content:center;align-items:center;">
//           <img id="img" src="${imageUrl}" style="max-width:100%;max-height:100%;" />
//         </body>
//       </html>
//       `,
//       { waitUntil: "networkidle0" },
//     );

//     await page.waitForSelector("#img");

//     const pdf = await page.pdf({
//       format: "A4",
//       printBackground: true,
//     });

//     await browser.close();

//     res.set({
//       "Content-Type": "application/pdf",
//       "Content-Disposition": "attachment; filename=image.pdf",
//     });

//     res.send(pdf);
//   } catch (err) {
//     console.error("FULL PDF ERROR:", err);
//     res.status(500).send(err.stack);
//   }
// });

// module.exports = router;

const express = require("express");
const router = express.Router();
const puppeteer = require("puppeteer");
const upload = require("../utils/multer");

router.post("/img", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const base64 = req.file.buffer.toString("base64");
    const mime = req.file.mimetype;
    const imgSrc = `data:${mime};base64,${base64}`;

    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();

    await page.setContent(
      `
      <html>
        <body style="margin:0;display:flex;justify-content:center;align-items:center;height:100vh;">
          <img src="${imgSrc}" style="max-width:100%;max-height:100%;" />
        </body>
      </html>
      `,
      { waitUntil: "load" }
    );

    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
    });

    await browser.close();

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "inline; filename=image.pdf");
    res.send(pdf);

  } catch (err) {
    console.error("PDF ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
