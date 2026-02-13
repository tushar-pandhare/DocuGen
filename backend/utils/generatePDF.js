const puppeteer = require("puppeteer");
const QRCode = require("qrcode");
const invoiceTemplate = require("../templates/invoiceTemplate");

module.exports = async (data) => {
  if (!data) throw new Error("No data provided");

  const browser = await puppeteer.launch({
    headless: "new",
  });

  const page = await browser.newPage();
  const qrCode = await QRCode.toDataURL(
    `Invoice No: ${data.invoiceNo}
Client: ${data.client}
Amount: ${data.total}`
  );

  const html = invoiceTemplate(data, qrCode);

  await page.setContent(html, { waitUntil: "networkidle0" });

  const pdf = await page.pdf({
    format: "A4",
    printBackground: true,
  });

  await browser.close();
  return pdf;
};
