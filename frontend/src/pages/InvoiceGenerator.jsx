import { useState, useEffect, useCallback } from "react";
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
  Search,
  CalendarDays,
  Check,
} from "lucide-react";

const dateInputValue = (date) => {
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return localDate.toISOString().slice(0, 10);
};

const requestErrorMessage = async (error, fallback) => {
  const payload = error.response?.data;
  if (payload instanceof Blob) {
    try {
      return JSON.parse(await payload.text()).message || fallback;
    } catch {
      return fallback;
    }
  }
  return payload?.message || error.message || fallback;
};

export default function InvoiceGenerator() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [formData, setFormData] = useState({
    client: "",
    clientEmail: "",
    clientPhone: "",
    company: "",
    date: dateInputValue(new Date()),
    dueDate: dateInputValue(new Date(Date.now() + 15 * 86400000)),
    gstRate: 18,
    notes: "",
    items: [{ name: "", qty: 1, price: 0 }],
  });

  const [invoices, setInvoices] = useState([]);
  const [invoiceSearch, setInvoiceSearch] = useState("");
  const [invoiceFilter, setInvoiceFilter] = useState("all");
  const [invoicesLoading, setInvoicesLoading] = useState(true);
  const [invoiceError, setInvoiceError] = useState("");
  const [invoiceActionId, setInvoiceActionId] = useState("");
  const [loading, setLoading] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [uploadToDrive, setUploadToDrive] = useState(false);
  const [driveUploadStatus, setDriveUploadStatus] = useState(null);

  const [driveConnected, setDriveConnected] = useState(false);
  const [checkingConnection, setCheckingConnection] = useState(true);
  const [connectingDrive, setConnectingDrive] = useState(false);

  const fetchInvoices = useCallback(async () => {
    try {
      setInvoiceError("");
      const { data } = await api.get("/invoice");
      setInvoices(data);
    } catch (error) {
      setInvoiceError(error.response?.data?.message || "Could not load your invoices.");
    } finally {
      setInvoicesLoading(false);
    }
  }, []);

  const fetchDriveStatus = useCallback(async () => {
    if (!token) {
      setCheckingConnection(false);
      return;
    }
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
      console.error("Google Drive connection status error:", error);
      setDriveConnected(false);
    } finally {
      setCheckingConnection(false);
    }
  }, [token]);

  useEffect(() => {
    fetchDriveStatus();
    fetchInvoices();
  }, [fetchDriveStatus, fetchInvoices]);

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

  const handleItemChange = (index, field, value) => {
    setFormData((current) => ({
      ...current,
      items: current.items.map((item, itemIndex) => itemIndex === index
        ? {
            ...item,
            [field]: field === "qty" || field === "price"
              ? (value === "" ? "" : Number(value))
              : value,
          }
        : item),
    }));
  };

  const addItem = () => {
    setFormData((current) => ({
      ...current,
      items: [...current.items, { name: "", qty: 1, price: 0 }],
    }));
  };

  const removeItem = (index) => {
    setFormData((current) => ({
      ...current,
      items: current.items.filter((_, itemIndex) => itemIndex !== index),
    }));
  };

  const generatePDF = async (isPreview = false) => {
    if (!formData.client.trim()) {
      alert("Please enter client name");
      return;
    }

    const validItems = formData.items.filter(
      (item) => item.name.trim() && Number(item.qty) > 0 && Number(item.price) >= 0
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

    const previewWindow = isPreview ? window.open("about:blank", "_blank") : null;

    try {
      const endpoint = isPreview ? "/invoice/preview" : "/invoice/download";

      const invoiceData = {
        ...formData,
        items: validItems.map((item) => ({
          name: item.name,
          qty: Number(item.qty),
          price: Number(item.price),
        })),
        gstRate: Number(formData.gstRate),
        uploadToDrive,
      };

      const response = await api.post(endpoint, invoiceData, {
        headers: { "Content-Type": "application/json" },
        responseType: "blob",
      });

      const blob = new Blob([response.data], { type: "application/pdf" });

      if (blob.size < 100 || response.headers["content-type"]?.includes("application/json")) {
        const payload = await blob.text();
        throw new Error(JSON.parse(payload).message || "The server did not return a valid PDF.");
      }

      const url = window.URL.createObjectURL(blob);

      if (isPreview) {
        if (previewWindow) previewWindow.location.href = url;
        else {
          const link = document.createElement("a");
          link.href = url;
          link.target = "_blank";
          link.rel = "noopener";
          link.click();
        }
      } else {
        const link = document.createElement("a");
        link.href = url;
        link.download = `INVOICE_${response.headers["x-invoice-number"] || Date.now()}.pdf`;
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
        await fetchInvoices();
      }

      setTimeout(() => window.URL.revokeObjectURL(url), isPreview ? 60000 : 1000);
    } catch (err) {
      console.error("PDF generation error:", err);
      if (previewWindow && !previewWindow.closed) previewWindow.close();
      alert(await requestErrorMessage(err, "Failed to generate invoice."));
    } finally {
      if (isPreview) {
        setPreviewLoading(false);
      } else {
        setLoading(false);
      }
    }
  };

  const subtotal = Math.round(formData.items.reduce(
    (sum, item) => sum + (Number(item.qty) || 0) * (Math.round((Number(item.price) || 0) * 100) / 100),
    0
  ) * 100) / 100;
  const taxAmount = Math.round(subtotal * (Number(formData.gstRate) || 0)) / 100;
  const total = Math.round((subtotal + taxAmount) * 100) / 100;

  const filteredInvoices = invoices.filter((invoice) => {
    const search = invoiceSearch.trim().toLowerCase();
    const matchesSearch = !search ||
      String(invoice.invoiceNo).toLowerCase().includes(search) ||
      invoice.client.toLowerCase().includes(search);
    const matchesStatus = invoiceFilter === "all" || invoice.status === invoiceFilter;
    return matchesSearch && matchesStatus;
  });

  const changeInvoiceStatus = async (invoiceId, status) => {
    setInvoiceActionId(invoiceId);
    try {
      const { data } = await api.patch(`/invoice/${invoiceId}/status`, { status });
      setInvoices((current) => current.map((invoice) => invoice._id === invoiceId ? data : invoice));
    } catch (error) {
      alert(error.response?.data?.message || "Could not update invoice status.");
    } finally {
      setInvoiceActionId("");
    }
  };

  const downloadSavedInvoice = async (invoice) => {
    setInvoiceActionId(invoice._id);
    try {
      const { data } = await api.get(`/invoice/${invoice._id}/pdf`, { responseType: "blob" });
      const url = window.URL.createObjectURL(data);
      const link = document.createElement("a");
      link.href = url;
      link.download = `INVOICE-${invoice.invoiceNo}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      alert(await requestErrorMessage(error, "Could not download this invoice."));
    } finally {
      setInvoiceActionId("");
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
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Client Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      type="email"
                      value={formData.clientEmail}
                      onChange={(e) => setFormData({ ...formData, clientEmail: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl"
                      placeholder="client@example.com"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Client Phone
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      type="tel"
                      value={formData.clientPhone}
                      onChange={(e) => setFormData({ ...formData, clientPhone: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl"
                      placeholder="Optional"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                      Invoice Date
                    </label>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="w-full px-3 py-2.5 border border-slate-200 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                      Due Date
                    </label>
                    <input
                      type="date"
                      value={formData.dueDate}
                      onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                      className="w-full px-3 py-2.5 border border-slate-200 rounded-xl"
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
                        min="0.01"
                        step="any"
                        onChange={(e) => handleItemChange(idx, "qty", e.target.value)}
                        className="w-16 px-2 py-2 border border-slate-200 rounded-lg text-center"
                      />
                      <input
                        type="number"
                        placeholder="Unit price"
                        value={item.price}
                        min="0"
                        step="0.01"
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
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <label htmlFor="gst-rate" className="font-medium text-slate-700">Tax / GST (%)</label>
                    <input
                      id="gst-rate"
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={formData.gstRate}
                      onChange={(e) => setFormData({ ...formData, gstRate: e.target.value })}
                      className="w-24 px-3 py-2 border border-slate-200 rounded-lg text-right"
                    />
                  </div>
                  <div className="flex justify-between text-sm py-1">
                    <span className="text-slate-500">Subtotal</span>
                    <span>₹{subtotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between text-sm py-1">
                    <span className="text-slate-500">Tax ({Number(formData.gstRate) || 0}%)</span>
                    <span>₹{taxAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between border-t border-slate-200 mt-2 pt-3">
                    <span className="font-bold text-slate-800">Total Due</span>
                    <span className="text-xl font-bold text-indigo-600">
                      ₹{total.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
                <div className="mt-4">
                  <label htmlFor="invoice-notes" className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Notes / Payment Terms
                  </label>
                  <textarea
                    id="invoice-notes"
                    value={formData.notes}
                    maxLength={2000}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl"
                    placeholder="Optional note for your client"
                  />
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

          <section className="mt-10">
            <div className="flex flex-wrap items-end justify-between gap-4 mb-4">
              <div>
                <h2 className="text-2xl font-bold text-slate-800">Your invoices</h2>
                <p className="text-sm text-slate-500 mt-1">Download invoices and keep payment status up to date.</p>
              </div>
              <button
                type="button"
                onClick={fetchInvoices}
                className="px-4 py-2 rounded-lg border border-slate-200 bg-white text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                Refresh
              </button>
            </div>

            <div className="grid sm:grid-cols-[1fr_auto] gap-3 p-4 mb-4 bg-white rounded-xl border border-slate-200">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="search"
                  value={invoiceSearch}
                  onChange={(e) => setInvoiceSearch(e.target.value)}
                  placeholder="Search by invoice number or client"
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg"
                />
              </div>
              <select
                value={invoiceFilter}
                onChange={(e) => setInvoiceFilter(e.target.value)}
                className="px-4 py-2.5 border border-slate-200 rounded-lg bg-white"
                aria-label="Filter invoices by payment status"
              >
                <option value="all">All statuses</option>
                <option value="pending">Pending</option>
                <option value="overdue">Overdue</option>
                <option value="paid">Paid</option>
              </select>
            </div>

            {invoiceError && (
              <div role="alert" className="mb-4 p-4 rounded-xl bg-red-50 text-sm text-red-700 border border-red-100">
                {invoiceError}
              </div>
            )}

            {invoicesLoading ? (
              <div className="flex items-center justify-center gap-2 py-10 text-slate-500">
                <Loader2 size={20} className="animate-spin" /> Loading invoices...
              </div>
            ) : filteredInvoices.length === 0 ? (
              <div className="text-center py-10 bg-white rounded-xl border border-dashed border-slate-300">
                <Receipt size={36} className="mx-auto text-slate-300 mb-3" />
                <p className="font-medium text-slate-700">
                  {invoices.length ? "No invoices match this search." : "Your saved invoices will appear here."}
                </p>
                {!invoices.length && <p className="text-sm text-slate-500 mt-1">Generate your first invoice above.</p>}
              </div>
            ) : (
              <div className="space-y-3">
                {filteredInvoices.map((invoice) => {
                  const statusStyles = {
                    paid: "bg-emerald-50 text-emerald-700",
                    pending: "bg-amber-50 text-amber-700",
                    overdue: "bg-red-50 text-red-700",
                  };
                  return (
                    <article key={invoice._id} className="bg-white rounded-xl border border-slate-200 p-4 md:p-5">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-semibold text-slate-800">Invoice #{invoice.invoiceNo}</h3>
                            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${statusStyles[invoice.status] || statusStyles.pending}`}>
                              {invoice.status}
                            </span>
                          </div>
                          <p className="mt-1 text-sm text-slate-600">{invoice.client}</p>
                          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                            <span className="inline-flex items-center gap-1">
                              <CalendarDays size={13} /> Issued {invoice.date}
                            </span>
                            <span className="inline-flex items-center gap-1">
                              <CalendarDays size={13} /> Due {invoice.dueDate}
                            </span>
                            <span>₹{Number(invoice.total).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            onClick={() => downloadSavedInvoice(invoice)}
                            disabled={invoiceActionId === invoice._id}
                            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                          >
                            {invoiceActionId === invoice._id
                              ? <Loader2 size={15} className="animate-spin" />
                              : <Download size={15} />}
                            PDF
                          </button>
                          {invoice.status !== "paid" ? (
                            <button
                              type="button"
                              onClick={() => changeInvoiceStatus(invoice._id, "paid")}
                              disabled={invoiceActionId === invoice._id}
                              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-600 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
                            >
                              <Check size={15} /> Mark paid
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => changeInvoiceStatus(invoice._id, "pending")}
                              disabled={invoiceActionId === invoice._id}
                              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                            >
                              <Clock3 size={15} /> Mark unpaid
                            </button>
                          )}
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
