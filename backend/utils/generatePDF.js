const puppeteer = require("puppeteer");
const QRCode = require("qrcode");
const template = require("../templates/invoiceTemplate");

module.exports = async (data) => {
  // Generate QR Code
  const qrCode = await QRCode.toDataURL(
    `Invoice:${data.invoiceNo}|Amount:${data.total}`
  );

  const browser = await puppeteer.launch({
    headless: "new"
  });

  const page = await browser.newPage();
  const html = template(data, qrCode);

  await page.setContent(html, { waitUntil: "networkidle0" });

  const pdf = await page.pdf({
    format: "A4",
    printBackground: true,
    margin: {
      top: "20mm",
      bottom: "30mm",
      left: "15mm",
      right: "15mm"
    }
  });

  await browser.close();
  return pdf;
};
