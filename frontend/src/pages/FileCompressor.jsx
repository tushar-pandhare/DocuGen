import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { 
  Upload, FileText, ImageIcon, Zap, CheckCircle, 
  Loader2, Download, CloudUpload, Trash2, Settings,
  ArrowLeft, Shield, Clock, Award, Sparkles, HardDrive,
  Activity, FolderInput, FileDown
} from "lucide-react";

export default function FileCompressor() {
  const navigate = useNavigate();
  const [files, setFiles] = useState([]);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const [uploadToDrive, setUploadToDrive] = useState(false);
  const [quality, setQuality] = useState(70);
  const [showSettings, setShowSettings] = useState(false);
  const [compressedFiles, setCompressedFiles] = useState([]);

  const handleSelect = (e) => {
    const selected = Array.from(e.target.files);
    setFiles(prev => [...prev, ...selected]);
  };

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const clearAll = () => {
    setFiles([]);
    setCompressedFiles([]);
  };

  const formatSize = (bytes) => {
    if (!bytes) return '0 Bytes';
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return parseFloat((bytes / Math.pow(1024, i)).toFixed(2)) + " " + sizes[i];
  };

  const totalSize = files.reduce((sum, file) => sum + file.size, 0);
  const estimatedCompressedSize = totalSize * (quality / 100);

  const handleCompress = async () => {
    if (!files.length) return;

    setLoading(true);
    setProgress(0);
    setCompressedFiles([]);

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

      setCompressedFiles(res.data.files);
      
      res.data.files.forEach((file) => {
        if (file.download) {
          const link = document.createElement("a");
          link.href = file.download;
          link.download = file.name;
          link.click();
        }
      });

      if (uploadToDrive) {
        alert(`${res.data.files.length} files uploaded to Google Drive!`);
      } else {
        alert("Files compressed and downloaded successfully!");
      }
    } catch (err) {
      alert("Compression failed");
    } finally {
      setLoading(false);
      setProgress(0);
    }
  };

  const stats = {
    totalFiles: files.length,
    totalSize: formatSize(totalSize),
    estimatedSize: formatSize(estimatedCompressedSize),
    savings: totalSize > 0 ? Math.round((1 - (quality / 100)) * 100) : 0
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <div className="max-w-7xl mx-auto px-6 py-8">
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
            <div className="w-8 h-8 bg-cyan-100 rounded-lg flex items-center justify-center">
              <FolderInput size={16} className="text-cyan-600" />
            </div>
            <span className="text-sm font-medium text-slate-600">File Compressor</span>
          </div>
        </div>

        {/* Hero Section */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-500 px-5 py-2 rounded-full mb-5 shadow-sm">
            <Sparkles size={14} className="text-white" />
            <span className="text-xs font-medium text-white">Smart Compression</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-800 mb-3">
            File <span className="bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">Compressor</span>
          </h1>
          <p className="text-slate-500 max-w-2xl mx-auto">
            Reduce file size while maintaining quality with intelligent compression
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Upload Section */}
          <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
            <div className="bg-gradient-to-r from-cyan-600 to-blue-600 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <Upload size={20} className="text-white" />
                </div>
                <div>
                  <h2 className="text-white font-semibold">Upload Files</h2>
                  <p className="text-cyan-100 text-xs">Select images or PDFs to compress</p>
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center hover:border-cyan-400 transition-all cursor-pointer bg-slate-50 hover:bg-cyan-50/30">
                <input
                  type="file"
                  multiple
                  onChange={handleSelect}
                  className="hidden"
                  id="compress-upload"
                />
                <label htmlFor="compress-upload" className="cursor-pointer block">
                  <div className="w-20 h-20 mx-auto bg-cyan-100 rounded-2xl flex items-center justify-center mb-4">
                    <Upload size={32} className="text-cyan-600" />
                  </div>
                  <p className="text-cyan-600 font-semibold">Click to select files</p>
                  <p className="text-xs text-slate-400 mt-2">PNG, JPG, PDF supported</p>
                </label>
              </div>

              {/* Stats Preview */}
              {files.length > 0 && (
                <div className="mt-4 p-3 bg-cyan-50 rounded-xl border border-cyan-100">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-600">Total files</span>
                    <span className="font-semibold text-cyan-600">{stats.totalFiles}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm mt-1">
                    <span className="text-slate-600">Total size</span>
                    <span className="font-semibold text-slate-700">{stats.totalSize}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm mt-1">
                    <span className="text-slate-600">Est. compressed</span>
                    <span className="font-semibold text-emerald-600">{stats.estimatedSize}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm mt-1 pt-1 border-t border-cyan-200">
                    <span className="text-slate-600">Est. savings</span>
                    <span className="font-semibold text-green-600">~{stats.savings}%</span>
                  </div>
                </div>
              )}

              {/* Settings Toggle */}
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="mt-4 w-full flex items-center justify-center gap-2 text-sm text-slate-500 hover:text-slate-700 py-2 rounded-lg hover:bg-slate-50 transition"
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
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                  />
                  <div className="flex justify-between text-xs text-slate-400 mt-2">
                    <span>Higher compression</span>
                    <span>Better quality</span>
                  </div>
                </div>
              )}

              {/* Drive Option */}
              <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={uploadToDrive}
                    onChange={(e) => setUploadToDrive(e.target.checked)}
                    id="upload-drive-compress"
                    className="w-4 h-4 rounded border-slate-300 text-cyan-600 focus:ring-cyan-500"
                  />
                  <label htmlFor="upload-drive-compress" className="flex items-center gap-2 cursor-pointer">
                    <CloudUpload size={16} className="text-cyan-600" />
                    <div>
                      <span className="text-sm font-medium text-slate-700">Save to Google Drive</span>
                      <p className="text-xs text-slate-400">Automatically upload compressed files to Drive</p>
                    </div>
                  </label>
                </div>
              </div>

              <button
                onClick={handleCompress}
                disabled={!files.length || loading}
                className="w-full mt-6 bg-gradient-to-r from-cyan-600 to-blue-600 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 hover:shadow-lg hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Compressing... {progress}%
                  </>
                ) : (
                  <>
                    <Activity size={18} />
                    Compress {files.length} File{files.length !== 1 ? 's' : ''}
                  </>
                )}
              </button>

              {progress > 0 && !loading && (
                <div className="mt-4">
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-cyan-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Files List Section */}
          <div className="space-y-6">
            {/* Selected Files Card */}
            <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
              <div className="bg-gradient-to-r from-slate-800 to-slate-900 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                      <HardDrive size={20} className="text-white" />
                    </div>
                    <div>
                      <h2 className="text-white font-semibold">Selected Files</h2>
                      <p className="text-slate-300 text-xs">{files.length} file{files.length !== 1 ? 's' : ''} ready to compress</p>
                    </div>
                  </div>
                  {files.length > 0 && (
                    <button
                      onClick={clearAll}
                      className="text-xs text-red-400 hover:text-red-300 transition"
                    >
                      Clear all
                    </button>
                  )}
                </div>
              </div>

              <div className="p-6">
                {files.length === 0 ? (
                  <div className="h-80 flex flex-col items-center justify-center text-center">
                    <div className="w-20 h-20 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
                      <ImageIcon size={32} className="text-slate-300" />
                    </div>
                    <p className="text-slate-400 font-medium">No files selected</p>
                    <p className="text-xs text-slate-300 mt-1">Upload images or PDFs to compress</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-80 overflow-y-auto">
                    {files.map((file, idx) => (
                      <div key={idx} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition group">
                        <div className="p-2 bg-white rounded-lg">
                          {file.type.startsWith("image") ? (
                            <ImageIcon size={16} className="text-cyan-500" />
                          ) : (
                            <FileText size={16} className="text-blue-500" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-700 truncate">{file.name}</p>
                          <p className="text-xs text-slate-400">{formatSize(file.size)}</p>
                        </div>
                        <CheckCircle size={16} className="text-emerald-500 flex-shrink-0" />
                        <button
                          onClick={() => removeFile(idx)}
                          className="p-1 hover:bg-red-100 rounded-lg transition opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 size={14} className="text-slate-400 hover:text-red-500" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Compressed Files Card */}
            {compressedFiles.length > 0 && (
              <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
                <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                      <FileDown size={20} className="text-white" />
                    </div>
                    <div>
                      <h2 className="text-white font-semibold">Compressed Files</h2>
                      <p className="text-emerald-100 text-xs">{compressedFiles.length} file{compressedFiles.length !== 1 ? 's' : ''} ready</p>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {compressedFiles.map((file, idx) => (
                      <div key={idx} className="flex items-center gap-3 p-3 bg-emerald-50 rounded-xl">
                        <div className="p-2 bg-white rounded-lg">
                          <Download size={16} className="text-emerald-500" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-slate-700 truncate">{file.name}</p>
                        </div>
                        <a
                          href={file.download}
                          download={file.name}
                          className="px-3 py-1.5 bg-emerald-500 text-white rounded-lg text-xs hover:bg-emerald-600 transition"
                        >
                          Download
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Tips Card */}
            <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-cyan-50 rounded-xl flex items-center justify-center">
                  <Award size={18} className="text-cyan-600" />
                </div>
                <h3 className="font-semibold text-slate-800">Compression Tips</h3>
              </div>
              <ul className="space-y-2 text-sm text-slate-600">
                <li className="flex items-start gap-2">
                  <span className="text-cyan-500">•</span>
                  Lower quality = smaller file size, higher quality = better output
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-cyan-500">•</span>
                  Enable Drive upload to automatically save compressed files
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-cyan-500">•</span>
                  Images and PDFs are optimized with smart algorithms
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-cyan-500">•</span>
                  Files are downloaded automatically after compression
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Features Banner */}
        <div className="mt-10 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 flex items-center gap-3">
            <div className="w-10 h-10 bg-cyan-50 rounded-xl flex items-center justify-center">
              <Zap size={18} className="text-cyan-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-700">Fast Compression</p>
              <p className="text-xs text-slate-400">Process in seconds</p>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 flex items-center gap-3">
            <div className="w-10 h-10 bg-cyan-50 rounded-xl flex items-center justify-center">
              <Shield size={18} className="text-cyan-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-700">Quality Control</p>
              <p className="text-xs text-slate-400">Adjustable compression level</p>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 flex items-center gap-3">
            <div className="w-10 h-10 bg-cyan-50 rounded-xl flex items-center justify-center">
              <CloudUpload size={18} className="text-cyan-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-700">Cloud Backup</p>
              <p className="text-xs text-slate-400">Save to Google Drive</p>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 flex items-center gap-3">
            <div className="w-10 h-10 bg-cyan-50 rounded-xl flex items-center justify-center">
              <Clock size={18} className="text-cyan-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-700">Batch Processing</p>
              <p className="text-xs text-slate-400">Multiple files at once</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
// import { useState } from "react";
// import axios from "axios";
// import { 
//   Upload, FileText, ImageIcon, Zap, CheckCircle, 
//   Loader2, Download, CloudUpload, Trash2, Settings
// } from "lucide-react";

// export default function FileCompressor() {
//   const [files, setFiles] = useState([]);
//   const [progress, setProgress] = useState(0);
//   const [loading, setLoading] = useState(false);
//   const [uploadToDrive, setUploadToDrive] = useState(false);
//   const [quality, setQuality] = useState(70);
//   const [showSettings, setShowSettings] = useState(false);

//   const handleSelect = (e) => {
//     const selected = Array.from(e.target.files);
//     setFiles(prev => [...prev, ...selected]);
//   };

//   const removeFile = (index) => {
//     setFiles(prev => prev.filter((_, i) => i !== index));
//   };

//   const clearAll = () => {
//     setFiles([]);
//   };

//   const formatSize = (bytes) => {
//     const sizes = ["Bytes", "KB", "MB"];
//     const i = Math.floor(Math.log(bytes) / Math.log(1024));
//     return parseFloat((bytes / Math.pow(1024, i)).toFixed(2)) + " " + sizes[i];
//   };

//   const handleCompress = async () => {
//     if (!files.length) return;

//     setLoading(true);
//     setProgress(0);

//     const formData = new FormData();
//     files.forEach((f) => formData.append("files", f));
//     formData.append("quality", quality);
//     formData.append("uploadToDrive", uploadToDrive);

//     try {
//       const res = await axios.post(
//         "http://localhost:5000/api/compress",
//         formData,
//         {
//           headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
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
//         alert("Files uploaded to Google Drive");
//       }
//     } catch (err) {
//       alert("Compression failed");
//     } finally {
//       setLoading(false);
//       setProgress(0);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-slate-100">
//       <div className="max-w-6xl mx-auto px-6 py-8">
//         {/* Header */}
//         <div className="text-center mb-10">
//           <div className="inline-flex items-center gap-2 bg-amber-50 px-4 py-2 rounded-full mb-4">
//             <Zap size={16} className="text-amber-600" />
//             <span className="text-sm font-medium text-amber-600">File Compressor</span>
//           </div>
//           <h1 className="text-4xl font-bold text-slate-800 mb-3">
//             Smart File <span className="bg-linear-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">Compressor</span>
//           </h1>
//           <p className="text-slate-500">Reduce file size while maintaining quality</p>
//         </div>

//         <div className="grid lg:grid-cols-2 gap-8">
//           {/* Upload Section */}
//           <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6">
//             <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center hover:border-amber-400 transition-colors">
//               <input
//                 type="file"
//                 multiple
//                 onChange={handleSelect}
//                 className="hidden"
//                 id="compress-upload"
//               />
//               <label htmlFor="compress-upload" className="cursor-pointer block">
//                 <Upload className="mx-auto h-12 w-12 text-slate-400 mb-3" />
//                 <p className="text-amber-600 font-semibold">Select files to compress</p>
//                 <p className="text-xs text-slate-400 mt-1">Images & PDFs supported</p>
//               </label>
//             </div>

//             {/* Settings Toggle */}
//             <button
//               onClick={() => setShowSettings(!showSettings)}
//               className="mt-4 w-full flex items-center justify-center gap-2 text-sm text-slate-500 hover:text-slate-700"
//             >
//               <Settings size={14} />
//               {showSettings ? "Hide Settings" : "Show Settings"}
//             </button>

//             {/* Quality Slider */}
//             {showSettings && (
//               <div className="mt-4 p-4 bg-slate-50 rounded-xl">
//                 <label className="block text-sm font-medium text-slate-700 mb-2">
//                   Compression Quality: {quality}%
//                 </label>
//                 <input
//                   type="range"
//                   min="10"
//                   max="100"
//                   value={quality}
//                   onChange={(e) => setQuality(e.target.value)}
//                   className="w-full"
//                 />
//                 <p className="text-xs text-slate-400 mt-2">Lower quality = smaller file size</p>
//               </div>
//             )}

//             {/* Drive Option */}
//             <div className="mt-4 flex items-center gap-2 p-3 bg-slate-50 rounded-lg">
//               <input
//                 type="checkbox"
//                 checked={uploadToDrive}
//                 onChange={(e) => setUploadToDrive(e.target.checked)}
//                 id="upload-drive"
//               />
//               <label htmlFor="upload-drive" className="text-sm text-slate-600 flex items-center gap-2">
//                 <CloudUpload size={14} />
//                 Upload compressed files to Google Drive
//               </label>
//             </div>

//             <button
//               onClick={handleCompress}
//               disabled={!files.length || loading}
//               className="w-full mt-6 bg-linear-to-r from-amber-600 to-orange-600 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 hover:shadow-lg transition-all disabled:opacity-50"
//             >
//               {loading ? (
//                 <>
//                   <Loader2 size={18} className="animate-spin" />
//                   Compressing... {progress}%
//                 </>
//               ) : (
//                 <>
//                   <Zap size={18} />
//                   Compress Files
//                 </>
//               )}
//             </button>

//             {progress > 0 && !loading && (
//               <div className="mt-4">
//                 <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
//                   <div
//                     className="bg-linear-to-r from-amber-500 to-orange-500 h-2 rounded-full transition-all duration-300"
//                     style={{ width: `${progress}%` }}
//                   />
//                 </div>
//               </div>
//             )}
//           </div>

//           {/* Files List */}
//           <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6">
//             <div className="flex justify-between items-center mb-4">
//               <h3 className="font-semibold text-slate-800 flex items-center gap-2">
//                 <FileText size={16} className="text-amber-500" />
//                 Selected Files ({files.length})
//               </h3>
//               {files.length > 0 && (
//                 <button
//                   onClick={clearAll}
//                   className="text-xs text-red-500 hover:text-red-600 flex items-center gap-1"
//                 >
//                   <Trash2 size={12} /> Clear all
//                 </button>
//               )}
//             </div>

//             {files.length === 0 ? (
//               <div className="h-96 flex flex-col items-center justify-center text-center">
//                 <ImageIcon size={48} className="text-slate-300 mb-3" />
//                 <p className="text-slate-400">No files selected</p>
//                 <p className="text-xs text-slate-300 mt-1">Upload images or PDFs to compress</p>
//               </div>
//             ) : (
//               <div className="space-y-2 max-h-96 overflow-y-auto">
//                 {files.map((file, idx) => (
//                   <div key={idx} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition">
//                     <div className="p-2 bg-white rounded-lg">
//                       {file.type.startsWith("image") ? (
//                         <ImageIcon size={16} className="text-amber-500" />
//                       ) : (
//                         <FileText size={16} className="text-blue-500" />
//                       )}
//                     </div>
//                     <div className="flex-1 min-w-0">
//                       <p className="text-sm font-medium text-slate-700 truncate">{file.name}</p>
//                       <p className="text-xs text-slate-400">{formatSize(file.size)}</p>
//                     </div>
//                     <CheckCircle size={16} className="text-emerald-500 shrink-0" />
//                     <button
//                       onClick={() => removeFile(idx)}
//                       className="p-1 hover:bg-red-100 rounded-lg transition"
//                     >
//                       <Trash2 size={14} className="text-slate-400 hover:text-red-500" />
//                     </button>
//                   </div>
//                 ))}
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }