import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Home, Image as ImageIcon } from "lucide-react";

export default function InvoiceGenerator() {
  const [client, setClient] = useState("");
  const [invoiceNo, setInvoiceNo] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const generatePDF = async () => {
    setLoading(true);

    const data = {
      client,
      date: new Date().toLocaleDateString(),
      invoiceNo,
      items: [{ name: "Service Charge", qty: 1, price: Number(amount) }],
      total: Number(amount),
    };

    try {
      const res = await axios.post(
        "http://localhost:50001/api/pdf/download",
        data,
        { responseType: "blob" }
      );

      const url = window.URL.createObjectURL(
        new Blob([res.data], { type: "application/pdf" })
      );

      const link = document.createElement("a");
      link.href = url;
      link.download = "invoice.pdf";
      link.click();
    } catch (err) {
      alert("PDF generation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-10">

      {/* Top Navigation */}
      <div className="max-w-5xl mx-auto mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">
          Invoice Generator
        </h1>

        <div className="flex gap-3">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white border hover:bg-gray-50 transition"
          >
            <Home size={16} />
            Home
          </button>

          <button
            onClick={() => navigate("/image-generate")}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-black text-white hover:bg-gray-900 transition"
          >
            <ImageIcon size={16} />
            Image to PDF
          </button>
        </div>
      </div>

      {/* Main Card */}
      <div className="max-w-2xl mx-auto bg-white shadow-2xl rounded-2xl p-8">

        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800">
            Create Invoice
          </h2>
          <p className="text-gray-500 mt-2">
            Generate high-quality professional PDFs
          </p>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Client Name
            </label>
            <input
              type="text"
              placeholder="Enter client name"
              value={client}
              onChange={(e) => setClient(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Invoice Number
            </label>
            <input
              type="text"
              placeholder="INV-2026-001"
              value={invoiceNo}
              onChange={(e) => setInvoiceNo(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Amount (₹)
            </label>
            <input
              type="number"
              placeholder="5000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>
        </div>

        <button
          onClick={generatePDF}
          disabled={loading}
          className="mt-8 w-full bg-black text-white py-3 rounded-xl font-semibold text-lg hover:bg-gray-900 transition disabled:opacity-50"
        >
          {loading ? "Generating PDF..." : "Generate Invoice PDF"}
        </button>

        <p className="text-center text-xs text-gray-400 mt-6">
          Powered by MERN • Puppeteer PDF Engine
        </p>
      </div>
    </div>
  );
}
