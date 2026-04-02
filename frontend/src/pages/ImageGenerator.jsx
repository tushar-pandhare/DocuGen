// import { useState, useRef, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import { Home, FileText } from "lucide-react";

// export default function ImageGenerator() {
//   const [images, setImages] = useState([]);      // ✅ multiple previews
//   const [files, setFiles] = useState([]);        // ✅ multiple files
//   const dropRef = useRef(null);
//   const navigate = useNavigate();

//   /* ================= HANDLE FILES ================= */
//   const handleFiles = (selectedFiles) => {
//     const imageFiles = Array.from(selectedFiles).filter(file =>
//       file.type.startsWith("image")
//     );

//     if (!imageFiles.length) return;

//     setFiles(prev => [...prev, ...imageFiles]);

//     imageFiles.forEach(file => {
//       const reader = new FileReader();
//       reader.onload = e =>
//         setImages(prev => [...prev, e.target.result]);
//       reader.readAsDataURL(file);
//     });
//   };

//   const handleInput = e => handleFiles(e.target.files);

//   const handleDrop = e => {
//     e.preventDefault();
//     handleFiles(e.dataTransfer.files);
//   };

//   const handlePaste = e => {
//     const items = Array.from(e.clipboardData.items)
//       .filter(item => item.type.startsWith("image"))
//       .map(item => item.getAsFile());

//     handleFiles(items);
//   };

//   useEffect(() => {
//     const div = dropRef.current;
//     div.addEventListener("paste", handlePaste);
//     return () => div.removeEventListener("paste", handlePaste);
//   }, []);

//   /* ================= SUBMIT ================= */
//   const handleSubmit = async () => {
//     if (!files.length) return alert("Select at least one image");

//     const token = localStorage.getItem("token");
//     if (!token) {
//       navigate("/login");
//       return;
//     }

//     const formData = new FormData();

//     files.forEach(file => {
//       formData.append("images", file);  // ✅ multiple images
//     });

//     try {
//       const res = await fetch("http://localhost:5000/api/pdf/img", {
//         method: "POST",
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//         body: formData,
//       });

//       const data = await res.json();

//       if (!res.ok) {
//         alert(data.message || "Upload failed");
//         return;
//       }

//       /* ===== DOWNLOAD PDF ===== */
//       const byteCharacters = atob(data.pdfBase64);
//       const byteNumbers = new Array(byteCharacters.length)
//         .fill()
//         .map((_, i) => byteCharacters.charCodeAt(i));

//       const blob = new Blob([new Uint8Array(byteNumbers)], {
//         type: "application/pdf",
//       });

//       const url = window.URL.createObjectURL(blob);

//       const a = document.createElement("a");
//       a.href = url;
//       a.download = data.fileName;
//       document.body.appendChild(a);
//       a.click();
//       a.remove();

//       /* ===== OPEN DRIVE ===== */
//       if (data.file?.id) {
//         window.open(
//           `https://drive.google.com/file/d/${data.file.id}/view`,
//           "_blank"
//         );
//       }

//     } catch (err) {
//       console.error(err);
//       alert("Something went wrong");
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gray-100 p-10">

//       {/* TOP NAV */}
//       <div className="max-w-5xl mx-auto mb-6 flex justify-between">
//         <h1 className="text-2xl font-bold">Image to PDF</h1>

//         <div className="flex gap-3">
//           <button
//             onClick={() => navigate("/")}
//             className="px-4 py-2 bg-white border rounded-lg"
//           >
//             <Home size={16} />
//           </button>

//           <button
//             onClick={() => navigate("/invoice-generate")}
//             className="px-4 py-2 bg-black text-white rounded-lg"
//           >
//             <FileText size={16} />
//           </button>
//         </div>
//       </div>

//       {/* MAIN CARD */}
//       <div className="max-w-5xl mx-auto bg-white p-10 rounded-2xl shadow-xl">

//         <div
//           ref={dropRef}
//           onDrop={handleDrop}
//           onDragOver={e => e.preventDefault()}
//           className="border-2 border-dashed rounded-xl p-10 text-center cursor-pointer"
//         >
//           <label className="cursor-pointer text-gray-500">
//             Click, Paste, or Drag Multiple Images
//             <input
//               type="file"
//               accept="image/*"
//               multiple     // ✅ IMPORTANT
//               hidden
//               onChange={handleInput}
//             />
//           </label>
//         </div>

//         {/* PREVIEW GRID */}
//         {images.length > 0 && (
//           <div className="grid grid-cols-3 gap-4 mt-6">
//             {images.map((img, index) => (
//               <img
//                 key={index}
//                 src={img}
//                 alt="preview"
//                 className="rounded-lg shadow"
//               />
//             ))}
//           </div>
//         )}

//         <button
//           onClick={handleSubmit}
//           className="mt-8 bg-black text-white px-8 py-3 rounded-xl"
//         >
//           Convert {files.length > 1 ? "Images" : "Image"} to PDF
//         </button>

//       </div>
//     </div>
//   );
// }
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { 
  Upload, Image, FileText, Loader2, Download, 
  Trash2, Plus, X, Grid, List, Sparkles, CloudUpload, CheckCircle,
  ArrowLeft, Home, Layers, Zap, Shield, Clock
} from "lucide-react";

export default function ImageGenerator() {
  const [images, setImages] = useState([]);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [uploadToDrive, setUploadToDrive] = useState(false);
  const [driveFileId, setDriveFileId] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const handleFiles = (selectedFiles) => {
    const imageFiles = Array.from(selectedFiles).filter(file => file.type.startsWith("image"));
    if (!imageFiles.length) return;

    setFiles(prev => [...prev, ...imageFiles]);
    
    imageFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = e => setImages(prev => [...prev, e.target.result]);
      reader.readAsDataURL(file);
    });
  };

  const handleInput = (e) => handleFiles(e.target.files);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    handleFiles(e.dataTransfer.files);
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const clearAll = () => {
    setImages([]);
    setFiles([]);
    setDriveFileId(null);
  };

  const uploadPdfToDrive = async (blob, fileName) => {
    try {
      const formData = new FormData();
      formData.append("file", blob, fileName);
      formData.append("folder", "DocuGen_Image_PDFs");

      const res = await axios.post("http://localhost:5000/api/drive/upload", formData, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      
      setDriveFileId(res.data.fileId);
      return res.data.fileId;
    } catch (err) {
      console.error("Drive upload failed:", err);
      return null;
    }
  };

  // const handleSubmit = async () => {
  //   if (!files.length) {
  //     alert("Select at least one image");
  //     return;
  //   }

  //   const token = localStorage.getItem("token");
  //   if (!token) {
  //     navigate("/login");
  //     return;
  //   }

  //   const formData = new FormData();
  //   files.forEach(file => formData.append("images", file));

  //   try {
  //     setLoading(true);
  //     const res = await fetch("http://localhost:5000/api/pdf/img", {
  //       method: "POST",
  //       headers: { Authorization: `Bearer ${token}` },
  //       body: formData,
  //     });

  //     const data = await res.json();
  //     if (!res.ok) throw new Error(data.message);

  //     const byteCharacters = atob(data.pdfBase64);
  //     const byteNumbers = new Array(byteCharacters.length).fill().map((_, i) => byteCharacters.charCodeAt(i));
  //     const blob = new Blob([new Uint8Array(byteNumbers)], { type: "application/pdf" });
  //     const url = window.URL.createObjectURL(blob);
      
  //     const a = document.createElement("a");
  //     a.href = url;
  //     a.download = data.fileName;
  //     document.body.appendChild(a);
  //     a.click();
  //     a.remove();
  //     window.URL.revokeObjectURL(url);
      
  //     if (uploadToDrive) {
  //       const fileId = await uploadPdfToDrive(blob, data.fileName);
  //       if (fileId) {
  //         alert("PDF uploaded to Google Drive!");
  //       }
  //     }
      
  //     if (data.file?.id) {
  //       window.open(`https://drive.google.com/file/d/${data.file.id}/view`, "_blank");
  //     }
  //   } catch (err) {
  //     alert("Something went wrong");
  //   } finally {
  //     setLoading(false);
  //   }
  // };
  const handleSubmit = async () => {
  if (!files.length) {
    alert("Select at least one image");
    return;
  }

  const token = localStorage.getItem("token");
  if (!token) {
    navigate("/login");
    return;
  }

  const formData = new FormData();
  files.forEach(file => formData.append("images", file));
  
  // ✅ Add uploadToDrive preference to form data
  formData.append("uploadToDrive", uploadToDrive);

  try {
    setLoading(true);
    const res = await fetch("http://localhost:5000/api/pdf/img", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message);

    const byteCharacters = atob(data.pdfBase64);
    const byteNumbers = new Array(byteCharacters.length).fill().map((_, i) => byteCharacters.charCodeAt(i));
    const blob = new Blob([new Uint8Array(byteNumbers)], { type: "application/pdf" });
    const url = window.URL.createObjectURL(blob);
    
    const a = document.createElement("a");
    a.href = url;
    a.download = data.fileName;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
    
    // Show success message if uploaded to Drive
    if (data.uploadedToDrive) {
      alert("PDF generated and uploaded to Google Drive!");
    } else if (uploadToDrive) {
      alert("PDF generated but Drive upload failed. Please check your Google Drive connection.");
    } else {
      alert("PDF generated successfully!");
    }
    
  } catch (err) {
    console.error("Error:", err);
    alert("Something went wrong: " + err.message);
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Header with Back Button */}
        <div className="flex items-center justify-between mb-8">
          <button 
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-slate-500 hover:text-slate-700 transition group"
          >
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition" />
            Back to Dashboard
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
              <FileText size={16} className="text-emerald-600" />
            </div>
            <span className="text-sm font-medium text-slate-600">Image to PDF Converter</span>
          </div>
        </div>

        {/* Hero Section */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 px-5 py-2 rounded-full mb-5 shadow-sm">
            <Sparkles size={14} className="text-white" />
            <span className="text-xs font-medium text-white">Smart Converter</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-800 mb-3">
            Image to <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">PDF</span>
          </h1>
          <p className="text-slate-500 max-w-2xl mx-auto">
            Convert multiple images into a single, professional PDF document in seconds
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Upload Section */}
          <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <Upload size={20} className="text-white" />
                </div>
                <div>
                  <h2 className="text-white font-semibold">Upload Images</h2>
                  <p className="text-emerald-100 text-xs">Select or drag & drop images</p>
                </div>
              </div>
            </div>

            <div className="p-6">
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${
                  dragActive ? "border-emerald-500 bg-emerald-50" : "border-slate-200 hover:border-emerald-400 hover:bg-slate-50"
                }`}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleInput}
                  className="hidden"
                />
                <div className="w-20 h-20 mx-auto bg-emerald-50 rounded-2xl flex items-center justify-center mb-4">
                  <Upload size={32} className="text-emerald-500" />
                </div>
                <p className="text-emerald-600 font-semibold">Click or drag images here</p>
                <p className="text-xs text-slate-400 mt-2">PNG, JPG, WEBP, GIF supported • Max 20MB each</p>
              </div>

              {images.length > 0 && (
                <div className="mt-4 flex justify-between items-center">
                  <p className="text-sm text-slate-600">
                    <span className="font-semibold text-emerald-600">{images.length}</span> image{images.length !== 1 ? 's' : ''} selected
                  </p>
                  <button
                    onClick={clearAll}
                    className="text-xs text-red-500 hover:text-red-600 flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-red-50 transition"
                  >
                    <Trash2 size={12} /> Clear all
                  </button>
                </div>
              )}

              {/* Google Drive Upload Option */}
              <div className="mt-5 p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={uploadToDrive}
                    onChange={(e) => setUploadToDrive(e.target.checked)}
                    id="upload-drive-img2pdf"
                    className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <label htmlFor="upload-drive-img2pdf" className="flex items-center gap-2 cursor-pointer">
                    <CloudUpload size={16} className="text-emerald-600" />
                    <div>
                      <span className="text-sm font-medium text-slate-700">Save to Google Drive</span>
                      <p className="text-xs text-slate-400">Automatically upload generated PDF to Drive</p>
                    </div>
                  </label>
                </div>
              </div>

              {driveFileId && (
                <div className="mt-3 p-3 bg-green-50 rounded-xl flex items-center justify-between border border-green-100">
                  <span className="text-sm text-green-700 flex items-center gap-2">
                    <CheckCircle size={14} />
                    Saved to Drive!
                  </span>
                  <button
                    onClick={() => window.open(`https://drive.google.com/file/d/${driveFileId}/view`, "_blank")}
                    className="text-emerald-600 hover:underline text-xs font-medium"
                  >
                    View File →
                  </button>
                </div>
              )}

              <button
                onClick={handleSubmit}
                disabled={!images.length || loading}
                className="w-full mt-6 bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 hover:shadow-lg hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Converting...
                  </>
                ) : (
                  <>
                    <FileText size={18} />
                    Convert to PDF
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Preview Section */}
          <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
            <div className="bg-gradient-to-r from-slate-800 to-slate-900 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                    <Image size={20} className="text-white" />
                  </div>
                  <div>
                    <h2 className="text-white font-semibold">Preview</h2>
                    <p className="text-slate-300 text-xs">Your selected images</p>
                  </div>
                </div>
                {images.length > 0 && (
                  <div className="flex gap-1">
                    <button 
                      onClick={() => setViewMode('grid')}
                      className={`p-1.5 rounded-lg transition ${viewMode === 'grid' ? 'bg-white/20 text-white' : 'text-slate-400 hover:bg-white/10'}`}
                    >
                      <Grid size={14} />
                    </button>
                    <button 
                      onClick={() => setViewMode('list')}
                      className={`p-1.5 rounded-lg transition ${viewMode === 'list' ? 'bg-white/20 text-white' : 'text-slate-400 hover:bg-white/10'}`}
                    >
                      <List size={14} />
                    </button>
                  </div>
                )}
              </div>
            </div>
            
            <div className="p-6">
              {images.length === 0 ? (
                <div className="h-80 flex flex-col items-center justify-center text-center">
                  <div className="w-24 h-24 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
                    <Image size={40} className="text-slate-300" />
                  </div>
                  <p className="text-slate-400 font-medium">No images selected</p>
                  <p className="text-xs text-slate-300 mt-1">Upload images to see preview</p>
                </div>
              ) : viewMode === 'grid' ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-96 overflow-y-auto p-1">
                  {images.map((img, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={img}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-28 object-cover rounded-xl shadow-sm group-hover:shadow-md transition"
                      />
                      <div className="absolute inset-0 bg-black/40 rounded-xl opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                        <button
                          onClick={() => removeImage(index)}
                          className="p-1.5 bg-red-500 rounded-full hover:bg-red-600 transition"
                        >
                          <Trash2 size={14} className="text-white" />
                        </button>
                      </div>
                      <div className="absolute top-2 left-2 bg-black/60 text-white text-xs px-2 py-0.5 rounded-full">
                        {index + 1}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {images.map((img, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition group">
                      <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                        <img src={img} alt="" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-700">Image {index + 1}</p>
                        <p className="text-xs text-slate-400">Ready to convert</p>
                      </div>
                      <button
                        onClick={() => removeImage(index)}
                        className="p-1.5 text-red-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              
              {images.length > 0 && (
                <div className="mt-4 p-3 bg-emerald-50 rounded-xl">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">Total Images</span>
                    <span className="font-semibold text-emerald-600">{images.length}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm mt-1">
                    <span className="text-slate-600">Merge Order</span>
                    <span className="text-xs text-slate-400">Top to bottom as shown</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Features Banner */}
        <div className="mt-10 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
              <Zap size={18} className="text-emerald-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-700">Fast Conversion</p>
              <p className="text-xs text-slate-400">Convert in seconds</p>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
              <Shield size={18} className="text-emerald-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-700">High Quality</p>
              <p className="text-xs text-slate-400">Preserve image quality</p>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
              <CloudUpload size={18} className="text-emerald-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-700">Cloud Backup</p>
              <p className="text-xs text-slate-400">Save to Google Drive</p>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
              <Clock size={18} className="text-emerald-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-700">Batch Processing</p>
              <p className="text-xs text-slate-400">Multiple images at once</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}