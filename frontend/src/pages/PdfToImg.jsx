import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { 
  Upload, FileText, Loader2, Download, ImageIcon, 
  Eye, CloudUpload, X, Layers, Zap, CheckCircle, 
  ArrowLeft, Sparkles, Shield, Clock, Grid, 
  TrendingUp, Star, Award
} from "lucide-react";

export default function PdfToImage() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [previewImg, setPreviewImg] = useState(null);
  const [uploadToDrive, setUploadToDrive] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const token = localStorage.getItem("token");

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === "application/pdf") {
      setFile(selectedFile);
      setImages([]);
      setUploadedFiles([]);
    }
  };

  const uploadImageToDrive = async (img, pageNum) => {
    try {
      const blob = await fetch(img.download).then((res) => res.blob());
      const formData = new FormData();
      formData.append("file", blob, img.name);
      formData.append("folder", "DocuGen_PDF_Images");

      const res = await axios.post("http://localhost:5000/api/drive/upload", formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      return { success: true, fileId: res.data.fileId, page: pageNum };
    } catch (err) {
      console.error("Upload failed:", err);
      return { success: false, page: pageNum };
    }
  };

  const handleConvert = async () => {
    if (!file) {
      alert("Upload a PDF first");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("uploadToDrive", uploadToDrive);

    try {
      setLoading(true);
      const res = await axios.post("http://localhost:5000/api/pdf-to-image", formData);
      setImages(res.data.images);
      
      if (uploadToDrive && res.data.images.length) {
        setUploadedFiles([]);
        const uploadPromises = res.data.images.map((img, idx) => uploadImageToDrive(img, idx + 1));
        const results = await Promise.all(uploadPromises);
        setUploadedFiles(results.filter(r => r.success));
        alert(`${results.filter(r => r.success).length} images uploaded to Google Drive!`);
      }
    } catch (err) {
      alert("Conversion failed");
    } finally {
      setLoading(false);
    }
  };

  const downloadImage = (img) => {
    const a = document.createElement("a");
    a.href = img.download;
    a.download = img.name;
    a.click();
  };

  const downloadAll = () => {
    images.forEach(downloadImage);
  };

  const uploadSingleToDrive = async (img, index) => {
    const result = await uploadImageToDrive(img, index + 1);
    if (result.success) {
      setUploadedFiles(prev => [...prev, result]);
      alert(`Page ${index + 1} uploaded to Drive`);
    } else {
      alert(`Failed to upload page ${index + 1}`);
    }
  };

  // Stats for the page
  const stats = {
    pagesConverted: images.length,
    uploadSuccess: uploadedFiles.length,
    totalSize: file ? (file.size / 1024 / 1024).toFixed(2) : 0
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
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
              <ImageIcon size={16} className="text-purple-600" />
            </div>
            <span className="text-sm font-medium text-slate-600">PDF to Image Converter</span>
          </div>
        </div>

        {/* Hero Section */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 px-5 py-2 rounded-full mb-5 shadow-sm">
            <Sparkles size={14} className="text-white" />
            <span className="text-xs font-medium text-white">Smart Converter</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-800 mb-3">
            PDF → <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Image</span>
          </h1>
          <p className="text-slate-500 max-w-2xl mx-auto">
            Convert PDF pages to high-quality images instantly
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Upload Section */}
          <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <Upload size={20} className="text-white" />
                </div>
                <div>
                  <h2 className="text-white font-semibold">Upload PDF</h2>
                  <p className="text-purple-100 text-xs">Select a PDF file to convert</p>
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center hover:border-purple-400 transition-all cursor-pointer bg-slate-50 hover:bg-purple-50/30">
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="pdf-upload"
                />
                <label htmlFor="pdf-upload" className="cursor-pointer block">
                  <div className="w-20 h-20 mx-auto bg-purple-100 rounded-2xl flex items-center justify-center mb-4">
                    <FileText size={32} className="text-purple-500" />
                  </div>
                  <p className="text-purple-600 font-semibold">Click to upload PDF</p>
                  <p className="text-xs text-slate-400 mt-2">PDF files only, up to 20MB</p>
                </label>
              </div>

              {file && (
                <div className="mt-4 p-3 bg-purple-50 rounded-xl flex items-center gap-3 border border-purple-100">
                  <FileText size={20} className="text-purple-500" />
                  <span className="text-sm text-slate-700 truncate flex-1 font-medium">{file.name}</span>
                  <span className="text-xs text-purple-600 bg-purple-100 px-2 py-1 rounded-full">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </span>
                </div>
              )}

              {/* Google Drive Upload Option */}
              <div className="mt-5 p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={uploadToDrive}
                    onChange={(e) => setUploadToDrive(e.target.checked)}
                    id="upload-drive-pdf2img"
                    className="w-4 h-4 rounded border-slate-300 text-purple-600 focus:ring-purple-500"
                  />
                  <label htmlFor="upload-drive-pdf2img" className="flex items-center gap-2 cursor-pointer">
                    <CloudUpload size={16} className="text-purple-600" />
                    <div>
                      <span className="text-sm font-medium text-slate-700">Auto-upload to Google Drive</span>
                      <p className="text-xs text-slate-400">Automatically save all converted images to Drive</p>
                    </div>
                  </label>
                </div>
              </div>

              {uploadedFiles.length > 0 && (
                <div className="mt-3 p-3 bg-green-50 rounded-xl border border-green-100">
                  <p className="text-sm text-green-700 flex items-center gap-2">
                    <CheckCircle size={14} />
                    {uploadedFiles.length} images uploaded to Drive successfully!
                  </p>
                </div>
              )}

              <button
                onClick={handleConvert}
                disabled={!file || loading}
                className="w-full mt-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 hover:shadow-lg hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Converting...
                  </>
                ) : (
                  <>
                    <Layers size={18} />
                    Convert to Images
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Stats & Info Section - Replaced the "Why convert" section */}
          <div className="space-y-6">
            {/* Quick Stats Card */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                  <TrendingUp size={20} className="text-purple-600" />
                </div>
                <h3 className="font-bold text-slate-800">Current Quick Stats</h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white rounded-xl p-3 text-center">
                  <p className="text-2xl font-bold text-purple-600">{stats.pagesConverted}</p>
                  <p className="text-xs text-slate-500">Pages Converted</p>
                </div>
                <div className="bg-white rounded-xl p-3 text-center">
                  <p className="text-2xl font-bold text-purple-600">{stats.uploadSuccess}</p>
                  <p className="text-xs text-slate-500">Uploaded to Drive</p>
                </div>
                <div className="bg-white rounded-xl p-3 text-center">
                  <p className="text-2xl font-bold text-purple-600">{stats.totalSize || 0}</p>
                  <p className="text-xs text-slate-500">File Size (MB)</p>
                </div>
                <div className="bg-white rounded-xl p-3 text-center">
                  <p className="text-2xl font-bold text-purple-600">{images.length > 0 ? '✓' : '-'}</p>
                  <p className="text-xs text-slate-500">Conversion Status</p>
                </div>
              </div>
            </div>

            {/* Tips Card */}
            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
                  <Award size={20} className="text-amber-600" />
                </div>
                <h3 className="font-bold text-slate-800">Pro Tips</h3>
              </div>
              <ul className="space-y-3">
                <li className="flex items-start gap-2 text-sm text-slate-600">
                  <span className="text-amber-500">💡</span>
                  Use high-quality PDFs for better image results
                </li>
                <li className="flex items-start gap-2 text-sm text-slate-600">
                  <span className="text-amber-500">💡</span>
                  Enable Drive upload for automatic cloud backup
                </li>
                <li className="flex items-start gap-2 text-sm text-slate-600">
                  <span className="text-amber-500">💡</span>
                  Download all images at once using the button above
                </li>
                <li className="flex items-start gap-2 text-sm text-slate-600">
                  <span className="text-amber-500">💡</span>
                  Click on any image to preview in full size
                </li>
              </ul>
            </div>

            {/* Support Card */}
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-5 border border-indigo-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
                  <Star size={20} className="text-indigo-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-700" >Need help?</p>
                  <p className="text-xs text-slate-500">Contact support for assistance</p>
                </div>
                <button className="ml-auto text-xs text-indigo-600 font-medium hover:underline" onClick={() => navigate("/contact-us")}>
                  Contact Us →
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Results Section */}
        {images.length > 0 && (
          <div className="mt-10 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
            <div className="bg-gradient-to-r from-slate-800 to-slate-900 px-6 py-4">
              <div className="flex flex-wrap justify-between items-center gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                    <Grid size={20} className="text-white" />
                  </div>
                  <div>
                    <h2 className="text-white font-semibold">Generated Images</h2>
                    <p className="text-slate-300 text-xs">{images.length} pages converted</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={downloadAll}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600 transition shadow-sm"
                  >
                    <Download size={14} /> Download All
                  </button>
                  {uploadToDrive && (
                    <button
                      onClick={() => images.forEach((img, i) => uploadSingleToDrive(img, i))}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-500 text-white rounded-lg text-sm hover:bg-indigo-600 transition shadow-sm"
                    >
                      <CloudUpload size={14} /> Upload Missing
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {images.map((img, i) => (
                  <div key={i} className="group relative">
                    <img
                      src={img.download}
                      alt={`Page ${i + 1}`}
                      className="w-full h-40 object-cover rounded-xl shadow-sm cursor-pointer hover:shadow-md transition group-hover:scale-[1.02]"
                      onClick={() => setPreviewImg(img.download)}
                    />
                    <div className="absolute top-2 left-2 bg-black/60 text-white text-xs px-2 py-0.5 rounded-full backdrop-blur-sm">
                      Page {i + 1}
                    </div>
                    <div className="absolute inset-0 bg-black/50 rounded-xl opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                      <button
                        onClick={() => downloadImage(img)}
                        className="p-2 bg-white rounded-lg hover:bg-gray-100 transition shadow-md"
                        title="Download"
                      >
                        <Download size={14} className="text-slate-600" />
                      </button>
                      {uploadToDrive && (
                        <button
                          onClick={() => uploadSingleToDrive(img, i)}
                          className="p-2 bg-white rounded-lg hover:bg-gray-100 transition shadow-md"
                          title="Upload to Drive"
                        >
                          <CloudUpload size={14} className="text-indigo-600" />
                        </button>
                      )}
                      <button
                        onClick={() => setPreviewImg(img.download)}
                        className="p-2 bg-white rounded-lg hover:bg-gray-100 transition shadow-md"
                        title="Preview"
                      >
                        <Eye size={14} className="text-purple-600" />
                      </button>
                    </div>
                    {uploadedFiles.find(f => f.page === i + 1) && (
                      <div className="absolute top-2 right-2">
                        <CheckCircle size={16} className="text-green-500 bg-white rounded-full shadow-sm" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Features Banner */}
        <div className="mt-10 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center">
              <Zap size={18} className="text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-700">Fast Conversion</p>
              <p className="text-xs text-slate-400">Convert in seconds</p>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center">
              <Shield size={18} className="text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-700">High Quality</p>
              <p className="text-xs text-slate-400">Preserve original quality</p>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center">
              <CloudUpload size={18} className="text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-700">Cloud Backup</p>
              <p className="text-xs text-slate-400">Save to Google Drive</p>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center">
              <Clock size={18} className="text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-700">Batch Processing</p>
              <p className="text-xs text-slate-400">All pages at once</p>
            </div>
          </div>
        </div>

        {/* Preview Modal */}
        {previewImg && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50" onClick={() => setPreviewImg(null)}>
            <div className="relative max-w-[90vw] max-h-[90vh]">
              <img
                src={previewImg}
                alt="Preview"
                className="max-w-full max-h-[90vh] object-contain rounded-xl shadow-2xl"
              />
              <button
                onClick={() => setPreviewImg(null)}
                className="absolute top-4 right-4 p-2 bg-black/50 rounded-full hover:bg-black/70 transition"
              >
                <X size={20} className="text-white" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
// import { useState } from "react";
// import axios from "axios";
// import { useNavigate } from "react-router-dom";
// import { 
//   Upload, FileText, Loader2, Download, ImageIcon, 
//   Eye, CloudUpload, ChevronLeft, ChevronRight, X,
//   Layers, Zap, CheckCircle 
// } from "lucide-react";

// export default function PdfToImage() {
//   const navigate = useNavigate();
//   const [file, setFile] = useState(null);
//   const [images, setImages] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [previewImg, setPreviewImg] = useState(null);
//   const [uploadToDrive, setUploadToDrive] = useState(false);
//   const [uploadedFiles, setUploadedFiles] = useState([]);
//   const token = localStorage.getItem("token");

//   const handleFileSelect = (e) => {
//     const selectedFile = e.target.files[0];
//     if (selectedFile && selectedFile.type === "application/pdf") {
//       setFile(selectedFile);
//       setImages([]);
//       setUploadedFiles([]);
//     }
//   };

//   const uploadImageToDrive = async (img, pageNum) => {
//     try {
//       const blob = await fetch(img.download).then((res) => res.blob());
//       const formData = new FormData();
//       formData.append("file", blob, img.name);
//       formData.append("folder", "DocuGen_PDF_Images");

//       const res = await axios.post("http://localhost:5000/api/drive/upload", formData, {
//         headers: { Authorization: `Bearer ${token}` }
//       });
      
//       return { success: true, fileId: res.data.fileId, page: pageNum };
//     } catch (err) {
//       console.error("Upload failed:", err);
//       return { success: false, page: pageNum };
//     }
//   };

//   const handleConvert = async () => {
//     if (!file) {
//       alert("Upload a PDF first");
//       return;
//     }

//     const formData = new FormData();
//     formData.append("file", file);

//     try {
//       setLoading(true);
//       const res = await axios.post("http://localhost:5000/api/pdf-to-image", formData);
//       setImages(res.data.images);
      
//       // Upload to Drive if option is selected
//       if (uploadToDrive && res.data.images.length) {
//         setUploadedFiles([]);
//         const uploadPromises = res.data.images.map((img, idx) => uploadImageToDrive(img, idx + 1));
//         const results = await Promise.all(uploadPromises);
//         setUploadedFiles(results.filter(r => r.success));
//         alert(`${results.filter(r => r.success).length} images uploaded to Google Drive!`);
//       }
//     } catch (err) {
//       alert("Conversion failed");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const downloadImage = (img) => {
//     const a = document.createElement("a");
//     a.href = img.download;
//     a.download = img.name;
//     a.click();
//   };

//   const downloadAll = () => {
//     images.forEach(downloadImage);
//   };

//   const uploadSingleToDrive = async (img, index) => {
//     const result = await uploadImageToDrive(img, index + 1);
//     if (result.success) {
//       setUploadedFiles(prev => [...prev, result]);
//       alert(`Page ${index + 1} uploaded to Drive`);
//     } else {
//       alert(`Failed to upload page ${index + 1}`);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-slate-100">
//       <div className="max-w-7xl mx-auto px-6 py-8">
//         {/* Header */}
//         <div className="text-center mb-10">
//           <div className="inline-flex items-center gap-2 bg-purple-50 px-4 py-2 rounded-full mb-4">
//             <Zap size={16} className="text-purple-600" />
//             <span className="text-sm font-medium text-purple-600">PDF to Image Converter</span>
//           </div>
//           <h1 className="text-4xl font-bold text-slate-800 mb-3">
//             PDF → <span className="bg-linear-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Image</span>
//           </h1>
//           <p className="text-slate-500">Convert PDF pages to high-quality images instantly</p>
//         </div>

//         <div className="grid lg:grid-cols-2 gap-8">
//           {/* Upload Section */}
//           <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6">
//             <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center hover:border-purple-400 transition-colors">
//               <input
//                 type="file"
//                 accept="application/pdf"
//                 onChange={handleFileSelect}
//                 className="hidden"
//                 id="pdf-upload"
//               />
//               <label htmlFor="pdf-upload" className="cursor-pointer block">
//                 <Upload className="mx-auto h-12 w-12 text-slate-400 mb-3" />
//                 <p className="text-purple-600 font-semibold">Upload PDF</p>
//                 <p className="text-xs text-slate-400 mt-1">PDF files only, up to 20MB</p>
//               </label>
//             </div>

//             {file && (
//               <div className="mt-4 p-3 bg-slate-50 rounded-lg flex items-center gap-3">
//                 <FileText size={20} className="text-purple-500" />
//                 <span className="text-sm text-slate-600 truncate flex-1">{file.name}</span>
//                 <span className="text-xs text-slate-400">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
//               </div>
//             )}

//             {/* Google Drive Upload Option */}
//             <div className="mt-4 flex items-center gap-2 p-3 bg-slate-50 rounded-lg">
//               <input
//                 type="checkbox"
//                 checked={uploadToDrive}
//                 onChange={(e) => setUploadToDrive(e.target.checked)}
//                 id="upload-drive-pdf2img"
//                 className="rounded border-slate-300 text-purple-600 focus:ring-purple-500"
//               />
//               <label htmlFor="upload-drive-pdf2img" className="text-sm text-slate-600 flex items-center gap-2 cursor-pointer">
//                 <CloudUpload size={14} />
//                 Auto-upload all images to Google Drive
//               </label>
//             </div>

//             {uploadedFiles.length > 0 && (
//               <div className="mt-3 p-3 bg-green-50 rounded-lg">
//                 <p className="text-sm text-green-700 flex items-center gap-2">
//                   <CheckCircle size={14} />
//                   {uploadedFiles.length} images uploaded to Drive
//                 </p>
//               </div>
//             )}

//             <button
//               onClick={handleConvert}
//               disabled={!file || loading}
//               className="w-full mt-6 bg-linear-to-r from-purple-600 to-pink-600 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 hover:shadow-lg transition-all disabled:opacity-50"
//             >
//               {loading ? (
//                 <>
//                   <Loader2 size={18} className="animate-spin" />
//                   Converting...
//                 </>
//               ) : (
//                 <>
//                   <Layers size={18} />
//                   Convert to Images
//                 </>
//               )}
//             </button>
//           </div>

//           {/* Info Section */}
//           <div className="bg-linear-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-100">
//             <h3 className="font-semibold text-slate-800 mb-2">Why convert PDF to Images?</h3>
//             <ul className="space-y-2 text-sm text-slate-600">
//               <li className="flex items-center gap-2">✓ Extract individual pages as images</li>
//               <li className="flex items-center gap-2">✓ Share specific pages easily</li>
//               <li className="flex items-center gap-2">✓ Use in presentations and social media</li>
//               <li className="flex items-center gap-2">✓ High-quality output with original resolution</li>
//               <li className="flex items-center gap-2 text-purple-600">✓ Auto-upload to Google Drive for backup</li>
//             </ul>
//           </div>
//         </div>

//         {/* Results Section */}
//         {images.length > 0 && (
//           <div className="mt-10 bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
//             <div className="px-6 py-4 border-b border-slate-100 flex flex-wrap justify-between items-center gap-3">
//               <h2 className="font-bold text-slate-800 flex items-center gap-2">
//                 <ImageIcon size={18} className="text-purple-500" />
//                 Generated Images ({images.length} pages)
//               </h2>
//               <div className="flex gap-2">
//                 <button
//                   onClick={downloadAll}
//                   className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-600 rounded-lg text-sm hover:bg-green-100 transition"
//                 >
//                   <Download size={14} /> Download All
//                 </button>
//                 {uploadToDrive && (
//                   <button
//                     onClick={() => images.forEach((img, i) => uploadSingleToDrive(img, i))}
//                     className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg text-sm hover:bg-indigo-100 transition"
//                   >
//                     <CloudUpload size={14} /> Upload Missing
//                   </button>
//                 )}
//               </div>
//             </div>

//             <div className="p-6">
//               <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
//                 {images.map((img, i) => (
//                   <div key={i} className="group relative">
//                     <img
//                       src={img.download}
//                       alt={`Page ${i + 1}`}
//                       className="w-full h-40 object-cover rounded-lg shadow-sm cursor-pointer hover:shadow-md transition"
//                       onClick={() => setPreviewImg(img.download)}
//                     />
//                     <div className="absolute top-2 left-2 bg-black/60 text-white text-xs px-2 py-0.5 rounded-full">
//                       Page {i + 1}
//                     </div>
//                     <div className="absolute bottom-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition">
//                       <button
//                         onClick={() => downloadImage(img)}
//                         className="p-1.5 bg-white rounded-lg shadow-sm hover:bg-gray-50"
//                       >
//                         <Download size={12} className="text-slate-600" />
//                       </button>
//                       {uploadToDrive && (
//                         <button
//                           onClick={() => uploadSingleToDrive(img, i)}
//                           className="p-1.5 bg-white rounded-lg shadow-sm hover:bg-gray-50"
//                         >
//                           <CloudUpload size={12} className="text-indigo-600" />
//                         </button>
//                       )}
//                     </div>
//                     {uploadedFiles.find(f => f.page === i + 1) && (
//                       <div className="absolute top-2 right-2">
//                         <CheckCircle size={14} className="text-green-500 bg-white rounded-full" />
//                       </div>
//                     )}
//                   </div>
//                 ))}
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Preview Modal */}
//         {previewImg && (
//           <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50" onClick={() => setPreviewImg(null)}>
//             <div className="relative max-w-[90vw] max-h-[90vh]">
//               <img src={previewImg} alt="Preview" className="max-w-full max-h-[90vh] object-contain rounded-lg" />
//               <button
//                 onClick={() => setPreviewImg(null)}
//                 className="absolute top-4 right-4 p-2 bg-black/50 rounded-full hover:bg-black/70 transition"
//               >
//                 <X size={20} className="text-white" />
//               </button>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }