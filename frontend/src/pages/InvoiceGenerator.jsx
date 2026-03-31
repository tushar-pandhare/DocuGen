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

// // }
// import { useState } from "react";
// import axios from "axios";
// import { useNavigate } from "react-router-dom";
// import { 
//   FileText, Download, Loader2, Calendar, Hash, User, 
//   DollarSign, Building, Mail, Phone, ArrowLeft, CloudUpload, CheckCircle 
// } from "lucide-react";

// export default function InvoiceGenerator() {
//   const navigate = useNavigate();
//   const token = localStorage.getItem("token");
  
//   const [formData, setFormData] = useState({
//     clientName: "",
//     clientEmail: "",
//     clientPhone: "",
//     companyName: "",
//     invoiceNo: "",
//     amount: "",
//     description: "Service Charge"
//   });
  
//   const [loading, setLoading] = useState(false);
//   const [uploadToDrive, setUploadToDrive] = useState(false);
//   const [driveFileId, setDriveFileId] = useState(null);
//   const [pdfBlob, setPdfBlob] = useState(null);

//   const handleChange = (e) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//   };

//   const uploadToGoogleDrive = async (blob, fileName) => {
//     try {
//       const formData = new FormData();
//       formData.append("file", blob, fileName);
//       formData.append("folder", "DocuGen_Invoices");

//       const res = await axios.post("http://localhost:5000/api/drive/upload", formData, {
//         headers: { Authorization: `Bearer ${token}` }
//       });
      
//       setDriveFileId(res.data.fileId);
//       return res.data.fileId;
//     } catch (err) {
//       console.error("Drive upload failed:", err);
//       return null;
//     }
//   };

//   const generatePDF = async () => {
//     if (!formData.clientName || !formData.invoiceNo || !formData.amount) {
//       alert("Please fill all required fields");
//       return;
//     }

//     setLoading(true);
//     setDriveFileId(null);
    
//     const data = {
//       client: formData.clientName,
//       clientEmail: formData.clientEmail,
//       clientPhone: formData.clientPhone,
//       company: formData.companyName,
//       date: new Date().toLocaleDateString(),
//       invoiceNo: formData.invoiceNo,
//       items: [{ name: formData.description, qty: 1, price: Number(formData.amount) }],
//       total: Number(formData.amount),
//     };

//     try {
//       const res = await axios.post(
//         "http://localhost:5000/api/invoice/download",
//         data,
//         {
//           responseType: "blob",
//           headers: { Authorization: `Bearer ${token}` },
//         }
//       );

//       const blob = new Blob([res.data], { type: "application/pdf" });
//       setPdfBlob(blob);
//       const fileName = `invoice_${formData.invoiceNo}.pdf`;
      
//       // Download locally
//       const url = window.URL.createObjectURL(blob);
//       const link = document.createElement("a");
//       link.href = url;
//       link.download = fileName;
//       document.body.appendChild(link);
//       link.click();
//       link.remove();
//       window.URL.revokeObjectURL(url);
      
//       // Upload to Drive if option is selected
//       if (uploadToDrive) {
//         const fileId = await uploadToGoogleDrive(blob, fileName);
//         if (fileId) {
//           alert("Invoice uploaded to Google Drive!");
//         }
//       }
//     } catch (err) {
//       alert("PDF generation failed");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-slate-100">
//       <div className="max-w-5xl mx-auto px-6 py-8">
//         {/* Header */}
//         <div className="flex items-center justify-between mb-8">
//           <button 
//             onClick={() => navigate("/")}
//             className="flex items-center gap-2 text-slate-500 hover:text-slate-700 transition"
//           >
//             <ArrowLeft size={18} />
//             Back to Dashboard
//           </button>
//           <div className="flex items-center gap-2">
//             <FileText size={20} className="text-indigo-600" />
//             <span className="text-sm font-medium text-slate-600">Professional Invoice</span>
//           </div>
//         </div>

//         <div className="text-center mb-8">
//           <h1 className="text-4xl font-bold text-slate-800 mb-3">
//             Invoice <span className="bg-linear-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">Generator</span>
//           </h1>
//           <p className="text-slate-500">Create professional invoices in seconds</p>
//         </div>

//         <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
//           {/* Preview Header */}
//           <div className="bg-linear-to-r from-slate-800 to-slate-900 px-8 py-6 text-white">
//             <div className="flex justify-between items-start">
//               <div>
//                 <h2 className="text-2xl font-bold mb-1">INVOICE</h2>
//                 <p className="text-slate-300 text-sm"># {formData.invoiceNo || "INV-001"}</p>
//               </div>
//               <div className="text-right">
//                 <p className="text-sm text-slate-300">Date</p>
//                 <p className="font-medium">{new Date().toLocaleDateString()}</p>
//               </div>
//             </div>
//           </div>

//           <div className="p-8">
//             <div className="grid md:grid-cols-2 gap-8 mb-8">
//               {/* Bill To */}
//               <div className="bg-slate-50 rounded-xl p-5">
//                 <h3 className="font-semibold text-slate-700 mb-3 flex items-center gap-2">
//                   <User size={16} className="text-indigo-500" />
//                   Bill To
//                 </h3>
//                 <input
//                   type="text"
//                   name="clientName"
//                   placeholder="Client Name *"
//                   value={formData.clientName}
//                   onChange={handleChange}
//                   className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-2"
//                 />
//                 <input
//                   type="email"
//                   name="clientEmail"
//                   placeholder="Client Email"
//                   value={formData.clientEmail}
//                   onChange={handleChange}
//                   className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-2"
//                 />
//                 <input
//                   type="tel"
//                   name="clientPhone"
//                   placeholder="Client Phone"
//                   value={formData.clientPhone}
//                   onChange={handleChange}
//                   className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
//                 />
//               </div>

//               {/* From */}
//               <div className="bg-slate-50 rounded-xl p-5">
//                 <h3 className="font-semibold text-slate-700 mb-3 flex items-center gap-2">
//                   <Building size={16} className="text-indigo-500" />
//                   From
//                 </h3>
//                 <input
//                   type="text"
//                   name="companyName"
//                   placeholder="Your Company Name"
//                   value={formData.companyName}
//                   onChange={handleChange}
//                   className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
//                 />
//               </div>
//             </div>

//             {/* Invoice Details */}
//             <div className="grid md:grid-cols-3 gap-4 mb-8">
//               <div>
//                 <label className="block text-sm font-medium text-slate-600 mb-1 items-center gap-1">
//                   <Hash size={14} /> Invoice Number *
//                 </label>
//                 <input
//                   type="text"
//                   name="invoiceNo"
//                   placeholder="INV-2024-001"
//                   value={formData.invoiceNo}
//                   onChange={handleChange}
//                   className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-slate-600 mb-1 items-center gap-1">
//                   <DollarSign size={14} /> Amount *
//                 </label>
//                 <input
//                   type="number"
//                   name="amount"
//                   placeholder="0.00"
//                   value={formData.amount}
//                   onChange={handleChange}
//                   className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-slate-600 mb-1 items-center gap-1">
//                   <FileText size={14} /> Description
//                 </label>
//                 <input
//                   type="text"
//                   name="description"
//                   placeholder="Service Description"
//                   value={formData.description}
//                   onChange={handleChange}
//                   className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
//                 />
//               </div>
//             </div>

//             {/* Google Drive Upload Option */}
//             <div className="mb-6 p-4 bg-slate-50 rounded-xl">
//               <div className="flex items-center gap-2">
//                 <input
//                   type="checkbox"
//                   checked={uploadToDrive}
//                   onChange={(e) => setUploadToDrive(e.target.checked)}
//                   id="upload-drive-invoice"
//                   className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
//                 />
//                 <label htmlFor="upload-drive-invoice" className="text-sm text-slate-600 flex items-center gap-2 cursor-pointer">
//                   <CloudUpload size={14} />
//                   Upload invoice to Google Drive
//                 </label>
//               </div>
//               {driveFileId && (
//                 <div className="mt-3 flex items-center gap-2 text-sm text-green-600">
//                   <CheckCircle size={14} />
//                   Saved to Drive!
//                   <button
//                     onClick={() => window.open(`https://drive.google.com/file/d/${driveFileId}/view`, "_blank")}
//                     className="ml-auto text-indigo-600 hover:underline text-xs"
//                   >
//                     View File
//                   </button>
//                 </div>
//               )}
//             </div>

//             {/* Preview Table */}
//             <div className="border border-slate-200 rounded-xl overflow-hidden mb-8">
//               <table className="w-full">
//                 <thead className="bg-slate-50">
//                   <tr>
//                     <th className="px-4 py-3 text-left text-xs font-medium text-slate-500">Item</th>
//                     <th className="px-4 py-3 text-center text-xs font-medium text-slate-500">Qty</th>
//                     <th className="px-4 py-3 text-right text-xs font-medium text-slate-500">Price</th>
//                     <th className="px-4 py-3 text-right text-xs font-medium text-slate-500">Total</th>
//                    </tr>
//                 </thead>
//                 <tbody>
//                   <tr className="border-t border-slate-100">
//                     <td className="px-4 py-3 text-sm text-slate-700">{formData.description || "Service Charge"}</td>
//                     <td className="px-4 py-3 text-center text-sm text-slate-700">1</td>
//                     <td className="px-4 py-3 text-right text-sm text-slate-700">${formData.amount || "0"}</td>
//                     <td className="px-4 py-3 text-right text-sm font-semibold text-slate-800">${formData.amount || "0"}</td>
//                   </tr>
//                 </tbody>
//                 <tfoot className="bg-slate-50 border-t border-slate-200">
//                   <tr>
//                     <td colSpan="3" className="px-4 py-3 text-right font-semibold text-slate-700">Total</td>
//                     <td className="px-4 py-3 text-right font-bold text-indigo-600">${formData.amount || "0"}</td>
//                   </tr>
//                 </tfoot>
//               </table>
//             </div>

//             {/* Generate Button */}
//             <button
//               onClick={generatePDF}
//               disabled={loading}
//               className="w-full bg-linear-to-r from-indigo-600 to-violet-600 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 hover:shadow-lg transition-all disabled:opacity-50"
//             >
//               {loading ? (
//                 <>
//                   <Loader2 size={18} className="animate-spin" />
//                   Generating PDF...
//                 </>
//               ) : (
//                 <>
//                   <Download size={18} />
//                   Generate Invoice PDF
//                 </>
//               )}
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { 
  FileText, Download, Loader2, User, Building, 
  Mail, Phone, DollarSign, Calendar, Hash, Plus, Trash2,
  CloudUpload, CheckCircle, Eye, ArrowLeft, Sparkles,
  Home, ImageIcon
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
    total: 0
  });
  
  const [loading, setLoading] = useState(false);
  const [uploadToDrive, setUploadToDrive] = useState(false);
  const [driveFileId, setDriveFileId] = useState(null);

  const calculateTotal = (items) => {
    return items.reduce((sum, item) => sum + (item.qty * item.price), 0);
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index][field] = field === 'qty' || field === 'price' ? parseFloat(value) || 0 : value;
    setFormData({ 
      ...formData, 
      items: newItems,
      total: calculateTotal(newItems)
    });
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { name: "", qty: 1, price: 0 }]
    });
  };

  const removeItem = (index) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      items: newItems,
      total: calculateTotal(newItems)
    });
  };

  const generatePDF = async () => {
    if (!formData.client || !formData.items.length) {
      alert("Please fill client name and at least one item");
      return;
    }

    setLoading(true);
    setDriveFileId(null);
    
    try {
      const res = await axios.post(
        "http://localhost:5000/api/invoice/download",
        formData,
        {
          responseType: "blob",
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      const url = window.URL.createObjectURL(new Blob([res.data], { type: "application/pdf" }));
      const link = document.createElement("a");
      link.href = url;
      link.download = `INVOICE-${formData.client}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
    } catch (err) {
      alert("Failed to generate invoice");
    } finally {
      setLoading(false);
    }
  };

  const previewInvoice = async () => {
    if (!formData.client || !formData.items.length) {
      alert("Please fill client name and at least one item");
      return;
    }

    setLoading(true);
    
    try {
      const res = await axios.post(
        "http://localhost:5000/api/invoice/preview",
        formData,
        {
          responseType: "blob",
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      const url = window.URL.createObjectURL(new Blob([res.data], { type: "application/pdf" }));
      window.open(url, "_blank");
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert("Preview failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header - Same as before */}
        <div className="flex items-center justify-between mb-8">
          <button 
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-slate-500 hover:text-slate-700 transition"
          >
            <ArrowLeft size={18} />
            Back to Dashboard
          </button>
          <div className="flex items-center gap-2">
            <FileText size={20} className="text-indigo-600" />
            <span className="text-sm font-medium text-slate-600">Professional Invoice</span>
          </div>
        </div>

        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-indigo-50 px-4 py-2 rounded-full mb-4">
            <Sparkles size={16} className="text-indigo-600" />
            <span className="text-sm font-medium text-indigo-600">Smart Invoice Generator</span>
          </div>
          <h1 className="text-4xl font-bold text-slate-800 mb-3">
            Invoice <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">Generator</span>
          </h1>
          <p className="text-slate-500">Create professional, tax-compliant invoices in seconds</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Form Section - Beautiful UI */}
          <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6">
            <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
              <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                <span className="text-xs font-bold text-indigo-600">1</span>
              </div>
              Invoice Details
            </h2>
            
            <div className="space-y-4">
              {/* Client Name */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Client Name *</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    type="text"
                    value={formData.client}
                    onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                    className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                    placeholder="Enter client name"
                  />
                </div>
              </div>
              
              {/* Client Email & Phone */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Client Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                    <input
                      type="email"
                      value={formData.clientEmail}
                      onChange={(e) => setFormData({ ...formData, clientEmail: e.target.value })}
                      className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      placeholder="client@email.com"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Client Phone</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                    <input
                      type="tel"
                      value={formData.clientPhone}
                      onChange={(e) => setFormData({ ...formData, clientPhone: e.target.value })}
                      className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      placeholder="+91 98765 43210"
                    />
                  </div>
                </div>
              </div>
              
              {/* Company Name */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Your Company</label>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    placeholder="Your company name"
                  />
                </div>
              </div>
              
              {/* Items Section */}
              <div className="border-t pt-4">
                <div className="flex justify-between items-center mb-3">
                  <label className="text-sm font-medium text-slate-700">Items / Services</label>
                  <button
                    onClick={addItem}
                    className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                  >
                    <Plus size={14} /> Add Item
                  </button>
                </div>
                
                <div className="space-y-2">
                  {formData.items.map((item, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <input
                        type="text"
                        placeholder="Item name"
                        value={item.name}
                        onChange={(e) => handleItemChange(idx, 'name', e.target.value)}
                        className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                      />
                      <input
                        type="number"
                        placeholder="Qty"
                        value={item.qty}
                        onChange={(e) => handleItemChange(idx, 'qty', e.target.value)}
                        className="w-20 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                      />
                      <input
                        type="number"
                        placeholder="Price"
                        value={item.price}
                        onChange={(e) => handleItemChange(idx, 'price', e.target.value)}
                        className="w-28 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                      />
                      {formData.items.length > 1 && (
                        <button
                          onClick={() => removeItem(idx)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                
                {/* Total Summary */}
                <div className="mt-4 p-4 bg-slate-50 rounded-xl">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Subtotal:</span>
                    <span className="font-semibold text-slate-800">₹{formData.total.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-sm mt-1">
                    <span className="text-slate-600">GST (18%):</span>
                    <span className="font-semibold text-slate-800">₹{(formData.total * 0.18).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold mt-2 pt-2 border-t border-slate-200">
                    <span className="text-slate-800">Total Amount:</span>
                    <span className="text-indigo-600">₹{(formData.total * 1.18).toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>
              
              {/* Google Drive Option */}
              <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg">
                <input
                  type="checkbox"
                  checked={uploadToDrive}
                  onChange={(e) => setUploadToDrive(e.target.checked)}
                  id="upload-drive"
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="upload-drive" className="text-sm text-slate-600 flex items-center gap-2 cursor-pointer">
                  <CloudUpload size={14} />
                  Auto-save invoice to Google Drive
                </label>
              </div>
              
              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={previewInvoice}
                  disabled={loading}
                  className="flex-1 bg-white border-2 border-slate-200 text-slate-700 py-2.5 rounded-lg font-semibold hover:bg-slate-50 transition flex items-center justify-center gap-2"
                >
                  <Eye size={16} />
                  Preview
                </button>
                <button
                  onClick={generatePDF}
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-indigo-600 to-violet-600 text-white py-2.5 rounded-lg font-semibold hover:shadow-lg transition flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                  Generate Invoice
                </button>
              </div>
            </div>
          </div>
          
          {/* Info Section - Beautiful Card */}
          <div className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 rounded-2xl p-6 border border-indigo-100">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                <Sparkles size={20} className="text-indigo-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-800">Professional Invoice Features</h3>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mt-0.5">
                  <span className="text-xs text-green-600">✓</span>
                </div>
                <div>
                  <p className="font-medium text-slate-700">Tax Compliant</p>
                  <p className="text-xs text-slate-500">Automatic GST calculation (18%)</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mt-0.5">
                  <span className="text-xs text-green-600">✓</span>
                </div>
                <div>
                  <p className="font-medium text-slate-700">QR Code Verification</p>
                  <p className="text-xs text-slate-500">Scan to verify invoice authenticity</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mt-0.5">
                  <span className="text-xs text-green-600">✓</span>
                </div>
                <div>
                  <p className="font-medium text-slate-700">Multiple Items</p>
                  <p className="text-xs text-slate-500">Add unlimited line items with quantities</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mt-0.5">
                  <span className="text-xs text-green-600">✓</span>
                </div>
                <div>
                  <p className="font-medium text-slate-700">Auto Invoice Number</p>
                  <p className="text-xs text-slate-500">Sequential numbering for tracking</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mt-0.5">
                  <span className="text-xs text-green-600">✓</span>
                </div>
                <div>
                  <p className="font-medium text-slate-700">Cloud Backup</p>
                  <p className="text-xs text-slate-500">Auto-save to Google Drive</p>
                </div>
              </div>
            </div>
            
            {/* Payment Info Preview */}
            <div className="mt-6 p-4 bg-white/60 rounded-xl">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Payment Methods Accepted</p>
              <div className="flex gap-2">
                <span className="px-2 py-1 bg-white rounded text-xs">UPI</span>
                <span className="px-2 py-1 bg-white rounded text-xs">Net Banking</span>
                <span className="px-2 py-1 bg-white rounded text-xs">Card</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}