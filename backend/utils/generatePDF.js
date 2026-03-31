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

const puppeteer = require("puppeteer");
const QRCode = require("qrcode");
const invoiceTemplate = require("../templates/invoiceTemplate");

module.exports = async (data) => {
  if (!data) throw new Error("No data provided");

  // Generate QR code with more detailed information
  const qrData = JSON.stringify({
    invoiceNo: data.invoiceNo,
    client: data.client,
    amount: data.total,
    date: data.date,
    company: data.company || "DocuGen"
  });
  
  const qrCode = await QRCode.toDataURL(qrData, {
    errorCorrectionLevel: 'H',
    margin: 1,
    width: 200
  });

  const html = invoiceTemplate(data, qrCode);

  const browser = await puppeteer.launch({
    headless: "new",
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--disable-gpu'
    ]
  });

  const page = await browser.newPage();
  
  // Set viewport for consistent rendering
  await page.setViewport({
    width: 1200,
    height: 800,
    deviceScaleFactor: 1
  });

  await page.setContent(html, { 
    waitUntil: "networkidle0",
    timeout: 30000 
  });

  const pdf = await page.pdf({
    format: "A4",
    printBackground: true,
    margin: {
      top: "20px",
      bottom: "20px",
      left: "20px",
      right: "20px"
    },
    preferCSSPageSize: true
  });

  await browser.close();
  return pdf;
};