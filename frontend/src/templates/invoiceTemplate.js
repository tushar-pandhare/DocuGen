// module.exports = (data, qrCode) => `
// <!DOCTYPE html>
// <html>
// <head>
// <meta charset="UTF-8">

// <!-- Google Font -->
// <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600&display=swap" rel="stylesheet">

// <style>
//   body {
//     font-family: 'Poppins', sans-serif;
//     padding: 40px;
//     color: #333;
//   }

//   header {
//     display: flex;
//     justify-content: space-between;
//     align-items: center;
//     border-bottom: 2px solid #000;
//     padding-bottom: 10px;
//   }

//   header img {
//     height: 60px;
//   }

//   h1 {
//     margin: 0;
//   }

//   .info {
//     margin-top: 20px;
//     display: flex;
//     justify-content: space-between;
//   }

//   table {
//     width: 100%;
//     border-collapse: collapse;
//     margin-top: 30px;
//   }

//   th, td {
//     border: 1px solid #ddd;
//     padding: 10px;
//   }

//   th {
//     background: #f0f0f0;
//   }

//   .total {
//     text-align: right;
//     margin-top: 20px;
//     font-size: 18px;
//     font-weight: 600;
//   }

//   .qr {
//     margin-top: 30px;
//     text-align: right;
//   }

//   footer {
//     position: fixed;
//     bottom: 20px;
//     left: 0;
//     right: 0;
//     text-align: center;
//     font-size: 12px;
//     color: gray;
//   }

//   .pageNumber:after {
//     content: counter(page);
//   }
// </style>
// </head>

// <body>

// <header>
//   <img src="http://localhost:5000/logo.png" />
//   <h1>INVOICE</h1>
// </header>

// <div class="info">
//   <div>
//     <p><strong>Client:</strong> ${data.client}</p>
//     <p><strong>Date:</strong> ${data.date}</p>
//   </div>
//   <div>
//     <p><strong>Invoice No:</strong> ${data.invoiceNo}</p>
//   </div>
// </div>

// <table>
//   <tr>
//     <th>Item</th>
//     <th>Qty</th>
//     <th>Price</th>
//     <th>Total</th>
//   </tr>

//   ${data.items.map(i => `
//     <tr>
//       <td>${i.name}</td>
//       <td>${i.qty}</td>
//       <td>₹${i.price}</td>
//       <td>₹${i.qty * i.price}</td>
//     </tr>
//   `).join("")}
// </table>

// <div class="total">
//   Grand Total: ₹${data.total}
// </div>

// <div class="qr">
//   <img src="${qrCode}" width="120" />
//   <p>Scan to Verify</p>
// </div>

// <footer>
//   Page <span class="pageNumber"></span>
// </footer>

// </body>
// </html>
// `;
module.exports = (data, qrCode) => `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Invoice ${data.invoiceNo}</title>

<!-- Google Fonts -->
<link href="https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,300;14..32,400;14..32,500;14..32,600;14..32,700&display=swap" rel="stylesheet">
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&display=swap" rel="stylesheet">

<style>
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: 'Inter', sans-serif;
    background: linear-gradient(135deg, #f5f7fa 0%, #e9ecef 100%);
    padding: 40px;
    color: #1a1a2e;
  }

  .invoice-container {
    max-width: 1000px;
    margin: 0 auto;
    background: white;
    border-radius: 24px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(0, 0, 0, 0.02);
    overflow: hidden;
  }

  /* Header Section */
  .invoice-header {
    background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
    padding: 40px 48px;
    color: white;
    position: relative;
    overflow: hidden;
  }

  .invoice-header::before {
    content: '';
    position: absolute;
    top: -50%;
    right: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
    pointer-events: none;
  }

  .header-top {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 40px;
    position: relative;
    z-index: 1;
  }

  .company-info h1 {
    font-family: 'Playfair Display', serif;
    font-size: 42px;
    font-weight: 700;
    letter-spacing: -0.02em;
    margin-bottom: 8px;
    background: linear-gradient(135deg, #fff 0%, #a5b4fc 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .company-tagline {
    font-size: 12px;
    opacity: 0.7;
    letter-spacing: 1px;
  }

  .invoice-title {
    text-align: right;
  }

  .invoice-title h2 {
    font-size: 48px;
    font-weight: 800;
    letter-spacing: 2px;
    margin-bottom: 8px;
    background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .invoice-badge {
    background: rgba(255,255,255,0.2);
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 500;
    display: inline-block;
  }

  /* Bill To Section */
  .bill-section {
    padding: 40px 48px;
    background: white;
    border-bottom: 1px solid #e2e8f0;
  }

  .bill-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 40px;
  }

  .bill-card {
    background: #f8fafc;
    padding: 24px;
    border-radius: 16px;
    border: 1px solid #e2e8f0;
  }

  .bill-card h3 {
    font-size: 14px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 1px;
    color: #64748b;
    margin-bottom: 16px;
  }

  .client-name {
    font-size: 20px;
    font-weight: 700;
    color: #0f172a;
    margin-bottom: 8px;
  }

  .client-details {
    font-size: 14px;
    color: #475569;
    line-height: 1.6;
  }

  .invoice-meta {
    display: flex;
    gap: 24px;
    margin-top: 24px;
    padding-top: 24px;
    border-top: 1px solid #e2e8f0;
  }

  .meta-item {
    flex: 1;
  }

  .meta-label {
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    color: #64748b;
    letter-spacing: 0.5px;
    margin-bottom: 4px;
  }

  .meta-value {
    font-size: 16px;
    font-weight: 600;
    color: #0f172a;
  }

  /* Items Table */
  .items-section {
    padding: 0 48px 40px 48px;
  }

  .items-table {
    width: 100%;
    border-collapse: separate;
    border-spacing: 0;
  }

  .items-table th {
    text-align: left;
    padding: 16px 12px;
    background: #f1f5f9;
    font-size: 12px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: #475569;
    border-bottom: 2px solid #e2e8f0;
  }

  .items-table td {
    padding: 16px 12px;
    border-bottom: 1px solid #e2e8f0;
    font-size: 14px;
    color: #334155;
  }

  .items-table tr:last-child td {
    border-bottom: none;
  }

  .item-name {
    font-weight: 600;
    color: #0f172a;
  }

  /* Totals Section */
  .totals-section {
    background: #f8fafc;
    padding: 32px 48px;
    border-radius: 16px;
    margin: 0 48px 40px 48px;
  }

  .totals-grid {
    display: flex;
    justify-content: flex-end;
  }

  .totals-card {
    width: 300px;
  }

  .total-row {
    display: flex;
    justify-content: space-between;
    padding: 12px 0;
    border-bottom: 1px solid #e2e8f0;
  }

  .total-row:last-child {
    border-bottom: none;
    padding-top: 16px;
    margin-top: 8px;
    border-top: 2px solid #cbd5e1;
  }

  .total-label {
    font-weight: 500;
    color: #475569;
  }

  .total-amount {
    font-weight: 600;
    color: #0f172a;
  }

  .grand-total-label {
    font-size: 18px;
    font-weight: 700;
    color: #0f172a;
  }

  .grand-total-amount {
    font-size: 24px;
    font-weight: 800;
    color: #f59e0b;
  }

  /* Footer Section */
  .invoice-footer {
    background: #0f172a;
    padding: 32px 48px;
    color: #94a3b8;
  }

  .footer-grid {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 24px;
  }

  .qr-section {
    text-align: center;
  }

  .qr-section img {
    width: 100px;
    height: 100px;
    border-radius: 12px;
    background: white;
    padding: 8px;
    margin-bottom: 8px;
  }

  .qr-text {
    font-size: 10px;
    color: #64748b;
  }

  .payment-info {
    text-align: right;
  }

  .payment-info p {
    font-size: 12px;
    margin-bottom: 4px;
  }

  .payment-info strong {
    color: white;
  }

  .copyright {
    text-align: center;
    margin-top: 24px;
    padding-top: 24px;
    border-top: 1px solid #1e293b;
    font-size: 11px;
  }

  /* Watermark */
  .watermark {
    position: fixed;
    bottom: 20px;
    right: 20px;
    opacity: 0.05;
    font-size: 80px;
    font-weight: 800;
    pointer-events: none;
    z-index: 0;
  }

  @media print {
    body {
      background: white;
      padding: 0;
    }
    .invoice-container {
      box-shadow: none;
      border-radius: 0;
    }
    .watermark {
      opacity: 0.03;
    }
  }
</style>
</head>
<body>

<div class="watermark">INVOICE</div>

<div class="invoice-container">
  
  <!-- Header -->
  <div class="invoice-header">
    <div class="header-top">
      <div class="company-info">
        <h1>DocuGen</h1>
        <div class="company-tagline">Professional Document Solutions</div>
      </div>
      <div class="invoice-title">
        <h2>INVOICE</h2>
        <div class="invoice-badge">TAX INVOICE</div>
      </div>
    </div>
  </div>

  <!-- Bill To Section -->
  <div class="bill-section">
    <div class="bill-grid">
      <div class="bill-card">
        <h3>BILL TO</h3>
        <div class="client-name">${data.client || 'N/A'}</div>
        <div class="client-details">
          ${data.clientEmail ? `<div>📧 ${data.clientEmail}</div>` : ''}
          ${data.clientPhone ? `<div>📞 ${data.clientPhone}</div>` : ''}
        </div>
      </div>
      <div class="bill-card">
        <h3>FROM</h3>
        <div class="client-name">${data.company || 'DocuGen Inc.'}</div>
        <div class="client-details">
          <div>🏢 123 Business Avenue</div>
          <div>📧 support@docugen.com</div>
          <div>📞 +91 98765 43210</div>
        </div>
      </div>
    </div>
    
    <div class="invoice-meta">
      <div class="meta-item">
        <div class="meta-label">INVOICE NUMBER</div>
        <div class="meta-value">#${data.invoiceNo}</div>
      </div>
      <div class="meta-item">
        <div class="meta-label">INVOICE DATE</div>
        <div class="meta-value">${data.date || new Date().toLocaleDateString()}</div>
      </div>
      <div class="meta-item">
        <div class="meta-label">DUE DATE</div>
        <div class="meta-value">${data.dueDate || new Date(Date.now() + 15*24*60*60*1000).toLocaleDateString()}</div>
      </div>
    </div>
  </div>

  <!-- Items Table -->
  <div class="items-section">
    <table class="items-table">
      <thead>
        <tr>
          <th>ITEM DESCRIPTION</th>
          <th style="text-align: center">QUANTITY</th>
          <th style="text-align: right">UNIT PRICE</th>
          <th style="text-align: right">TOTAL</th>
        </tr>
      </thead>
      <tbody>
        ${data.items.map(item => `
          <tr>
            <td class="item-name">${item.name}</td>
            <td style="text-align: center">${item.qty}</td>
            <td style="text-align: right">₹${item.price.toLocaleString('en-IN')}</td>
            <td style="text-align: right; font-weight: 600">₹${(item.qty * item.price).toLocaleString('en-IN')}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  </div>

  <!-- Totals -->
  <div class="totals-section">
    <div class="totals-grid">
      <div class="totals-card">
        <div class="total-row">
          <span class="total-label">Subtotal</span>
          <span class="total-amount">₹${data.total.toLocaleString('en-IN')}</span>
        </div>
        <div class="total-row">
          <span class="total-label">Tax (GST 18%)</span>
          <span class="total-amount">₹${(data.total * 0.18).toLocaleString('en-IN')}</span>
        </div>
        <div class="total-row">
          <span class="total-label grand-total-label">Grand Total</span>
          <span class="total-amount grand-total-amount">₹${(data.total * 1.18).toLocaleString('en-IN')}</span>
        </div>
      </div>
    </div>
  </div>

  <!-- Footer with QR -->
  <div class="invoice-footer">
    <div class="footer-grid">
      <div class="qr-section">
        <img src="${qrCode}" alt="QR Code" />
        <div class="qr-text">Scan to Verify Invoice</div>
      </div>
      <div class="payment-info">
        <p><strong>Payment Information</strong></p>
        <p>Bank: HDFC Bank</p>
        <p>Account: 123456789012</p>
        <p>IFSC: HDFC0001234</p>
        <p>UPI: docugen@hdfcbank</p>
      </div>
    </div>
    <div class="copyright">
      © ${new Date().getFullYear()} DocuGen. All rights reserved. | This is a computer generated invoice
    </div>
  </div>
</div>

</body>
</html>
`;