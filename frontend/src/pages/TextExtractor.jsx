//   const [file, setFile] = useState(null);
//   const [text, setText] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [copied, setCopied] = useState(false);
//   const [uploadToDrive, setUploadToDrive] = useState(false);
//   const [driveFileId, setDriveFileId] = useState(null);
//   const fileInputRef = useRef(null);
//   const navigate = useNavigate();

//   const handleFileSelect = (e) => {
//     const selectedFile = e.target.files[0];
//     if (selectedFile) {
//       setFile(selectedFile);
//       setText("");
//       setDriveFileId(null);
//     }
//   };

//   const handleDragOver = (e) => {
//     e.preventDefault();
//     e.currentTarget.classList.add("border-indigo-500", "bg-indigo-50");
//   };

//   const handleDragLeave = (e) => {
//     e.preventDefault();
//     e.currentTarget.classList.remove("border-indigo-500", "bg-indigo-50");
//   };

//   const handleDrop = (e) => {
//     e.preventDefault();
//     e.currentTarget.classList.remove("border-indigo-500", "bg-indigo-50");
//     const droppedFile = e.dataTransfer.files[0];
//     if (droppedFile && (droppedFile.type.startsWith("image/") || droppedFile.type === "application/pdf")) {
//       setFile(droppedFile);
//       setText("");
//       setDriveFileId(null);
//     }
//   };

//   const uploadTextToDrive = async (extractedText, fileName) => {
//     try {
//       const blob = new Blob([extractedText], { type: "text/plain" });
//       const formData = new FormData();
//       formData.append("file", blob, `${fileName}_extracted_text.txt`);
//       formData.append("folder", "DocuGen_Extracted_Texts");

//       const res = await axios.post("http://localhost:5000/api/drive/upload", formData, {
//         headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
//       });
      
//       setDriveFileId(res.data.fileId);
//       return res.data.fileId;
//     } catch (err) {
//       console.error("Drive upload failed:", err);
//       return null;
//     }
//   };

//   const handleExtract = async () => {
//     if (!file) {
//       alert("Please upload a file first");
//       return;
//     }

//     const token = localStorage.getItem("token");
//     if (!token) {
//       navigate("/login");
//       return;
//     }

//     const formData = new FormData();
//     formData.append("file", file);

//     try {
//       setLoading(true);
//       const res = await fetch("http://localhost:5000/api/ocr/extract-text", {
//         method: "POST",
//         headers: { Authorization: `Bearer ${token}` },
//         body: formData,
//       });

//       const data = await res.json();
//       if (!res.ok) throw new Error(data.message || "Extraction failed");
      
//       setText(data.text);
      
//       if (uploadToDrive && data.text) {
//         const fileId = await uploadTextToDrive(data.text, file.name);
//         if (fileId) {
//           alert("Extracted text uploaded to Google Drive!");
//         }
//       }
//     } catch (err) {
//       alert(err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const copyToClipboard = () => {
//     navigator.clipboard.writeText(text);
//     setCopied(true);
//     setTimeout(() => setCopied(false), 2000);
//   };

//   const clearAll = () => {
//     setFile(null);
//     setText("");
//     setDriveFileId(null);
//     if (fileInputRef.current) fileInputRef.current.value = "";
//   };

//   const stats = {
//     wordCount: text ? text.split(/\s+/).filter(w => w.length > 0).length : 0,
//     charCount: text ? text.length : 0,
//     lineCount: text ? text.split('\n').length : 0
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
//       <div className="max-w-7xl mx-auto px-6 py-8">
//         {/* Header with Back Button */}
//         <div className="flex items-center justify-between mb-8">
//           <button 
//             onClick={() => navigate("/")}
//             className="flex items-center gap-2 text-slate-500 hover:text-slate-700 transition group"
//           >
//             <ArrowLeft size={18} className="group-hover:-translate-x-1 transition" />
//             Back to Dashboard
//           </button>
//           <div className="flex items-center gap-2">
//             <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
//               <FileText size={16} className="text-indigo-600" />
//             </div>
//             <span className="text-sm font-medium text-slate-600">Text Extractor</span>
//           </div>
//         </div>

//         {/* Hero Section */}
//         <div className="text-center mb-10">
//           <div className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-violet-500 px-5 py-2 rounded-full mb-5 shadow-sm">
//             <Sparkles size={14} className="text-white" />
//             <span className="text-xs font-medium text-white">AI-Powered OCR</span>
//           </div>
//           <h1 className="text-4xl md:text-5xl font-bold text-slate-800 mb-3">
//             Text <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">Extractor</span>
//           </h1>
//           <p className="text-slate-500 max-w-2xl mx-auto">
//             Extract text from images and PDFs instantly using advanced OCR technology
//           </p>
//         </div>

//         <div className="grid lg:grid-cols-2 gap-8">
//           {/* Upload Section */}
//           <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
//             <div className="bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-4">
//               <div className="flex items-center gap-3">
//                 <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
//                   <Upload size={20} className="text-white" />
//                 </div>
//                 <div>
//                   <h2 className="text-white font-semibold">Upload Document</h2>
//                   <p className="text-indigo-100 text-xs">Select image or PDF file</p>
//                 </div>
//               </div>
//             </div>

//             <div className="p-6">
//               <div
//                 onDragOver={handleDragOver}
//                 onDragLeave={handleDragLeave}
//                 onDrop={handleDrop}
//                 className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
//                   file ? "border-indigo-400 bg-indigo-50" : "border-slate-200 hover:border-indigo-400 hover:bg-slate-50"
//                 }`}
//                 onClick={() => fileInputRef.current?.click()}
//               >
//                 <input
//                   ref={fileInputRef}
//                   type="file"
//                   accept="image/*,application/pdf"
//                   onChange={handleFileSelect}
//                   className="hidden"
//                 />
                
//                 {file ? (
//                   <div className="space-y-3">
//                     <div className="w-20 h-20 mx-auto bg-indigo-100 rounded-2xl flex items-center justify-center">
//                       {file.type.startsWith("image/") ? (
//                         <Image size={32} className="text-indigo-600" />
//                       ) : (
//                         <FileText size={32} className="text-indigo-600" />
//                       )}
//                     </div>
//                     <p className="font-medium text-slate-700">{file.name}</p>
//                     <p className="text-xs text-slate-400">
//                       {(file.size / 1024 / 1024).toFixed(2)} MB
//                     </p>
//                     <button
//                       onClick={(e) => { e.stopPropagation(); clearAll(); }}
//                       className="text-red-500 text-sm hover:text-red-600 flex items-center gap-1 mx-auto px-3 py-1 rounded-lg hover:bg-red-50 transition"
//                     >
//                       <Trash2 size={14} /> Remove
//                     </button>
//                   </div>
//                 ) : (
//                   <div className="space-y-3">
//                     <div className="w-20 h-20 mx-auto bg-slate-100 rounded-2xl flex items-center justify-center">
//                       <Upload size={32} className="text-slate-400" />
//                     </div>
//                     <p className="text-indigo-600 font-semibold">Click or drag to upload</p>
//                     <p className="text-xs text-slate-400">PNG, JPG, PDF up to 10MB</p>
//                   </div>
//                 )}
//               </div>

//               {/* Google Drive Upload Option */}
//               <div className="mt-5 p-3 bg-slate-50 rounded-xl border border-slate-100">
//                 <div className="flex items-center gap-3">
//                   <input
//                     type="checkbox"
//                     checked={uploadToDrive}
//                     onChange={(e) => setUploadToDrive(e.target.checked)}
//                     id="upload-drive-ocr"
//                     className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
//                   />
//                   <label htmlFor="upload-drive-ocr" className="flex items-center gap-2 cursor-pointer">
//                     <CloudUpload size={16} className="text-indigo-600" />
//                     <div>
//                       <span className="text-sm font-medium text-slate-700">Save to Google Drive</span>
//                       <p className="text-xs text-slate-400">Automatically upload extracted text to Drive</p>
//                     </div>
//                   </label>
//                 </div>
//               </div>

//               {driveFileId && (
//                 <div className="mt-3 p-3 bg-green-50 rounded-xl border border-green-100">
//                   <div className="flex items-center justify-between">
//                     <span className="text-sm text-green-700 flex items-center gap-2">
//                       <Check size={14} />
//                       Saved to Drive!
//                     </span>
//                     <button
//                       onClick={() => window.open(`https://drive.google.com/file/d/${driveFileId}/view`, "_blank")}
//                       className="text-green-600 hover:underline text-xs font-medium"
//                     >
//                       View File →
//                     </button>
//                   </div>
//                 </div>
//               )}

//               <button
//                 onClick={handleExtract}
//                 disabled={!file || loading}
//                 className="w-full mt-6 bg-gradient-to-r from-indigo-600 to-violet-600 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 hover:shadow-lg hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
//               >
//                 {loading ? (
//                   <>
//                     <Loader2 size={18} className="animate-spin" />
//                     Processing...
//                   </>
//                 ) : (
//                   <>
//                     <Sparkles size={18} />
//                     Extract Text
//                   </>
//                 )}
//               </button>
//             </div>
//           </div>

//           {/* Results Section */}
//           <div className="space-y-6">
//             {/* Results Card */}
//             <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
//               <div className="bg-gradient-to-r from-slate-800 to-slate-900 px-6 py-4">
//                 <div className="flex items-center justify-between">
//                   <div className="flex items-center gap-3">
//                     <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
//                       <Eye size={20} className="text-white" />
//                     </div>
//                     <div>
//                       <h2 className="text-white font-semibold">Extracted Results</h2>
//                       <p className="text-slate-300 text-xs">AI-powered text extraction</p>
//                     </div>
//                   </div>
//                   {text && (
//                     <button
//                       onClick={copyToClipboard}
//                       className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 text-white rounded-lg text-sm hover:bg-white/20 transition"
//                     >
//                       {copied ? <Check size={14} /> : <Copy size={14} />}
//                       {copied ? "Copied" : "Copy"}
//                     </button>
//                   )}
//                 </div>
//               </div>
              
//               <div className="p-6 min-h-[300px]">
//                 {!text && !loading && (
//                   <div className="h-full flex flex-col items-center justify-center text-center py-12">
//                     <div className="w-20 h-20 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
//                       <FileText size={32} className="text-slate-300" />
//                     </div>
//                     <p className="text-slate-400 font-medium">No text extracted yet</p>
//                     <p className="text-xs text-slate-300 mt-1">Upload a file and click extract</p>
//                   </div>
//                 )}

//                 {loading && (
//                   <div className="space-y-3 animate-pulse">
//                     <div className="h-3 bg-slate-200 rounded w-3/4"></div>
//                     <div className="h-3 bg-slate-200 rounded"></div>
//                     <div className="h-3 bg-slate-200 rounded w-5/6"></div>
//                     <div className="h-3 bg-slate-200 rounded w-2/3"></div>
//                     <div className="h-3 bg-slate-200 rounded w-4/5"></div>
//                   </div>
//                 )}

//                 {text && !loading && (
//                   <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 max-h-96 overflow-y-auto">
//                     <pre className="whitespace-pre-wrap font-sans text-sm text-slate-700 leading-relaxed">
//                       {text}
//                     </pre>
//                   </div>
//                 )}
//               </div>
//             </div>

//             {/* Stats Card */}
//             {text && (
//               <div className="bg-gradient-to-br from-indigo-50 to-violet-50 rounded-2xl p-5 border border-indigo-100">
//                 <div className="flex items-center gap-3 mb-4">
//                   <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
//                     <Award size={20} className="text-indigo-600" />
//                   </div>
//                   <h3 className="font-bold text-slate-800">Text Statistics</h3>
//                 </div>
//                 <div className="grid grid-cols-3 gap-3">
//                   <div className="bg-white rounded-xl p-3 text-center">
//                     <p className="text-2xl font-bold text-indigo-600">{stats.wordCount}</p>
//                     <p className="text-xs text-slate-500">Words</p>
//                   </div>
//                   <div className="bg-white rounded-xl p-3 text-center">
//                     <p className="text-2xl font-bold text-indigo-600">{stats.charCount}</p>
//                     <p className="text-xs text-slate-500">Characters</p>
//                   </div>
//                   <div className="bg-white rounded-xl p-3 text-center">
//                     <p className="text-2xl font-bold text-indigo-600">{stats.lineCount}</p>
//                     <p className="text-xs text-slate-500">Lines</p>
//                   </div>
//                 </div>
//               </div>
//             )}

//             {/* Tips Card */}
//             <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
//               <div className="flex items-center gap-3 mb-3">
//                 <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
//                   <Zap size={18} className="text-amber-600" />
//                 </div>
//                 <h3 className="font-semibold text-slate-800">Pro Tips</h3>
//               </div>
//               <ul className="space-y-2 text-sm text-slate-600">
//                 <li className="flex items-start gap-2">
//                   <span className="text-amber-500">•</span>
//                   Use clear, high-resolution images for better accuracy
//                 </li>
//                 <li className="flex items-start gap-2">
//                   <span className="text-amber-500">•</span>
//                   Enable Drive upload to save extracted text automatically
//                 </li>
//                 <li className="flex items-start gap-2">
//                   <span className="text-amber-500">•</span>
//                   Copy extracted text to clipboard with one click
//                 </li>
//               </ul>
//             </div>
//           </div>
//         </div>

//         {/* Features Banner */}
//         <div className="mt-10 grid grid-cols-1 md:grid-cols-4 gap-4">
//           <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 flex items-center gap-3">
//             <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
//               <Zap size={18} className="text-indigo-600" />
//             </div>
//             <div>
//               <p className="text-sm font-semibold text-slate-700">Fast Processing</p>
//               <p className="text-xs text-slate-400">Extract in seconds</p>
//             </div>
//           </div>
//           <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 flex items-center gap-3">
//             <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
//               <Shield size={18} className="text-indigo-600" />
//             </div>
//             <div>
//               <p className="text-sm font-semibold text-slate-700">High Accuracy</p>
//               <p className="text-xs text-slate-400">AI-powered OCR</p>
//             </div>
//           </div>
//           <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 flex items-center gap-3">
//             <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
//               <CloudUpload size={18} className="text-indigo-600" />
//             </div>
//             <div>
//               <p className="text-sm font-semibold text-slate-700">Cloud Backup</p>
//               <p className="text-xs text-slate-400">Save to Google Drive</p>
//             </div>
//           </div>
//           <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 flex items-center gap-3">
//             <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
//               <Clock size={18} className="text-indigo-600" />
//             </div>
//             <div>
//               <p className="text-sm font-semibold text-slate-700">Multiple Formats</p>
//               <p className="text-xs text-slate-400">Images & PDFs supported</p>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { 
  Upload, FileText, Copy, Check, Loader2, 
  Image, File, Trash2, Sparkles, CloudUpload, 
  ArrowLeft, Zap, Shield, Clock, Award, Eye, Cloud
} from "lucide-react";
import { useState, useRef, useEffect } from 'react';

export default function TextExtractor() {
  const [file, setFile] = useState(null);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [uploadToDrive, setUploadToDrive] = useState(false);
  const [driveFileId, setDriveFileId] = useState(null);
  const [isGoogleConnected, setIsGoogleConnected] = useState(false);
  const [checkingDrive, setCheckingDrive] = useState(true);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  // Check Google Drive connection on mount
  useEffect(() => {
    const checkDriveConnection = async () => {
      if (!token) return;
      try {
        setCheckingDrive(true);
        const res = await axios.get("http://localhost:5000/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const user = res.data;
        const connected =
          user?.googleTokens &&
          user.googleTokens.access_token &&
          Object.keys(user.googleTokens).length > 0;
        setIsGoogleConnected(!!connected);
      } catch {
        setIsGoogleConnected(false);
      } finally {
        setCheckingDrive(false);
      }
    };
    checkDriveConnection();
  }, [token]);

  const handleGoogleConnect = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/auth/google", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.url) window.location.href = res.data.url;
    } catch (err) {
      if (err.response?.status === 401) {
        alert("Session expired. Please login again.");
        localStorage.removeItem("token");
        navigate("/login");
      } else {
        alert("Google connection failed");
      }
    }
  };

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setText("");
      setDriveFileId(null);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.currentTarget.classList.add("border-indigo-500", "bg-indigo-50");
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.currentTarget.classList.remove("border-indigo-500", "bg-indigo-50");
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.currentTarget.classList.remove("border-indigo-500", "bg-indigo-50");
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && (droppedFile.type.startsWith("image/") || droppedFile.type === "application/pdf")) {
      setFile(droppedFile);
      setText("");
      setDriveFileId(null);
    }
  };

  const uploadTextToDrive = async (extractedText, fileName) => {
    try {
      const blob = new Blob([extractedText], { type: "text/plain" });
      const formData = new FormData();
      formData.append("file", blob, `${fileName}_extracted_text.txt`);
      formData.append("folder", "DocuGen_Extracted_Texts");

      const res = await axios.post("http://localhost:5000/api/drive/upload", formData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setDriveFileId(res.data.fileId);
      return res.data.fileId;
    } catch (err) {
      console.error("Drive upload failed:", err);
      return null;
    }
  };

  const handleExtract = async () => {
    if (!file) {
      alert("Please upload a file first");
      return;
    }
    if (!token) {
      navigate("/login");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      setLoading(true);
      const res = await fetch("http://localhost:5000/api/ocr/extract-text", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Extraction failed");

      setText(data.text);

      if (uploadToDrive && data.text) {
        const fileId = await uploadTextToDrive(data.text, file.name);
        if (fileId) alert("Extracted text uploaded to Google Drive!");
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const clearAll = () => {
    setFile(null);
    setText("");
    setDriveFileId(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const stats = {
    wordCount: text ? text.split(/\s+/).filter(w => w.length > 0).length : 0,
    charCount: text ? text.length : 0,
    lineCount: text ? text.split('\n').length : 0
  };

  // Drive section rendered based on connection status
  const renderDriveSection = () => {
    if (checkingDrive) {
      return (
        <div className="mt-5 p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-3">
          <Loader2 size={16} className="text-slate-400 animate-spin" />
          <span className="text-sm text-slate-400">Checking Drive connection...</span>
        </div>
      );
    }

    if (!isGoogleConnected) {
      return (
        <div className="mt-5 p-4 bg-gradient-to-r from-indigo-50 to-violet-50 rounded-xl border border-indigo-100">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 bg-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
              <Cloud size={16} className="text-indigo-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-slate-700">Save to Google Drive</p>
              <p className="text-xs text-slate-500 mt-0.5 mb-3">
                Connect your Google Drive to automatically save extracted text to the cloud.
              </p>
              <button
                onClick={handleGoogleConnect}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-xs font-semibold rounded-lg hover:shadow-md hover:scale-[1.02] transition-all"
              >
                <Cloud size={13} />
                Connect Google Drive
              </button>
            </div>
          </div>
        </div>
      );
    }

    // Connected — show upload toggle
    return (
      <>
        <div className="mt-5 p-3 bg-slate-50 rounded-xl border border-slate-100">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={uploadToDrive}
              onChange={(e) => setUploadToDrive(e.target.checked)}
              id="upload-drive-ocr"
              className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            <label htmlFor="upload-drive-ocr" className="flex items-center gap-2 cursor-pointer">
              <CloudUpload size={16} className="text-indigo-600" />
              <div>
                <span className="text-sm font-medium text-slate-700">Save to Google Drive</span>
                <p className="text-xs text-slate-400">Automatically upload extracted text to Drive</p>
              </div>
            </label>
          </div>
          <div className="mt-2 flex items-center gap-1.5 pl-7">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
            <span className="text-xs text-emerald-600 font-medium">Google Drive connected</span>
          </div>
        </div>

        {driveFileId && (
          <div className="mt-3 p-3 bg-green-50 rounded-xl border border-green-100">
            <div className="flex items-center justify-between">
              <span className="text-sm text-green-700 flex items-center gap-2">
                <Check size={14} />
                Saved to Drive!
              </span>
              <button
                onClick={() => window.open(`https://drive.google.com/file/d/${driveFileId}/view`, "_blank")}
                className="text-green-600 hover:underline text-xs font-medium"
              >
                View File →
              </button>
            </div>
          </div>
        )}
      </>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <div className="max-w-7xl mx-auto px-6 py-8">
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
              <FileText size={16} className="text-indigo-600" />
            </div>
            <span className="text-sm font-medium text-slate-600">Text Extractor</span>
          </div>
        </div>

        {/* Hero */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-violet-500 px-5 py-2 rounded-full mb-5 shadow-sm">
            <Sparkles size={14} className="text-white" />
            <span className="text-xs font-medium text-white">AI-Powered OCR</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-800 mb-3">
            Text <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">Extractor</span>
          </h1>
          <p className="text-slate-500 max-w-2xl mx-auto">
            Extract text from images and PDFs instantly using advanced OCR technology
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Upload Section */}
          <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <Upload size={20} className="text-white" />
                </div>
                <div>
                  <h2 className="text-white font-semibold">Upload Document</h2>
                  <p className="text-indigo-100 text-xs">Select image or PDF file</p>
                </div>
              </div>
            </div>

            <div className="p-6">
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                  file ? "border-indigo-400 bg-indigo-50" : "border-slate-200 hover:border-indigo-400 hover:bg-slate-50"
                }`}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={handleFileSelect}
                  className="hidden"
                />

                {file ? (
                  <div className="space-y-3">
                    <div className="w-20 h-20 mx-auto bg-indigo-100 rounded-2xl flex items-center justify-center">
                      {file.type.startsWith("image/") ? (
                        <Image size={32} className="text-indigo-600" />
                      ) : (
                        <FileText size={32} className="text-indigo-600" />
                      )}
                    </div>
                    <p className="font-medium text-slate-700">{file.name}</p>
                    <p className="text-xs text-slate-400">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                    <button
                      onClick={(e) => { e.stopPropagation(); clearAll(); }}
                      className="text-red-500 text-sm hover:text-red-600 flex items-center gap-1 mx-auto px-3 py-1 rounded-lg hover:bg-red-50 transition"
                    >
                      <Trash2 size={14} /> Remove
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="w-20 h-20 mx-auto bg-slate-100 rounded-2xl flex items-center justify-center">
                      <Upload size={32} className="text-slate-400" />
                    </div>
                    <p className="text-indigo-600 font-semibold">Click or drag to upload</p>
                    <p className="text-xs text-slate-400">PNG, JPG, PDF up to 10MB</p>
                  </div>
                )}
              </div>

              {/* Drive Section — conditionally rendered */}
              {renderDriveSection()}

              <button
                onClick={handleExtract}
                disabled={!file || loading}
                className="w-full mt-6 bg-gradient-to-r from-indigo-600 to-violet-600 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 hover:shadow-lg hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Sparkles size={18} />
                    Extract Text
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Results Section */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
              <div className="bg-gradient-to-r from-slate-800 to-slate-900 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                      <Eye size={20} className="text-white" />
                    </div>
                    <div>
                      <h2 className="text-white font-semibold">Extracted Results</h2>
                      <p className="text-slate-300 text-xs">AI-powered text extraction</p>
                    </div>
                  </div>
                  {text && (
                    <button
                      onClick={copyToClipboard}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 text-white rounded-lg text-sm hover:bg-white/20 transition"
                    >
                      {copied ? <Check size={14} /> : <Copy size={14} />}
                      {copied ? "Copied" : "Copy"}
                    </button>
                  )}
                </div>
              </div>

              <div className="p-6 min-h-[300px]">
                {!text && !loading && (
                  <div className="h-full flex flex-col items-center justify-center text-center py-12">
                    <div className="w-20 h-20 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
                      <FileText size={32} className="text-slate-300" />
                    </div>
                    <p className="text-slate-400 font-medium">No text extracted yet</p>
                    <p className="text-xs text-slate-300 mt-1">Upload a file and click extract</p>
                  </div>
                )}

                {loading && (
                  <div className="space-y-3 animate-pulse">
                    <div className="h-3 bg-slate-200 rounded w-3/4"></div>
                    <div className="h-3 bg-slate-200 rounded"></div>
                    <div className="h-3 bg-slate-200 rounded w-5/6"></div>
                    <div className="h-3 bg-slate-200 rounded w-2/3"></div>
                    <div className="h-3 bg-slate-200 rounded w-4/5"></div>
                  </div>
                )}

                {text && !loading && (
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 max-h-96 overflow-y-auto">
                    <pre className="whitespace-pre-wrap font-sans text-sm text-slate-700 leading-relaxed">
                      {text}
                    </pre>
                  </div>
                )}
              </div>
            </div>

            {/* Stats Card */}
            {text && (
              <div className="bg-gradient-to-br from-indigo-50 to-violet-50 rounded-2xl p-5 border border-indigo-100">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                    <Award size={20} className="text-indigo-600" />
                  </div>
                  <h3 className="font-bold text-slate-800">Text Statistics</h3>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-white rounded-xl p-3 text-center">
                    <p className="text-2xl font-bold text-indigo-600">{stats.wordCount}</p>
                    <p className="text-xs text-slate-500">Words</p>
                  </div>
                  <div className="bg-white rounded-xl p-3 text-center">
                    <p className="text-2xl font-bold text-indigo-600">{stats.charCount}</p>
                    <p className="text-xs text-slate-500">Characters</p>
                  </div>
                  <div className="bg-white rounded-xl p-3 text-center">
                    <p className="text-2xl font-bold text-indigo-600">{stats.lineCount}</p>
                    <p className="text-xs text-slate-500">Lines</p>
                  </div>
                </div>
              </div>
            )}

            {/* Tips Card */}
            <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
                  <Zap size={18} className="text-amber-600" />
                </div>
                <h3 className="font-semibold text-slate-800">Pro Tips</h3>
              </div>
              <ul className="space-y-2 text-sm text-slate-600">
                {[
                  "Use clear, high-resolution images for better accuracy",
                  "Enable Drive upload to save extracted text automatically",
                  "Copy extracted text to clipboard with one click",
                ].map((tip) => (
                  <li key={tip} className="flex items-start gap-2">
                    <span className="text-amber-500">•</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Features Banner */}
        <div className="mt-10 grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { icon: Zap, label: "Fast Processing", sub: "Extract in seconds" },
            { icon: Shield, label: "High Accuracy", sub: "AI-powered OCR" },
            { icon: CloudUpload, label: "Cloud Backup", sub: "Save to Google Drive" },
            { icon: Clock, label: "Multiple Formats", sub: "Images & PDFs supported" },
          ].map(({ icon: Icon, label, sub }) => (
            <div key={label} className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
                <Icon size={18} className="text-indigo-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-700">{label}</p>
                <p className="text-xs text-slate-400">{sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}