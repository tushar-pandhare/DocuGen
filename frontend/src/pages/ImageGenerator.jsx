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
  Trash2, Plus, X, Grid, List, Sparkles, CloudUpload, CheckCircle 
} from "lucide-react";

export default function ImageGenerator() {
  const [images, setImages] = useState([]);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [uploadToDrive, setUploadToDrive] = useState(false);
  const [driveFileId, setDriveFileId] = useState(null);
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
      
      // Upload to Drive if option is selected
      if (uploadToDrive) {
        const fileId = await uploadPdfToDrive(blob, data.fileName);
        if (fileId) {
          alert("PDF uploaded to Google Drive!");
        }
      }
      
      if (data.file?.id) {
        window.open(`https://drive.google.com/file/d/${data.file.id}/view`, "_blank");
      }
    } catch (err) {
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-slate-100">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-emerald-50 px-4 py-2 rounded-full mb-4">
            <Sparkles size={16} className="text-emerald-600" />
            <span className="text-sm font-medium text-emerald-600">Image to PDF Converter</span>
          </div>
          <h1 className="text-4xl font-bold text-slate-800 mb-3">
            Image → <span className="bg-linear-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">PDF</span>
          </h1>
          <p className="text-slate-500">Convert multiple images into a single PDF document</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Upload Area */}
          <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6">
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
              <Upload className="mx-auto h-12 w-12 text-slate-400 mb-3" />
              <p className="text-emerald-600 font-semibold">Click or drag images here</p>
              <p className="text-xs text-slate-400 mt-1">PNG, JPG, WEBP, GIF supported</p>
            </div>

            {images.length > 0 && (
              <div className="mt-4 flex justify-between items-center">
                <p className="text-sm text-slate-600">{images.length} image{images.length !== 1 ? 's' : ''} selected</p>
                <button
                  onClick={clearAll}
                  className="text-xs text-red-500 hover:text-red-600 flex items-center gap-1"
                >
                  <Trash2 size={12} /> Clear all
                </button>
              </div>
            )}

            {/* Google Drive Upload Option */}
            <div className="mt-4 flex items-center gap-2 p-3 bg-slate-50 rounded-lg">
              <input
                type="checkbox"
                checked={uploadToDrive}
                onChange={(e) => setUploadToDrive(e.target.checked)}
                id="upload-drive-img2pdf"
                className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
              />
              <label htmlFor="upload-drive-img2pdf" className="text-sm text-slate-600 flex items-center gap-2 cursor-pointer">
                <CloudUpload size={14} />
                Upload generated PDF to Google Drive
              </label>
            </div>

            {driveFileId && (
              <div className="mt-3 p-3 bg-green-50 rounded-lg flex items-center justify-between">
                <span className="text-sm text-green-700 flex items-center gap-2">
                  <CheckCircle size={14} />
                  Saved to Drive!
                </span>
                <button
                  onClick={() => window.open(`https://drive.google.com/file/d/${driveFileId}/view`, "_blank")}
                  className="text-emerald-600 hover:underline text-xs"
                >
                  View File
                </button>
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={!images.length || loading}
              className="w-full mt-6 bg-linear-to-r from-emerald-600 to-teal-600 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 hover:shadow-lg transition-all disabled:opacity-50"
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

          {/* Preview Grid */}
          <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6">
            <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <Grid size={16} className="text-emerald-500" />
              Preview ({images.length} images)
            </h3>
            
            {images.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center text-center">
                <Image size={48} className="text-slate-300 mb-3" />
                <p className="text-slate-400">No images selected</p>
                <p className="text-xs text-slate-300 mt-1">Upload images to see preview</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-96 overflow-y-auto p-1">
                {images.map((img, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={img}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg shadow-sm"
                    />
                    <button
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 p-1 bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition"
                    >
                      <X size={12} className="text-white" />
                    </button>
                    <div className="absolute bottom-1 left-1 bg-black/50 text-white text-xs px-1.5 py-0.5 rounded">
                      {index + 1}
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {images.length > 0 && (
              <p className="text-xs text-slate-400 mt-4 text-center">
                Images will be merged in the order shown above
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}