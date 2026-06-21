// backend/templates/invoiceTemplate.js - Simplified test version
module.exports = (data, qrCode) => {
  // Helper for safe number formatting
  const formatMoney = (amount) => {
    if (amount === undefined || amount === null || isNaN(amount)) return '₹0';
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  // Calculate totals safely
  const subtotal = data?.subtotal || data?.total || 0;
  const gst = data?.gst || (subtotal * 0.18);
  const total = data?.total || (subtotal + gst);

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Invoice ${data?.invoiceNo || '0001'}</title>
<style>
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
  body {
    font-family: Arial, sans-serif;
    padding: 40px;
    background: #f5f5f5;
  }
  .invoice {
    max-width: 800px;
    margin: 0 auto;
    background: white;
    border-radius: 12px;
    padding: 40px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  }
  .header {
    text-align: center;
    border-bottom: 2px solid #4f46e5;
    padding-bottom: 20px;
    margin-bottom: 30px;
  }
  .header h1 {
    color: #4f46e5;
    font-size: 32px;
  }
  .info-section {
    display: flex;
    justify-content: space-between;
    margin-bottom: 30px;
  }
  .bill-to, .invoice-details {
    flex: 1;
  }
  .bill-to h3, .invoice-details h3 {
    color: #666;
    font-size: 14px;
    margin-bottom: 10px;
  }
  .bill-to p, .invoice-details p {
    margin: 5px 0;
    font-size: 14px;
  }
  table {
    width: 100%;
    border-collapse: collapse;
    margin: 20px 0;
  }
  th, td {
    border: 1px solid #ddd;
    padding: 12px;
    text-align: left;
  }
  th {
    background: #f8fafc;
    font-weight: 600;
  }
  .totals {
    text-align: right;
    margin-top: 20px;
    padding-top: 20px;
    border-top: 1px solid #ddd;
  }
  .totals p {
    margin: 5px 0;
  }
  .grand-total {
    font-size: 18px;
    font-weight: bold;
    color: #4f46e5;
  }
  .qr {
    text-align: center;
    margin-top: 30px;
    padding-top: 20px;
    border-top: 1px solid #ddd;
  }
  .qr img {
    width: 100px;
  }
  .footer {
    text-align: center;
    margin-top: 30px;
    font-size: 12px;
    color: #666;
  }
</style>
</head>
<body>
<div class="invoice">
  <div class="header">
    <h1>INVOICE</h1>
    <p>${data?.company || 'DocuGen Inc.'}</p>
  </div>
  
  <div class="info-section">
    <div class="bill-to">
      <h3>BILL TO:</h3>
      <p><strong>${data?.client || 'N/A'}</strong></p>
      ${data?.clientEmail ? `<p>📧 ${data.clientEmail}</p>` : ''}
      ${data?.clientPhone ? `<p>📞 ${data.clientPhone}</p>` : ''}
    </div>
    <div class="invoice-details">
      <h3>INVOICE DETAILS:</h3>
      <p>Invoice No: #${data?.invoiceNo || '0001'}</p>
      <p>Date: ${data?.date || new Date().toLocaleDateString()}</p>
      <p>Due Date: ${data?.dueDate || 'N/A'}</p>
    </div>
  </div>
  
  <table>
    <thead>
      <tr><th>Item</th><th>Qty</th><th>Price</th><th>Total</th></tr>
    </thead>
    <tbody>
      ${(data?.items || []).map(item => `
        <tr>
          <td>${item.name || 'Service'}</td>
          <td>${item.qty || 1}</td>
          <td>${formatMoney(item.price || 0)}</td>
          <td>${formatMoney((item.qty || 1) * (item.price || 0))}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>
  
  <div class="totals">
    <p>Subtotal: ${formatMoney(subtotal)}</p>
    <p>GST (18%): ${formatMoney(gst)}</p>
    <p class="grand-total">Grand Total: ${formatMoney(total)}</p>
  </div>
  
  <div class="qr">
    <img src="${qrCode}" alt="QR Code" />
    <p>Scan to verify</p>
  </div>
  
  <div class="footer">
    <p>Thank you for your business!</p>
    <p>This is a computer generated invoice</p>
  </div>
</div>
</body>
</html>`;
};

// module.exports = (data, qrCode) => {
//   // Ensure data has all required fields with defaults
//   const safeData = {
//     client: data?.client || 'N/A',
//     clientEmail: data?.clientEmail || '',
//     clientPhone: data?.clientPhone || '',
//     company: data?.company || 'DocuGen Inc.',
//     invoiceNo: data?.invoiceNo || '0001',
//     date: data?.date || new Date().toLocaleDateString(),
//     dueDate: data?.dueDate || new Date(Date.now() + 15*24*60*60*1000).toLocaleDateString(),
//     items: data?.items || [],
//     subtotal: data?.subtotal || data?.total || 0,
//     total: data?.total || 0,
//     gst: data?.gst || (data?.total ? data.total * 0.18 : 0)
//   };

//   // Helper function for safe number formatting
//   const formatCurrency = (amount) => {
//     if (amount === undefined || amount === null || isNaN(amount)) return '₹0';
//     return `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
//   };

//   return `
// <!DOCTYPE html>
// <html>
// <head>
// <meta charset="UTF-8">
// <meta name="viewport" content="width=device-width, initial-scale=1.0">
// <title>Invoice ${safeData.invoiceNo}</title>

// <!-- Google Fonts -->
// <link href="https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,300;14..32,400;14..32,500;14..32,600;14..32,700&display=swap" rel="stylesheet">
// <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&display=swap" rel="stylesheet">

// <style>
//   * {
//     margin: 0;
//     padding: 0;
//     box-sizing: border-box;
//   }

//   body {
//     font-family: 'Inter', sans-serif;
//     background: linear-gradient(135deg, #f5f7fa 0%, #e9ecef 100%);
//     padding: 40px;
//     color: #1a1a2e;
//   }

//   .invoice-container {
//     max-width: 1000px;
//     margin: 0 auto;
//     background: white;
//     border-radius: 24px;
//     box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(0, 0, 0, 0.02);
//     overflow: hidden;
//   }

//   /* Header Section */
//   .invoice-header {
//     background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
//     padding: 40px 48px;
//     color: white;
//     position: relative;
//     overflow: hidden;
//   }

//   .invoice-header::before {
//     content: '';
//     position: absolute;
//     top: -50%;
//     right: -50%;
//     width: 200%;
//     height: 200%;
//     background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
//     pointer-events: none;
//   }

//   .header-top {
//     display: flex;
//     justify-content: space-between;
//     align-items: flex-start;
//     margin-bottom: 40px;
//     position: relative;
//     z-index: 1;
//   }

//   .company-info h1 {
//     font-family: 'Playfair Display', serif;
//     font-size: 42px;
//     font-weight: 700;
//     letter-spacing: -0.02em;
//     margin-bottom: 8px;
//     background: linear-gradient(135deg, #fff 0%, #a5b4fc 100%);
//     -webkit-background-clip: text;
//     -webkit-text-fill-color: transparent;
//     background-clip: text;
//   }

//   .company-tagline {
//     font-size: 12px;
//     opacity: 0.7;
//     letter-spacing: 1px;
//   }

//   .invoice-title {
//     text-align: right;
//   }

//   .invoice-title h2 {
//     font-size: 48px;
//     font-weight: 800;
//     letter-spacing: 2px;
//     margin-bottom: 8px;
//     background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
//     -webkit-background-clip: text;
//     -webkit-text-fill-color: transparent;
//     background-clip: text;
//   }

//   .invoice-badge {
//     background: rgba(255,255,255,0.2);
//     padding: 4px 12px;
//     border-radius: 20px;
//     font-size: 12px;
//     font-weight: 500;
//     display: inline-block;
//   }

//   /* Bill To Section */
//   .bill-section {
//     padding: 40px 48px;
//     background: white;
//     border-bottom: 1px solid #e2e8f0;
//   }

//   .bill-grid {
//     display: grid;
//     grid-template-columns: 1fr 1fr;
//     gap: 40px;
//   }

//   .bill-card {
//     background: #f8fafc;
//     padding: 24px;
//     border-radius: 16px;
//     border: 1px solid #e2e8f0;
//   }

//   .bill-card h3 {
//     font-size: 14px;
//     font-weight: 600;
//     text-transform: uppercase;
//     letter-spacing: 1px;
//     color: #64748b;
//     margin-bottom: 16px;
//   }

//   .client-name {
//     font-size: 20px;
//     font-weight: 700;
//     color: #0f172a;
//     margin-bottom: 8px;
//   }

//   .client-details {
//     font-size: 14px;
//     color: #475569;
//     line-height: 1.6;
//   }

//   .invoice-meta {
//     display: flex;
//     gap: 24px;
//     margin-top: 24px;
//     padding-top: 24px;
//     border-top: 1px solid #e2e8f0;
//   }

//   .meta-item {
//     flex: 1;
//   }

//   .meta-label {
//     font-size: 11px;
//     font-weight: 600;
//     text-transform: uppercase;
//     color: #64748b;
//     letter-spacing: 0.5px;
//     margin-bottom: 4px;
//   }

//   .meta-value {
//     font-size: 16px;
//     font-weight: 600;
//     color: #0f172a;
//   }

//   /* Items Table */
//   .items-section {
//     padding: 0 48px 40px 48px;
//   }

//   .items-table {
//     width: 100%;
//     border-collapse: collapse;
//   }

//   .items-table th {
//     text-align: left;
//     padding: 16px 12px;
//     background: #f1f5f9;
//     font-size: 12px;
//     font-weight: 600;
//     text-transform: uppercase;
//     letter-spacing: 0.5px;
//     color: #475569;
//     border-bottom: 2px solid #e2e8f0;
//   }

//   .items-table td {
//     padding: 16px 12px;
//     border-bottom: 1px solid #e2e8f0;
//     font-size: 14px;
//     color: #334155;
//   }

//   .items-table tr:last-child td {
//     border-bottom: none;
//   }

//   .item-name {
//     font-weight: 600;
//     color: #0f172a;
//   }

//   /* Totals Section */
//   .totals-section {
//     background: #f8fafc;
//     padding: 32px 48px;
//     border-radius: 16px;
//     margin: 0 48px 40px 48px;
//   }

//   .totals-grid {
//     display: flex;
//     justify-content: flex-end;
//   }

//   .totals-card {
//     width: 300px;
//   }

//   .total-row {
//     display: flex;
//     justify-content: space-between;
//     padding: 12px 0;
//     border-bottom: 1px solid #e2e8f0;
//   }

//   .total-row:last-child {
//     border-bottom: none;
//     padding-top: 16px;
//     margin-top: 8px;
//     border-top: 2px solid #cbd5e1;
//   }

//   .total-label {
//     font-weight: 500;
//     color: #475569;
//   }

//   .total-amount {
//     font-weight: 600;
//     color: #0f172a;
//   }

//   .grand-total-label {
//     font-size: 18px;
//     font-weight: 700;
//     color: #0f172a;
//   }

//   .grand-total-amount {
//     font-size: 24px;
//     font-weight: 800;
//     color: #f59e0b;
//   }

//   /* Footer Section */
//   .invoice-footer {
//     background: #0f172a;
//     padding: 32px 48px;
//     color: #94a3b8;
//   }

//   .footer-grid {
//     display: flex;
//     justify-content: space-between;
//     align-items: center;
//     flex-wrap: wrap;
//     gap: 24px;
//   }

//   .qr-section {
//     text-align: center;
//   }

//   .qr-section img {
//     width: 100px;
//     height: 100px;
//     border-radius: 12px;
//     background: white;
//     padding: 8px;
//     margin-bottom: 8px;
//   }

//   .qr-text {
//     font-size: 10px;
//     color: #64748b;
//   }

//   .payment-info {
//     text-align: right;
//   }

//   .payment-info p {
//     font-size: 12px;
//     margin-bottom: 4px;
//   }

//   .payment-info strong {
//     color: white;
//   }

//   .copyright {
//     text-align: center;
//     margin-top: 24px;
//     padding-top: 24px;
//     border-top: 1px solid #1e293b;
//     font-size: 11px;
//   }

//   @media print {
//     body {
//       background: white;
//       padding: 0;
//     }
//     .invoice-container {
//       box-shadow: none;
//       border-radius: 0;
//     }
//   }
// </style>
// </head>
// <body>

// <div class="invoice-container">
  
//   <!-- Header -->
//   <div class="invoice-header">
//     <div class="header-top">
//       <div class="company-info">
//         <h1>${safeData.company || 'DocuGen'}</h1>
//         <div class="company-tagline">Professional Document Solutions</div>
//       </div>
//       <div class="invoice-title">
//         <h2>INVOICE</h2>
//         <div class="invoice-badge">TAX INVOICE</div>
//       </div>
//     </div>
//   </div>

//   <!-- Bill To Section -->
//   <div class="bill-section">
//     <div class="bill-grid">
//       <div class="bill-card">
//         <h3>BILL TO</h3>
//         <div class="client-name">${safeData.client}</div>
//         <div class="client-details">
//           ${safeData.clientEmail ? `<div>📧 ${safeData.clientEmail}</div>` : ''}
//           ${safeData.clientPhone ? `<div>📞 ${safeData.clientPhone}</div>` : ''}
//         </div>
//       </div>
//       <div class="bill-card">
//         <h3>FROM</h3>
//         <div class="client-name">${safeData.company || 'DocuGen Inc.'}</div>
//         <div class="client-details">
//           <div>🏢 123 Business Avenue</div>
//           <div>📧 support@docugen.com</div>
//           <div>📞 +91 98765 43210</div>
//         </div>
//       </div>
//     </div>
    
//     <div class="invoice-meta">
//       <div class="meta-item">
//         <div class="meta-label">INVOICE NUMBER</div>
//         <div class="meta-value">#${safeData.invoiceNo}</div>
//       </div>
//       <div class="meta-item">
//         <div class="meta-label">INVOICE DATE</div>
//         <div class="meta-value">${safeData.date}</div>
//       </div>
//       <div class="meta-item">
//         <div class="meta-label">DUE DATE</div>
//         <div class="meta-value">${safeData.dueDate}</div>
//       </div>
//     </div>
//   </div>

//   <!-- Items Table -->
//   <div class="items-section">
//     <table class="items-table">
//       <thead>
//         <tr>
//           <th>ITEM DESCRIPTION</th>
//           <th style="text-align: center">QUANTITY</th>
//           <th style="text-align: right">UNIT PRICE</th>
//           <th style="text-align: right">TOTAL</th>
//         </tr>
//       </thead>
//       <tbody>
//         ${safeData.items && safeData.items.length > 0 ? safeData.items.map(item => `
//           <tr>
//             <td class="item-name">${item.name || 'Service'}</td>
//             <td style="text-align: center">${item.qty || 1}</td>
//             <td style="text-align: right">${formatCurrency(item.price || 0)}</td>
//             <td style="text-align: right; font-weight: 600">${formatCurrency((item.qty || 1) * (item.price || 0))}</td>
//           </tr>
//         `).join('') : `
//           <tr>
//             <td colspan="4" style="text-align: center">No items</td>
//           </tr>
//         `}
//       </tbody>
//     </table>
//   </div>

//   <!-- Totals -->
//   <div class="totals-section">
//     <div class="totals-grid">
//       <div class="totals-card">
//         <div class="total-row">
//           <span class="total-label">Subtotal</span>
//           <span class="total-amount">${formatCurrency(safeData.subtotal)}</span>
//         </div>
//         <div class="total-row">
//           <span class="total-label">Tax (GST 18%)</span>
//           <span class="total-amount">${formatCurrency(safeData.gst)}</span>
//         </div>
//         <div class="total-row">
//           <span class="total-label grand-total-label">Grand Total</span>
//           <span class="total-amount grand-total-amount">${formatCurrency(safeData.total + safeData.gst)}</span>
//         </div>
//       </div>
//     </div>
//   </div>

//   <!-- Footer with QR -->
//   <div class="invoice-footer">
//     <div class="footer-grid">
//       <div class="qr-section">
//         <img src="${qrCode}" alt="QR Code" />
//         <div class="qr-text">Scan to Verify Invoice</div>
//       </div>
//       <div class="payment-info">
//         <p><strong>Payment Information</strong></p>
//         <p>Bank: HDFC Bank</p>
//         <p>Account: 123456789012</p>
//         <p>IFSC: HDFC0001234</p>
//         <p>UPI: docugen@hdfcbank</p>
//       </div>
//     </div>
//     <div class="copyright">
//       © ${new Date().getFullYear()} ${safeData.company || 'DocuGen'}. All rights reserved. | This is a computer generated invoice
//     </div>
//   </div>
// </div>

// </body>
// </html>
//   `;
// };