import { useState, useEffect } from "react";
import api from "../services/api";
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
  AlertCircle,
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

  const [driveConnected, setDriveConnected] = useState(false);
  const [checkingConnection, setCheckingConnection] = useState(true);
  const [connectingDrive, setConnectingDrive] = useState(false);

  const fetchDriveStatus = async () => {
    if (!token) return;
    try {
      setCheckingConnection(true);
      const res = await api.get("/auth/me");
      const user = res.data;
      const connected =
        user?.googleTokens &&
        user.googleTokens.access_token &&
        Object.keys(user.googleTokens).length > 0;
      setDriveConnected(!!connected);
    } catch (error) {
      setDriveConnected(false);
    } finally {
      setCheckingConnection(false);
    }
  };

  useEffect(() => {
    fetchDriveStatus();
  }, [token]);

  const connectToDrive = async () => {
    try {
      setConnectingDrive(true);
      const res = await api.get("/auth/google");
      if (res.data.url) {
        window.location.href = res.data.url;
      }
    } catch (error) {
      if (error.response?.status === 401) {
        alert("Session expired. Please login again.");
        localStorage.removeItem("token");
        navigate("/login");
      } else {
        alert("Google connection failed");
      }
    } finally {
      setConnectingDrive(false);
    }
  };

  const calculateTotal = (items) => {
    return items.reduce(
      (sum, item) => sum + (item.qty || 0) * (item.price || 0),
      0
    );
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index][field] =
      field === "qty" || field === "price"
        ? parseFloat(value) || 0
        : value;
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
      (item) => item.name && item.name.trim() && item.qty > 0 && item.price > 0
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
      // FIX: baseURL already includes /api — no /api prefix here
      const endpoint = isPreview ? "/invoice/preview" : "/invoice/download";

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
        uploadToDrive,
      };

      const response = await api.post(endpoint, invoiceData, {
        headers: { "Content-Type": "application/json" },
        responseType: "blob",
      });

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

      setTimeout(() => window.URL.revokeObjectURL(url), 100);
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
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition" />
            Back to Dashboard
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
              <Receipt size={16} className="text-indigo-600" />
            </div>
            <span className="text-sm font-medium text-slate-600">Invoice Generator</span>
          </div>
        </div>

        {/* Hero */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-violet-500 px-5 py-2 rounded-full mb-5 shadow-sm">
            <Sparkles size={14} className="text-white" />
            <span className="text-xs font-medium text-white">Smart Generator</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-800 mb-3">
            Create{" "}
            <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
              Professional
            </span>{" "}
            Invoice
          </h1>
          <p className="text-slate-500 max-w-2xl mx-auto">
            Generate beautiful invoices instantly
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <FileText size={20} className="text-white" />
              </div>
              <div>
                <h2 className="text-white font-semibold">Invoice Details</h2>
                <p className="text-indigo-100 text-xs">Fill in the information below</p>
              </div>
            </div>
          </div>

          <div className="p-6 md:p-8">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Left */}
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Client Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      type="text"
                      value={formData.client}
                      onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl"
                      placeholder="Enter client name"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Company
                  </label>
                  <div className="relative">
                    <Building className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      type="text"
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl"
                      placeholder="Your company name"
                    />
                  </div>
                </div>
              </div>

              {/* Right */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="text-sm font-semibold text-slate-700">
                    Items / Services
                  </label>
                  <button onClick={addItem} className="text-sm text-indigo-600 flex items-center gap-1">
                    <Plus size={14} />
                    Add Item
                  </button>
                </div>

                <div className="space-y-3">
                  {formData.items.map((item, idx) => (
                    <div key={idx} className="flex gap-2 items-center bg-slate-50 p-2 rounded-xl">
                      <input
                        type="text"
                        placeholder="Item name"
                        value={item.name}
                        onChange={(e) => handleItemChange(idx, "name", e.target.value)}
                        className="flex-1 px-3 py-2 border border-slate-200 rounded-lg"
                      />
                      <input
                        type="number"
                        placeholder="Qty"
                        value={item.qty}
                        onChange={(e) => handleItemChange(idx, "qty", e.target.value)}
                        className="w-16 px-2 py-2 border border-slate-200 rounded-lg text-center"
                      />
                      <input
                        type="number"
                        placeholder="Price"
                        value={item.price}
                        onChange={(e) => handleItemChange(idx, "price", e.target.value)}
                        className="w-24 px-2 py-2 border border-slate-200 rounded-lg"
                      />
                      {formData.items.length > 1 && (
                        <button onClick={() => removeItem(idx)} className="p-2 text-red-400 hover:text-red-600">
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <div className="mt-5 bg-slate-50 rounded-xl p-4 border">
                  <div className="flex justify-between">
                    <span className="font-bold text-slate-800">Total Amount</span>
                    <span className="text-xl font-bold text-indigo-600">
                      ₹{(formData.total * 1.18).toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Drive Section */}
            {!checkingConnection ? (
              <div className="mt-6 pt-4 border-t border-slate-100">
                {driveConnected ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-green-50 rounded-xl border border-green-200">
                      <input
                        type="checkbox"
                        checked={uploadToDrive}
                        onChange={(e) => setUploadToDrive(e.target.checked)}
                        id="upload-drive"
                        className="w-4 h-4"
                      />
                      <label htmlFor="upload-drive" className="flex items-center gap-2 cursor-pointer flex-1">
                        <CloudUpload size={16} className="text-green-600" />
                        <span className="text-sm font-medium text-green-800">Save to Google Drive</span>
                      </label>
                      <button onClick={fetchDriveStatus} className="text-xs text-green-600">
                        Refresh
                      </button>
                    </div>
                    <div className="flex items-center gap-2 pl-2">
                      <CheckCircle size={14} className="text-green-600" />
                      <span className="text-xs text-green-600 font-medium">Google Drive connected</span>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="flex items-center justify-between flex-wrap gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
                          <CloudUpload size={20} className="text-slate-400" />
                        </div>
                        <div>
                          <h3 className="text-sm font-semibold text-slate-700">Google Drive Integration</h3>
                          <p className="text-xs text-slate-500">Connect to automatically save invoices</p>
                        </div>
                      </div>
                      <button
                        onClick={connectToDrive}
                        disabled={connectingDrive}
                        className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 flex items-center gap-2 disabled:opacity-50"
                      >
                        {connectingDrive ? <Loader2 size={14} className="animate-spin" /> : <CloudUpload size={14} />}
                        Connect Google Drive
                      </button>
                    </div>
                  </div>
                )}

                {driveUploadStatus === "success" && (
                  <div className="mt-3 p-3 bg-green-50 rounded-xl flex items-center gap-2">
                    <CheckCircle size={16} className="text-green-600" />
                    <span className="text-sm text-green-700">Invoice saved to Google Drive!</span>
                  </div>
                )}

                {driveUploadStatus === "error" && (
                  <div className="mt-3 p-3 bg-red-50 rounded-xl flex items-center gap-2">
                    <XCircle size={16} className="text-red-600" />
                    <span className="text-sm text-red-700">Failed to save to Drive</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="mt-6 pt-4 border-t border-slate-100">
                <div className="flex items-center justify-center p-4">
                  <Loader2 size={20} className="animate-spin text-slate-400" />
                  <span className="ml-2 text-sm text-slate-500">Checking Drive connection...</span>
                </div>
              </div>
            )}

            {/* Buttons */}
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => generatePDF(true)}
                disabled={loading || previewLoading}
                className="flex-1 bg-white border border-slate-200 text-slate-700 py-3 rounded-xl font-semibold flex items-center justify-center gap-2"
              >
                {previewLoading ? <Loader2 size={18} className="animate-spin" /> : <Eye size={18} />}
                Preview
              </button>
              <button
                onClick={() => generatePDF(false)}
                disabled={loading || previewLoading}
                className="flex-1 bg-gradient-to-r from-indigo-600 to-violet-600 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
                {uploadToDrive && driveConnected ? "Generate & Upload" : "Generate Invoice"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
