// import { useState } from "react";
// import axios from "axios";
// import {
//   UploadCloud,
//   FileText,
//   ImageIcon,
//   Zap,
//   CheckCircle,
//   Loader2,
// } from "lucide-react";

// export default function FileCompressor() {
//   const [files, setFiles] = useState([]);
//   const [progress, setProgress] = useState(0);
//   const [preview, setPreview] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [uploadToDrive, setUploadToDrive] = useState(false);

//   const handleSelect = (e) => {
//     const selected = Array.from(e.target.files);
//     setFiles(selected);

//     if (selected[0]?.type.startsWith("image")) {
//       setPreview(URL.createObjectURL(selected[0]));
//     } else {
//       setPreview(null);
//     }
//   };

//   const formatSize = (bytes) => {
//     const k = 1024;
//     const sizes = ["Bytes", "KB", "MB"];
//     const i = Math.floor(Math.log(bytes) / Math.log(k));
//     return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
//   };

//   const handleCompress = async () => {
//     if (!files.length) return;

//     setLoading(true);
//     setProgress(0);

//     const formData = new FormData();
//     files.forEach((f) => formData.append("files", f));
//     formData.append("quality", 60);
//     formData.append("uploadToDrive", uploadToDrive);

//     try {
//       const res = await axios.post(
//         "http://localhost:5000/api/compress",
//         formData,
//         {
//           headers: {
//             Authorization: `Bearer ${localStorage.getItem("token")}`,
//           },
//           onUploadProgress: (e) => {
//             const percent = Math.round((e.loaded * 100) / e.total);
//             setProgress(percent);
//           },
//         }
//       );

//       res.data.files.forEach((file) => {
//         if (file.download) {
//           const link = document.createElement("a");
//           link.href = file.download;
//           link.download = file.name;
//           link.click();
//         }
//       });

//       if (uploadToDrive) {
//         alert("Uploaded to Google Drive 🚀");
//       }

//     } catch (err) {
//       alert("Compression failed");
//     } finally {
//       setLoading(false);
//       setProgress(0);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-linear-to-br from-slate-100 via-white to-slate-200 flex items-center justify-center px-4 py-10">
      
//       <div className="w-full max-w-5xl bg-white border border-slate-200 rounded-3xl shadow-xl p-8">
        
//         {/* HEADER */}
//         <div className="text-center mb-10">
//           <h1 className="text-4xl font-extrabold text-slate-800">
//             🚀 Smart File Compressor
//           </h1>
//           <p className="text-slate-500 mt-2">
//             Compress images & PDFs or upload directly to Google Drive
//           </p>
//         </div>

//         <div className="grid md:grid-cols-2 gap-8">

//           {/* LEFT */}
//           <div>
//             <div className="border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-2xl p-8 text-center transition-all relative group bg-slate-50">
              
//               <input
//                 type="file"
//                 multiple
//                 onChange={handleSelect}
//                 className="absolute inset-0 opacity-0 cursor-pointer"
//               />

//               <UploadCloud className="mx-auto h-12 w-12 text-slate-400 group-hover:text-emerald-500 transition" />
//               <p className="text-emerald-600 font-semibold mt-3">
//                 Click or Drag files here
//               </p>
//               <p className="text-xs text-slate-500 mt-1">
//                 Images, PDFs supported
//               </p>
//             </div>

//             {/* GOOGLE DRIVE */}
//             <div className="mt-5 flex items-center gap-2 text-slate-600">
//               <input
//                 type="checkbox"
//                 checked={uploadToDrive}
//                 onChange={(e) => setUploadToDrive(e.target.checked)}
//               />
//               Upload to Google Drive
//             </div>

//             {/* BUTTON */}
//             <button
//               onClick={handleCompress}
//               disabled={loading || !files.length}
//               className="mt-6 w-full bg-linear-to-r from-emerald-500 to-green-600 hover:scale-105 transition-transform text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 shadow-md disabled:opacity-50"
//             >
//               {loading ? (
//                 <>
//                   <Loader2 className="animate-spin" size={18} />
//                   Processing...
//                 </>
//               ) : (
//                 <>
//                   <Zap size={18} />
//                   Compress Files
//                 </>
//               )}
//             </button>

//             {/* PROGRESS */}
//             {progress > 0 && (
//               <div className="mt-4">
//                 <div className="text-xs text-slate-600 mb-1">{progress}%</div>
//                 <div className="w-full bg-slate-200 h-2 rounded-full">
//                   <div
//                     className="bg-emerald-500 h-2 rounded-full transition-all"
//                     style={{ width: `${progress}%` }}
//                   />
//                 </div>
//               </div>
//             )}
//           </div>

//           {/* RIGHT */}
//           <div className="space-y-4">
//             {files.length === 0 ? (
//               <div className="h-full flex items-center justify-center text-slate-400 border border-slate-200 rounded-xl p-6 bg-slate-50">
//                 No files selected
//               </div>
//             ) : (
//               files.map((f, i) => (
//                 <div
//                   key={i}
//                   className="flex items-center gap-4 bg-white border border-slate-200 p-4 rounded-xl shadow-sm hover:shadow-md transition"
//                 >
//                   <div className="p-3 bg-slate-100 rounded-lg">
//                     {f.type.startsWith("image") ? (
//                       <ImageIcon className="text-emerald-500" />
//                     ) : (
//                       <FileText className="text-blue-500" />
//                     )}
//                   </div>

//                   <div className="flex-1">
//                     <p className="text-slate-800 text-sm font-semibold truncate">
//                       {f.name}
//                     </p>
//                     <p className="text-slate-500 text-xs">
//                       {formatSize(f.size)}
//                     </p>
//                   </div>

//                   <CheckCircle className="text-emerald-500" size={18} />
//                 </div>
//               ))
//             )}

//             {/* PREVIEW */}
//             {preview && (
//               <img
//                 src={preview}
//                 alt="preview"
//                 className="mt-4 rounded-xl shadow"
//               />
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
import { useState } from "react";
import axios from "axios";
import { 
  Upload, FileText, ImageIcon, Zap, CheckCircle, 
  Loader2, Download, CloudUpload, Trash2, Settings
} from "lucide-react";

export default function FileCompressor() {
  const [files, setFiles] = useState([]);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const [uploadToDrive, setUploadToDrive] = useState(false);
  const [quality, setQuality] = useState(70);
  const [showSettings, setShowSettings] = useState(false);

  const handleSelect = (e) => {
    const selected = Array.from(e.target.files);
    setFiles(prev => [...prev, ...selected]);
  };

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const clearAll = () => {
    setFiles([]);
  };

  const formatSize = (bytes) => {
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return parseFloat((bytes / Math.pow(1024, i)).toFixed(2)) + " " + sizes[i];
  };

  const handleCompress = async () => {
    if (!files.length) return;

    setLoading(true);
    setProgress(0);

    const formData = new FormData();
    files.forEach((f) => formData.append("files", f));
    formData.append("quality", quality);
    formData.append("uploadToDrive", uploadToDrive);

    try {
      const res = await axios.post(
        "http://localhost:5000/api/compress",
        formData,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          onUploadProgress: (e) => {
            const percent = Math.round((e.loaded * 100) / e.total);
            setProgress(percent);
          },
        }
      );

      res.data.files.forEach((file) => {
        if (file.download) {
          const link = document.createElement("a");
          link.href = file.download;
          link.download = file.name;
          link.click();
        }
      });

      if (uploadToDrive) {
        alert("Files uploaded to Google Drive");
      }
    } catch (err) {
      alert("Compression failed");
    } finally {
      setLoading(false);
      setProgress(0);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-slate-100">
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-amber-50 px-4 py-2 rounded-full mb-4">
            <Zap size={16} className="text-amber-600" />
            <span className="text-sm font-medium text-amber-600">File Compressor</span>
          </div>
          <h1 className="text-4xl font-bold text-slate-800 mb-3">
            Smart File <span className="bg-linear-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">Compressor</span>
          </h1>
          <p className="text-slate-500">Reduce file size while maintaining quality</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Upload Section */}
          <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6">
            <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center hover:border-amber-400 transition-colors">
              <input
                type="file"
                multiple
                onChange={handleSelect}
                className="hidden"
                id="compress-upload"
              />
              <label htmlFor="compress-upload" className="cursor-pointer block">
                <Upload className="mx-auto h-12 w-12 text-slate-400 mb-3" />
                <p className="text-amber-600 font-semibold">Select files to compress</p>
                <p className="text-xs text-slate-400 mt-1">Images & PDFs supported</p>
              </label>
            </div>

            {/* Settings Toggle */}
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="mt-4 w-full flex items-center justify-center gap-2 text-sm text-slate-500 hover:text-slate-700"
            >
              <Settings size={14} />
              {showSettings ? "Hide Settings" : "Show Settings"}
            </button>

            {/* Quality Slider */}
            {showSettings && (
              <div className="mt-4 p-4 bg-slate-50 rounded-xl">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Compression Quality: {quality}%
                </label>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={quality}
                  onChange={(e) => setQuality(e.target.value)}
                  className="w-full"
                />
                <p className="text-xs text-slate-400 mt-2">Lower quality = smaller file size</p>
              </div>
            )}

            {/* Drive Option */}
            <div className="mt-4 flex items-center gap-2 p-3 bg-slate-50 rounded-lg">
              <input
                type="checkbox"
                checked={uploadToDrive}
                onChange={(e) => setUploadToDrive(e.target.checked)}
                id="upload-drive"
              />
              <label htmlFor="upload-drive" className="text-sm text-slate-600 flex items-center gap-2">
                <CloudUpload size={14} />
                Upload compressed files to Google Drive
              </label>
            </div>

            <button
              onClick={handleCompress}
              disabled={!files.length || loading}
              className="w-full mt-6 bg-linear-to-r from-amber-600 to-orange-600 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 hover:shadow-lg transition-all disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Compressing... {progress}%
                </>
              ) : (
                <>
                  <Zap size={18} />
                  Compress Files
                </>
              )}
            </button>

            {progress > 0 && !loading && (
              <div className="mt-4">
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-linear-to-r from-amber-500 to-orange-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Files List */}
          <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                <FileText size={16} className="text-amber-500" />
                Selected Files ({files.length})
              </h3>
              {files.length > 0 && (
                <button
                  onClick={clearAll}
                  className="text-xs text-red-500 hover:text-red-600 flex items-center gap-1"
                >
                  <Trash2 size={12} /> Clear all
                </button>
              )}
            </div>

            {files.length === 0 ? (
              <div className="h-96 flex flex-col items-center justify-center text-center">
                <ImageIcon size={48} className="text-slate-300 mb-3" />
                <p className="text-slate-400">No files selected</p>
                <p className="text-xs text-slate-300 mt-1">Upload images or PDFs to compress</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {files.map((file, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition">
                    <div className="p-2 bg-white rounded-lg">
                      {file.type.startsWith("image") ? (
                        <ImageIcon size={16} className="text-amber-500" />
                      ) : (
                        <FileText size={16} className="text-blue-500" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-700 truncate">{file.name}</p>
                      <p className="text-xs text-slate-400">{formatSize(file.size)}</p>
                    </div>
                    <CheckCircle size={16} className="text-emerald-500 shrink-0" />
                    <button
                      onClick={() => removeFile(idx)}
                      className="p-1 hover:bg-red-100 rounded-lg transition"
                    >
                      <Trash2 size={14} className="text-slate-400 hover:text-red-500" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}