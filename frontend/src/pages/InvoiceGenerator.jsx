// import { useEffect, useState } from "react";
// import axios from "axios";
// import { useNavigate } from "react-router-dom";
// import { Home, Image as ImageIcon } from "lucide-react";

// export default function InvoiceGenerator() {
//   const token = localStorage.getItem("token");
//   const [client, setClient] = useState("");
//   const [invoiceNo, setInvoiceNo] = useState("");
//   const [amount, setAmount] = useState("");
//   const [loading, setLoading] = useState(false);

//   const navigate = useNavigate();
//   useEffect(() => {
//     if (!token) {
//       navigate("/login");
//     }
//   }, [token, navigate]);
//   const generatePDF = async () => {
//     setLoading(true);

//     const data = {
//       client,
//       date: new Date().toLocaleDateString(),
//       invoiceNo,
//       items: [{ name: "Service Charge", qty: 1, price: Number(amount) }],
//       total: Number(amount),
//     };

//     try {
//       const res = await axios.post(
//         "http://localhost:5000/api/invoice/download",
//         data,
//         {
//           responseType: "blob",
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         },
//       );

//       // const res = await axios.post(
//       //   "http://localhost:5000/api/invoice/download",
//       //   data,
//       //   {
//       //     responseType: "blob",
//       //     withCredentials: true, // ✅ important
//       //   },
//       // );

//       const url = window.URL.createObjectURL(
//         new Blob([res.data], { type: "application/pdf" }),
//       );

//       const link = document.createElement("a");
//       link.href = url;
//       link.download = "invoice.pdf";
//       link.click();
//     } catch (err) {
//       alert("PDF generation failed");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gray-100 p-10">
//       {/* Top Navigation */}
//       <div className="max-w-5xl mx-auto mb-6 flex items-center justify-between">
//         <h1 className="text-2xl font-bold text-gray-800">Invoice Generator</h1>

//         <div className="flex gap-3">
//           <button
//             onClick={() => navigate("/")}
//             className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white border hover:bg-gray-50 transition"
//           >
//             <Home size={16} />
//             Home
//           </button>

//           <button
//             onClick={() => navigate("/image-generate")}
//             className="flex items-center gap-2 px-4 py-2 rounded-lg bg-black text-white hover:bg-gray-900 transition"
//           >
//             <ImageIcon size={16} />
//             Image to PDF
//           </button>
//         </div>
//       </div>

//       {/* Main Card */}
//       <div className="max-w-2xl mx-auto bg-white shadow-2xl rounded-2xl p-8">
//         <div className="text-center mb-8">
//           <h2 className="text-3xl font-bold text-gray-800">Create Invoice</h2>
//           <p className="text-gray-500 mt-2">
//             Generate high-quality professional PDFs
//           </p>
//         </div>

//         <div className="space-y-6">
//           <div>
//             <label className="block text-sm font-medium text-gray-600 mb-1">
//               Client Name
//             </label>
//             <input
//               type="text"
//               placeholder="Enter client name"
//               value={client}
//               onChange={(e) => setClient(e.target.value)}
//               className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black"
//             />
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-600 mb-1">
//               Invoice Number
//             </label>
//             <input
//               type="text"
//               placeholder="INV-2026-001"
//               value={invoiceNo}
//               onChange={(e) => setInvoiceNo(e.target.value)}
//               className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black"
//             />
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-600 mb-1">
//               Amount (₹)
//             </label>
//             <input
//               type="number"
//               placeholder="5000"
//               value={amount}
//               onChange={(e) => setAmount(e.target.value)}
//               className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black"
//             />
//           </div>
//         </div>

//         <button
//           onClick={generatePDF}
//           disabled={loading}
//           className="mt-8 w-full bg-black text-white py-3 rounded-xl font-semibold text-lg hover:bg-gray-900 transition disabled:opacity-50"
//         >
//           {loading ? "Generating PDF..." : "Generate Invoice PDF"}
//         </button>

//         <p className="text-center text-xs text-gray-400 mt-6">
//           Powered by MERN • Puppeteer PDF Engine
//         </p>
//       </div>
//     </div>
//   );
// }
import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  FileText,
  Download,
  Loader2,
  User,
  Building,
  Mail,
  Phone,
  ArrowLeft,
  Sparkles,
  Plus,
  Trash2,
  Eye,
  CloudUpload,
  CheckCircle,
  XCircle,
  Receipt,
  CreditCard,
  Calendar,
  Hash,
} from "lucide-react";

export default function InvoiceGenerator() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [formData, setFormData] = useState({
    client: "",
    clientEmail: "",
    clientPhone: "",
    company: "",
    items: [{ name: "", qty: 1, price: 0 }],
    total: 0,
  });

  const [loading, setLoading] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [uploadToDrive, setUploadToDrive] = useState(false);
  const [driveUploadStatus, setDriveUploadStatus] = useState(null);

  const calculateTotal = (items) => {
    return items.reduce(
      (sum, item) => sum + (item.qty || 0) * (item.price || 0),
      0,
    );
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index][field] =
      field === "qty" || field === "price" ? parseFloat(value) || 0 : value;
    setFormData({
      ...formData,
      items: newItems,
      total: calculateTotal(newItems),
    });
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { name: "", qty: 1, price: 0 }],
    });
  };

  const removeItem = (index) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      items: newItems,
      total: calculateTotal(newItems),
    });
  };

  const generatePDF = async (isPreview = false) => {
    if (!formData.client.trim()) {
      alert("Please enter client name");
      return;
    }

    const validItems = formData.items.filter(
      (item) => item.name && item.name.trim() && item.qty > 0 && item.price > 0,
    );

    if (validItems.length === 0) {
      alert("Please add at least one valid item with name, quantity and price");
      return;
    }

    if (isPreview) {
      setPreviewLoading(true);
    } else {
      setLoading(true);
    }

    setDriveUploadStatus(null);

    try {
      const endpoint = isPreview
        ? "/api/invoice/preview"
        : "/api/invoice/download";

      const invoiceData = {
        client: formData.client,
        clientEmail: formData.clientEmail,
        clientPhone: formData.clientPhone,
        company: formData.company,
        items: validItems.map((item) => ({
          name: item.name,
          qty: Number(item.qty),
          price: Number(item.price),
        })),
        total: formData.total,
        uploadToDrive: uploadToDrive,
      };

      const response = await axios.post(
        `http://localhost:5000${endpoint}`,
        invoiceData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          responseType: "blob",
        },
      );

      const blob = new Blob([response.data], { type: "application/pdf" });

      if (blob.size < 100) {
        throw new Error("Generated PDF is too small");
      }

      const url = window.URL.createObjectURL(blob);

      if (isPreview) {
        window.open(url, "_blank");
      } else {
        const link = document.createElement("a");
        link.href = url;
        link.download = `INVOICE_${formData.client}_${Date.now()}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        const driveUploaded = response.headers["x-drive-uploaded"];
        if (driveUploaded === "true") {
          setDriveUploadStatus("success");
          setTimeout(() => setDriveUploadStatus(null), 5000);
        } else if (uploadToDrive && driveUploaded === "false") {
          setDriveUploadStatus("error");
          setTimeout(() => setDriveUploadStatus(null), 5000);
        }
      }

      setTimeout(() => {
        window.URL.revokeObjectURL(url);
      }, 100);
    } catch (err) {
      console.error("PDF generation error:", err);
      alert("Failed to generate PDF. Please try again.");
    } finally {
      if (isPreview) {
        setPreviewLoading(false);
      } else {
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-slate-500 hover:text-slate-700 transition group"
          >
            <ArrowLeft
              size={18}
              className="group-hover:-translate-x-1 transition"
            />
            Back to Dashboard
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
              <Receipt size={16} className="text-indigo-600" />
            </div>
            <span className="text-sm font-medium text-slate-600">
              Invoice Generator
            </span>
          </div>
        </div>

        {/* Hero Section */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-violet-500 px-5 py-2 rounded-full mb-5 shadow-sm">
            <Sparkles size={14} className="text-white" />
            <span className="text-xs font-medium text-white">
              Smart Generator
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-800 mb-3">
            Create{" "}
            <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
              Professional
            </span>{" "}
            Invoice
          </h1>
          <p className="text-slate-500 max-w-2xl mx-auto">
            Generate beautiful, tax-compliant invoices in seconds with automatic
            GST calculation
          </p>
        </div>

        {/* Main Form Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
          {/* Form Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <FileText size={20} className="text-white" />
              </div>
              <div>
                <h2 className="text-white font-semibold">Invoice Details</h2>
                <p className="text-indigo-100 text-xs">
                  Fill in the information below
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 md:p-8">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Client Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                      size={18}
                    />
                    <input
                      type="text"
                      value={formData.client}
                      onChange={(e) =>
                        setFormData({ ...formData, client: e.target.value })
                      }
                      className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                      placeholder="Enter client name"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                        size={16}
                      />
                      <input
                        type="email"
                        value={formData.clientEmail}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            clientEmail: e.target.value,
                          })
                        }
                        className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                        placeholder="client@email.com"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                      Phone Number
                    </label>
                    <div className="relative">
                      <Phone
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                        size={16}
                      />
                      <input
                        type="tel"
                        value={formData.clientPhone}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            clientPhone: e.target.value,
                          })
                        }
                        className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                        placeholder="+91 98765 43210"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Your Company
                  </label>
                  <div className="relative">
                    <Building
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                      size={18}
                    />
                    <input
                      type="text"
                      value={formData.company}
                      onChange={(e) =>
                        setFormData({ ...formData, company: e.target.value })
                      }
                      className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                      placeholder="Your company name"
                    />
                  </div>
                </div>
              </div>

              {/* Right Column - Items */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="text-sm font-semibold text-slate-700">
                    Items / Services
                  </label>
                  <button
                    onClick={addItem}
                    className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center gap-1 font-medium"
                  >
                    <Plus size={14} /> Add Item
                  </button>
                </div>

                <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                  {formData.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex gap-2 items-center bg-slate-50 p-2 rounded-xl"
                    >
                      <input
                        type="text"
                        placeholder="Item name"
                        value={item.name}
                        onChange={(e) =>
                          handleItemChange(idx, "name", e.target.value)
                        }
                        className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 bg-white"
                      />
                      <input
                        type="number"
                        placeholder="Qty"
                        value={item.qty}
                        onChange={(e) =>
                          handleItemChange(idx, "qty", e.target.value)
                        }
                        className="w-16 px-2 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 bg-white text-center"
                      />
                      <input
                        type="number"
                        placeholder="Price"
                        value={item.price}
                        onChange={(e) =>
                          handleItemChange(idx, "price", e.target.value)
                        }
                        className="w-24 px-2 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 bg-white"
                      />
                      {formData.items.length > 1 && (
                        <button
                          onClick={() => removeItem(idx)}
                          className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {/* Total Summary Card */}
                <div className="mt-5 bg-gradient-to-r from-slate-50 to-white rounded-xl p-4 border border-slate-100">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Subtotal</span>
                      <span className="font-semibold text-slate-700">
                        ₹{formData.total.toLocaleString("en-IN")}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">GST (18%)</span>
                      <span className="font-semibold text-slate-700">
                        ₹{(formData.total * 0.18).toLocaleString("en-IN")}
                      </span>
                    </div>
                    <div className="pt-2 border-t border-slate-200 flex justify-between">
                      <span className="text-base font-bold text-slate-800">
                        Total Amount
                      </span>
                      <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                        ₹{(formData.total * 1.18).toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Drive Upload Option */}
            <div className="mt-6 pt-4 border-t border-slate-100">
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                <input
                  type="checkbox"
                  checked={uploadToDrive}
                  onChange={(e) => setUploadToDrive(e.target.checked)}
                  id="upload-drive"
                  className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <label
                  htmlFor="upload-drive"
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <CloudUpload size={16} className="text-indigo-500" />
                  <span className="text-sm font-medium text-slate-700">
                    Save to Google Drive
                  </span>
                </label>
              </div>

              {driveUploadStatus === "success" && (
                <div className="mt-3 p-3 bg-green-50 rounded-xl flex items-center gap-2">
                  <CheckCircle size={16} className="text-green-600" />
                  <span className="text-sm text-green-700">
                    Invoice saved to Google Drive!
                  </span>
                </div>
              )}

              {driveUploadStatus === "error" && (
                <div className="mt-3 p-3 bg-red-50 rounded-xl flex items-center gap-2">
                  <XCircle size={16} className="text-red-600" />
                  <span className="text-sm text-red-700">
                    Failed to save to Drive. Please check connection.
                  </span>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => window.open(file.webViewLink, "_blank")}
                className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-indigo-50 transition"
                title="View"
              >
                <Eye size={14} />
              </button>
              <button
                onClick={() => generatePDF(false)}
                disabled={loading || previewLoading}
                className="flex-1 bg-gradient-to-r from-indigo-600 to-violet-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <Download size={18} />
                )}
                {uploadToDrive ? "Generate & Upload" : "Generate Invoice"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
