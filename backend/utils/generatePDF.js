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
        `₹${Number(amt || 0).toLocaleString("en-IN", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`;

      const subtotal = data.subtotal ??
        data.items.reduce((sum, item) => sum + item.qty * item.price, 0);
      const gstRate = data.gstRate ?? 18;
      const gst = data.gst ?? Math.round(subtotal * gstRate) / 100;
      const total = data.total ?? subtotal + gst;

      // ================= TOP HERO =================
      doc.rect(0, 0, W, 14).fill(colors.secondary);
      doc.rect(0, 14, W, 120).fill(colors.dark);

      // Left branding
      doc.font("Helvetica-Bold")
        .fontSize(30)
        .fillColor(colors.primary)
        .text(data.company || "DOCUGEN", 45, 38, { width: 260, ellipsis: true });

      doc.font("Helvetica")
        .fontSize(10)
        .fillColor("white")
        .text("Invoice issued to your client", 45, 72);

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

      const statusColor = data.status === "paid"
        ? colors.success
        : data.status === "overdue" ? "#dc2626" : colors.accent;
      doc.roundedRect(W - 245, 85, 90, 24, 12).fill(statusColor);
      doc.font("Helvetica-Bold")
        .fontSize(8)
        .fillColor("white")
        .text((data.status || "pending").toUpperCase(), W - 238, 93, {
          width: 76,
          align: "center",
        });

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
        .text(data.company || "DocuGen", 328, y + 42, { width: 210 });

      doc.font("Helvetica")
        .fontSize(9)
        .fillColor(colors.gray)
        .text("Invoice issuer", 328, y + 70)
        .text("Business details not provided", 328, y + 86);

      // ================= ITEMS TABLE =================
      y = 395;

      const drawItemsHeader = (headerY) => {
        doc.roundedRect(40, headerY, 520, 34, 6).fill(colors.primary);
        doc.font("Helvetica-Bold")
          .fontSize(10)
          .fillColor("white")
          .text("ITEM DESCRIPTION", 55, headerY + 11)
          .text("QTY", 305, headerY + 11)
          .text("PRICE", 385, headerY + 11)
          .text("TOTAL", 475, headerY + 11);
      };
      const drawContinuationHeader = () => {
        doc.addPage();
        doc.rect(0, 0, W, 48).fill(colors.dark);
        doc.font("Helvetica-Bold")
          .fontSize(14)
          .fillColor("white")
          .text("INVOICE CONTINUED", 40, 17);
        doc.font("Helvetica")
          .fontSize(10)
          .text(`#${data.invoiceNo || "0001"}`, W - 200, 19, {
            width: 160,
            align: "right",
          });
        drawItemsHeader(78);
        y = 122;
      };

      drawItemsHeader(y);
      y += 42;

      data.items.forEach((item, i) => {
        if (y + 30 > H - 225) drawContinuationHeader();
        const rowTotal = item.qty * item.price;

        doc.roundedRect(40, y - 4, 520, 28, 4)
          .fill(i % 2 === 0 ? "#ffffff" : colors.light);

        doc.font("Helvetica")
          .fontSize(9)
          .fillColor(colors.slate)
          .text(item.name, 55, y, { width: 235, height: 24, ellipsis: true })
          .text(item.qty.toString(), 305, y)
          .text(money(item.price), 385, y)
          .text(money(rowTotal), 475, y);

        y += 30;
      });

      // ================= TOTAL SUMMARY =================
      let summaryY = y + 20;
      if (summaryY + 105 > H - 100) {
        drawContinuationHeader();
        summaryY = y + 20;
      }

      doc.roundedRect(W - 220, summaryY, 180, 105, 12)
        .fill(colors.light);

      doc.font("Helvetica")
        .fontSize(10)
        .fillColor(colors.gray)
        .text("Subtotal", W - 205, summaryY + 14)
        .text(money(subtotal), W - 105, summaryY + 14);

      doc.text(`GST (${gstRate}%)`, W - 205, summaryY + 38)
        .text(money(gst), W - 105, summaryY + 38);

      doc.moveTo(W - 205, summaryY + 62)
        .lineTo(W - 55, summaryY + 62)
        .stroke(colors.border);

      doc.font("Helvetica-Bold")
        .fontSize(13)
        .fillColor(colors.primary)
        .text("Total Due", W - 205, summaryY + 76)
        .text(money(total), W - 105, summaryY + 76);

      doc.roundedRect(40, summaryY, 250, 105, 12).fill(colors.light);

      doc.font("Helvetica-Bold")
        .fontSize(10)
        .fillColor(colors.gray)
        .text("NOTES", 55, summaryY + 14);

      doc.font("Helvetica")
        .fontSize(9)
        .fillColor(colors.dark)
        .text(data.notes || "Thank you for your business.", 55, summaryY + 35, {
          width: 220,
          height: 58,
          ellipsis: true,
        });

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
        .text(`© ${new Date().getFullYear()} ${data.company || "DocuGen"}`, 0, H - 16, {
          align: "center",
        });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
};