module.exports = (data, qrCode) => `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">

<!-- Google Font -->
<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600&display=swap" rel="stylesheet">

<style>
  body {
    font-family: 'Poppins', sans-serif;
    padding: 40px;
    color: #333;
  }

  header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 2px solid #000;
    padding-bottom: 10px;
  }

  header img {
    height: 60px;
  }

  h1 {
    margin: 0;
  }

  .info {
    margin-top: 20px;
    display: flex;
    justify-content: space-between;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 30px;
  }

  th, td {
    border: 1px solid #ddd;
    padding: 10px;
  }

  th {
    background: #f0f0f0;
  }

  .total {
    text-align: right;
    margin-top: 20px;
    font-size: 18px;
    font-weight: 600;
  }

  .qr {
    margin-top: 30px;
    text-align: right;
  }

  footer {
    position: fixed;
    bottom: 20px;
    left: 0;
    right: 0;
    text-align: center;
    font-size: 12px;
    color: gray;
  }

  .pageNumber:after {
    content: counter(page);
  }
</style>
</head>

<body>

<header>
  <img src="http://localhost:5000/logo.png" />
  <h1>INVOICE</h1>
</header>

<div class="info">
  <div>
    <p><strong>Client:</strong> ${data.client}</p>
    <p><strong>Date:</strong> ${data.date}</p>
  </div>
  <div>
    <p><strong>Invoice No:</strong> ${data.invoiceNo}</p>
  </div>
</div>

<table>
  <tr>
    <th>Item</th>
    <th>Qty</th>
    <th>Price</th>
    <th>Total</th>
  </tr>

  ${data.items.map(i => `
    <tr>
      <td>${i.name}</td>
      <td>${i.qty}</td>
      <td>₹${i.price}</td>
      <td>₹${i.qty * i.price}</td>
    </tr>
  `).join("")}
</table>

<div class="total">
  Grand Total: ₹${data.total}
</div>

<div class="qr">
  <img src="${qrCode}" width="120" />
  <p>Scan to Verify</p>
</div>

<footer>
  Page <span class="pageNumber"></span>
</footer>

</body>
</html>
`;
