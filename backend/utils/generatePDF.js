// const puppeteer = require("puppeteer");
// const QRCode = require("qrcode");
// const invoiceTemplate = require("../templates/invoiceTemplate");

// module.exports = async (data) => {
//   if (!data) throw new Error("No data provided");

//   const browser = await puppeteer.launch({
//     headless: "new",
//   });

//   const page = await browser.newPage();
//   const qrCode = await QRCode.toDataURL(
//     `Invoice No: ${data.invoiceNo}
// Client: ${data.client}
// Amount: ${data.total}`
//   );

//   const html = invoiceTemplate(data, qrCode);

//   await page.setContent(html, { waitUntil: "networkidle0" });

//   const pdf = await page.pdf({
//     format: "A4",
//     printBackground: true,
//   });

//   await browser.close();
//   return pdf;
// };

// const puppeteer = require("puppeteer");
// const QRCode = require("qrcode");
// const invoiceTemplate = require("../templates/invoiceTemplate");

// module.exports = async (data) => {
//   if (!data) throw new Error("No data provided");

//   // Generate QR code with more detailed information
//   const qrData = JSON.stringify({
//     invoiceNo: data.invoiceNo,
//     client: data.client,
//     amount: data.total,
//     date: data.date,
//     company: data.company || "DocuGen"
//   });
  
//   const qrCode = await QRCode.toDataURL(qrData, {
//     errorCorrectionLevel: 'H',
//     margin: 1,
//     width: 200
//   });

//   const html = invoiceTemplate(data, qrCode);

//   const browser = await puppeteer.launch({
//     headless: "new",
//     args: [
//       '--no-sandbox',
//       '--disable-setuid-sandbox',
//       '--disable-dev-shm-usage',
//       '--disable-accelerated-2d-canvas',
//       '--disable-gpu'
//     ]
//   });

//   const page = await browser.newPage();
  
//   // Set viewport for consistent rendering
//   await page.setViewport({
//     width: 1200,
//     height: 800,
//     deviceScaleFactor: 1
//   });

//   await page.setContent(html, { 
//     waitUntil: "networkidle0",
//     timeout: 30000 
//   });

//   const pdf = await page.pdf({
//     format: "A4",
//     printBackground: true,
//     margin: {
//       top: "20px",
//       bottom: "20px",
//       left: "20px",
//       right: "20px"
//     },
//     preferCSSPageSize: true
//   });

//   await browser.close();
//   return pdf;
// };
// backend/utils/generatePDF.js
// const puppeteer = require("puppeteer");
// const QRCode = require("qrcode");
// const invoiceTemplate = require("../templates/invoiceTemplate");

// module.exports = async (data) => {
//   if (!data) throw new Error("No data provided");
  
//   console.log('Generating PDF for:', data.invoiceNo);
  
//   const browser = await puppeteer.launch({
//     headless: "new",
//     args: ['--no-sandbox', '--disable-setuid-sandbox']
//   });
  
//   try {
//     const page = await browser.newPage();
    
//     // Generate QR code
//     const qrData = JSON.stringify({
//       invoiceNo: data.invoiceNo,
//       client: data.client,
//       amount: data.total
//     });
    
//     const qrCode = await QRCode.toDataURL(qrData);
//     const html = invoiceTemplate(data, qrCode);
    
//     await page.setContent(html, { waitUntil: "networkidle0" });
    
//     const pdf = await page.pdf({
//       format: "A4",
//       printBackground: true,
//       margin: {
//         top: "20px",
//         bottom: "20px",
//         left: "20px",
//         right: "20px"
//       }
//     });
    
//     console.log('PDF generated successfully, size:', pdf.length);
//     return pdf;
    
//   } catch (err) {
//     console.error('PDF generation error:', err);
//     throw err;
//   } finally {
//     await browser.close();
//   }
// };
const PDFDocument = require("pdfkit");
const QRCode = require("qrcode");

module.exports = async (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      const doc = new PDFDocument({
        margin: 0,
        size: "A4",
      });

      const chunks = [];
      doc.on("data", (chunk) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);

      const W = doc.page.width;
      const H = doc.page.height;

      const colors = {
        primary: "#4f46e5",
        secondary: "#7c3aed",
        dark: "#0f172a",
        slate: "#334155",
        gray: "#64748b",
        light: "#f8fafc",
        border: "#e2e8f0",
        success: "#10b981",
        accent: "#f59e0b",
      };

      const money = (amt) =>
        `₹${Number(amt || 0).toLocaleString("en-IN")}`;

      const subtotal =
        data.subtotal ||
        data.items.reduce((sum, item) => sum + item.qty * item.price, 0);

      const gst = data.gst || subtotal * 0.18;
      const total = data.total || subtotal + gst;

      // ================= TOP HERO =================
      doc.rect(0, 0, W, 14).fill(colors.secondary);
      doc.rect(0, 14, W, 120).fill(colors.dark);

      // Left branding
      doc.font("Helvetica-Bold")
        .fontSize(30)
        .fillColor(colors.primary)
        .text("DOCUGEN", 45, 38);

      doc.font("Helvetica")
        .fontSize(10)
        .fillColor("white")
        .text("Professional Document Solutions", 45, 72);

      doc.fontSize(8)
        .fillColor("#94a3b8")
        .text("Smart • Secure • Fast", 45, 88);

      // Right invoice heading
      doc.font("Helvetica-Bold")
        .fontSize(34)
        .fillColor(colors.accent)
        .text("INVOICE", W - 220, 38, {
          width: 180,
          align: "right",
          lineBreak: false,
        });

      // Invoice number badge
      doc.roundedRect(W - 135, 85, 85, 24, 12).fill(colors.primary);

      doc.fontSize(9)
        .fillColor("white")
        .text(`#${data.invoiceNo || "0001"}`, W - 123, 92);

      // Paid status ribbon
      // doc.roundedRect(W - 250, 85, 90, 24, 12).fill(colors.success);

      // doc.font("Helvetica-Bold")
      //   .fontSize(9)
      //   .fillColor("white")
      //   .text("UNPAID", W - 228, 92);

      // ================= DETAILS STRIP =================
      let y = 155;

      doc.roundedRect(40, y, W - 80, 60, 10).fill(colors.light);

      doc.font("Helvetica-Bold")
        .fontSize(10)
        .fillColor(colors.gray)
        .text("INVOICE DETAILS", 55, y + 12);

      doc.font("Helvetica")
        .fontSize(10)
        .fillColor(colors.dark)
        .text(`Issue Date: ${data.date}`, 55, y + 34)
        .text(`Due Date: ${data.dueDate}`, 220, y + 34)
        .text("Payment Terms: Net 15", 390, y + 34);

      // ================= BILLING SECTION =================
      y = 235;

      const cardH = 135;

      // Bill To
      doc.roundedRect(40, y, 250, cardH, 12).fill(colors.light);

      doc.rect(40, y, 5, cardH).fill(colors.primary);

      doc.font("Helvetica-Bold")
        .fontSize(10)
        .fillColor(colors.primary)
        .text("BILL TO", 58, y + 15);

      doc.fontSize(14)
        .fillColor(colors.dark)
        .text(data.client || "N/A", 58, y + 42);

      doc.font("Helvetica")
        .fontSize(9)
        .fillColor(colors.gray)
        .text(data.clientEmail || "", 58, y + 70)
        .text(data.clientPhone || "", 58, y + 88);

      // From
      doc.roundedRect(310, y, 250, cardH, 12).fill(colors.light);

      doc.rect(310, y, 5, cardH).fill(colors.secondary);

      doc.font("Helvetica-Bold")
        .fontSize(10)
        .fillColor(colors.secondary)
        .text("FROM", 328, y + 15);

      doc.fontSize(14)
        .fillColor(colors.dark)
        .text(data.company || "DocuGen", 328, y + 42);

      doc.font("Helvetica")
        .fontSize(9)
        .fillColor(colors.gray)
        .text("123 Business Avenue", 328, y + 70)
        .text("Mumbai, India - 400001", 328, y + 86)
        .text("support@docugen.com", 328, y + 102);

      // ================= ITEMS TABLE =================
      y = 395;

      doc.roundedRect(40, y, 520, 34, 6).fill(colors.primary);

      doc.font("Helvetica-Bold")
        .fontSize(10)
        .fillColor("white")
        .text("ITEM DESCRIPTION", 55, y + 11)
        .text("QTY", 305, y + 11)
        .text("PRICE", 385, y + 11)
        .text("TOTAL", 475, y + 11);

      y += 42;

      data.items.forEach((item, i) => {
        const rowTotal = item.qty * item.price;

        doc.roundedRect(40, y - 4, 520, 28, 4)
          .fill(i % 2 === 0 ? "#ffffff" : colors.light);

        doc.font("Helvetica")
          .fontSize(9)
          .fillColor(colors.slate)
          .text(item.name, 55, y)
          .text(item.qty.toString(), 305, y)
          .text(money(item.price), 385, y)
          .text(money(rowTotal), 475, y);

        y += 30;
      });

      // ================= TOTAL SUMMARY =================
      const summaryY = y + 20;

      doc.roundedRect(W - 220, summaryY, 180, 125, 12)
        .fill(colors.light);

      doc.font("Helvetica")
        .fontSize(10)
        .fillColor(colors.gray)
        .text("Subtotal", W - 205, summaryY + 18)
        .text(money(subtotal), W - 105, summaryY + 18);

      doc.text("GST (18%)", W - 205, summaryY + 45)
        .text(money(gst), W - 105, summaryY + 45);

      doc.moveTo(W - 205, summaryY + 72)
        .lineTo(W - 55, summaryY + 72)
        .stroke(colors.border);

      doc.font("Helvetica-Bold")
        .fontSize(15)
        .fillColor(colors.primary)
        .text("Grand Total", W - 205, summaryY + 88)
        .text(money(total), W - 105, summaryY + 88);

      // ================= PAYMENT + QR =================
      const payY = summaryY + 155;

      doc.roundedRect(40, payY, 250, 100, 12).fill(colors.light);

      doc.font("Helvetica-Bold")
        .fontSize(10)
        .fillColor(colors.gray)
        .text("PAYMENT DETAILS", 55, payY + 15);

      doc.font("Helvetica")
        .fontSize(9)
        .fillColor(colors.dark)
        .text("Bank: HDFC Bank", 55, payY + 40)
        .text("Account: 123456789012", 55, payY + 55)
        .text("IFSC: HDFC0001234", 55, payY + 70)
        .text("UPI: docugen@hdfcbank", 55, payY + 85);

      const qrData = JSON.stringify({
        invoiceNo: data.invoiceNo,
        client: data.client,
        total,
      });

      const qr = await QRCode.toBuffer(qrData);

      doc.roundedRect(W - 150, payY, 95, 110, 12)
        .fill("white")
        .stroke(colors.border);

      doc.image(qr, W - 138, payY + 10, { width: 72 });

      doc.fontSize(7)
        .fillColor(colors.gray)
        .text("Scan to verify", W - 134, payY + 87);

      // ================= FOOTER =================
      doc.font("Helvetica-Bold")
        .fontSize(12)
        .fillColor(colors.primary)
        .text("Thank you for your business!", 0, H - 85, {
          align: "center",
        });

      doc.font("Helvetica")
        .fontSize(8)
        .fillColor(colors.gray)
        .text(
          "This is a digitally generated invoice. No signature required.",
          0,
          H - 67,
          { align: "center" }
        );

      doc.rect(0, H - 22, W, 22).fill(colors.dark);

      doc.fontSize(7)
        .fillColor("white")
        .text("© 2026 DocuGen • Professional Document Solutions", 0, H - 16, {
          align: "center",
        });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
};