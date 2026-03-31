// import { useState } from "react";
// import axios from "axios";
// import {
//   UploadCloud,
//   FileText,
//   Loader2,
//   Download,
//   ImageIcon,
//   Eye,
//   CloudUpload,
// } from "lucide-react";

// export default function PdfToImage() {
//   const [file, setFile] = useState(null);
//   const [images, setImages] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [previewImg, setPreviewImg] = useState(null);

//   /* ================= FILE SELECT ================= */
//   const handleSelect = (e) => {
//     const selectedFile = e.target.files[0];

//     setFile(selectedFile);

//     // ✅ CLEAR OLD DATA
//     setImages([]);
//     setPreviewImg(null);
//   };

//   /* ================= CONVERT ================= */
//   const handleConvert = async () => {
//     if (!file) return alert("Upload a PDF first");

//     const formData = new FormData();
//     formData.append("file", file);

//     try {
//       setLoading(true);

//       // ✅ CLEAR OLD IMAGES BEFORE NEW REQUEST
//       setImages([]);

//       const res = await axios.post(
//         "http://localhost:5000/api/pdf-to-image",
//         formData
//       );

//       setImages(res.data.images);
//     } catch (err) {
//       console.error(err);
//       alert("Conversion failed");
//     } finally {
//       setLoading(false);
//     }
//   };

//   /* ================= DOWNLOAD SINGLE ================= */
//   const downloadImage = (img) => {
//     const a = document.createElement("a");
//     a.href = img.download;
//     a.download = img.name;
//     a.click();
//   };

//   /* ================= UPLOAD SINGLE ================= */
//   const uploadSingleToDrive = async (img) => {
//     try {
//       const blob = await fetch(img.download).then((res) => res.blob());

//       const formData = new FormData();
//       formData.append("file", blob, img.name);

//       await axios.post(
//         "http://localhost:5000/api/drive/upload",
//         formData,
//         {
//           headers: {
//             Authorization: `Bearer ${localStorage.getItem("token")}`,
//             "Content-Type": "multipart/form-data",
//           },
//         }
//       );

//       alert(`${img.name} uploaded to Drive 🚀`);
//     } catch (err) {
//       console.error(err);
//       alert("Upload failed");
//     }
//   };

//   /* ================= UPLOAD ALL ================= */
//   const uploadAllToDrive = async () => {
//     try {
//       for (let img of images) {
//         await uploadSingleToDrive(img);
//       }
//       alert("All images uploaded 🚀");
//     } catch {
//       alert("Bulk upload failed");
//     }
//   };

//   /* ================= DOWNLOAD ALL ================= */
//   const downloadAll = () => {
//     images.forEach(downloadImage);
//   };

//   return (
//     <div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-indigo-100 py-10 px-4">
//       <div className="max-w-6xl mx-auto">

//         {/* HEADER */}
//         <div className="text-center mb-10">
//           <h1 className="text-5xl font-extrabold text-slate-800">
//             PDF → Image Converter
//           </h1>
//           <p className="text-slate-500 mt-2 text-lg">
//             Convert & manage images like a pro
//           </p>
//         </div>

//         {/* UPLOAD SECTION */}
//         <div className="bg-white p-8 rounded-2xl shadow-lg border mb-8">
//           <div className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-xl p-8 text-center relative cursor-pointer bg-slate-50">
//             <input
//               type="file"
//               accept="application/pdf"
//               onChange={handleSelect}
//               className="absolute inset-0 opacity-0 cursor-pointer"
//             />
//             <UploadCloud className="mx-auto h-12 w-12 text-slate-400" />
//             <p className="text-blue-600 font-semibold mt-3">Upload PDF</p>
//           </div>

//           {file && (
//             <div className="mt-4 flex items-center gap-3 bg-slate-100 p-3 rounded-lg">
//               <FileText className="text-blue-500" />
//               {file.name}
//             </div>
//           )}

//           <button
//             onClick={handleConvert}
//             disabled={!file || loading}
//             className="mt-6 w-full bg-blue-600 text-white py-3 rounded-xl font-semibold flex justify-center gap-2 hover:bg-blue-700 transition"
//           >
//             {loading ? (
//               <>
//                 <Loader2 className="animate-spin" />
//                 Converting...
//               </>
//             ) : (
//               <>
//                 <ImageIcon />
//                 Convert
//               </>
//             )}
//           </button>

//           {/* LOADING MESSAGE */}
//           {loading && (
//             <p className="text-center text-slate-500 mt-4">
//               Processing PDF... please wait ⏳
//             </p>
//           )}
//         </div>

//         {/* RESULTS */}
//         {images.length > 0 && (
//           <div className="bg-white p-6 rounded-2xl shadow-lg border">

//             {/* ACTIONS */}
//             <div className="flex flex-wrap gap-3 justify-between mb-6">
//               <h2 className="text-xl font-bold">Generated Images</h2>

//               <div className="flex gap-2">
//                 <button
//                   onClick={downloadAll}
//                   className="bg-green-600 text-white px-4 py-2 rounded-lg flex gap-2 hover:bg-green-700"
//                 >
//                   <Download size={16} /> Download All
//                 </button>

//                 <button
//                   onClick={uploadAllToDrive}
//                   className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex gap-2 hover:bg-indigo-700"
//                 >
//                   <CloudUpload size={16} /> Upload All
//                 </button>
//               </div>
//             </div>

//             {/* GRID */}
//             <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
//               {images.map((img, i) => (
//                 <div
//                   key={i}
//                   className="border rounded-xl overflow-hidden shadow hover:shadow-lg transition"
//                 >
//                   <img
//                     src={img.download}
//                     alt=""
//                     className="w-full h-48 object-cover cursor-pointer"
//                     onClick={() => setPreviewImg(img.download)}
//                   />

//                   <div className="p-3 flex flex-wrap gap-2 justify-between">
                    
//                     <button
//                       onClick={() => setPreviewImg(img.download)}
//                       className="text-blue-600 text-xs flex gap-1 hover:underline"
//                     >
//                       <Eye size={14} /> Open
//                     </button>

//                     <button
//                       onClick={() => downloadImage(img)}
//                       className="text-green-600 text-xs flex gap-1 hover:underline"
//                     >
//                       <Download size={14} /> Download
//                     </button>

//                     <button
//                       onClick={() => uploadSingleToDrive(img)}
//                       className="text-indigo-600 text-xs flex gap-1 hover:underline"
//                     >
//                       <CloudUpload size={14} /> Drive
//                     </button>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>
//         )}

//         {/* PREVIEW MODAL */}
//         {previewImg && (
//           <div
//             onClick={() => setPreviewImg(null)}
//             className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
//           >
//             <img
//               src={previewImg}
//               alt=""
//               className="max-h-[90%] max-w-[90%] rounded-xl shadow-2xl"
//             />
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }
import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { 
  Upload, FileText, Loader2, Download, ImageIcon, 
  Eye, CloudUpload, ChevronLeft, ChevronRight, X,
  Layers, Zap, CheckCircle 
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

    try {
      setLoading(true);
      const res = await axios.post("http://localhost:5000/api/pdf-to-image", formData);
      setImages(res.data.images);
      
      // Upload to Drive if option is selected
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

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-slate-100">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-purple-50 px-4 py-2 rounded-full mb-4">
            <Zap size={16} className="text-purple-600" />
            <span className="text-sm font-medium text-purple-600">PDF to Image Converter</span>
          </div>
          <h1 className="text-4xl font-bold text-slate-800 mb-3">
            PDF → <span className="bg-linear-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Image</span>
          </h1>
          <p className="text-slate-500">Convert PDF pages to high-quality images instantly</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Upload Section */}
          <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6">
            <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center hover:border-purple-400 transition-colors">
              <input
                type="file"
                accept="application/pdf"
                onChange={handleFileSelect}
                className="hidden"
                id="pdf-upload"
              />
              <label htmlFor="pdf-upload" className="cursor-pointer block">
                <Upload className="mx-auto h-12 w-12 text-slate-400 mb-3" />
                <p className="text-purple-600 font-semibold">Upload PDF</p>
                <p className="text-xs text-slate-400 mt-1">PDF files only, up to 20MB</p>
              </label>
            </div>

            {file && (
              <div className="mt-4 p-3 bg-slate-50 rounded-lg flex items-center gap-3">
                <FileText size={20} className="text-purple-500" />
                <span className="text-sm text-slate-600 truncate flex-1">{file.name}</span>
                <span className="text-xs text-slate-400">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
              </div>
            )}

            {/* Google Drive Upload Option */}
            <div className="mt-4 flex items-center gap-2 p-3 bg-slate-50 rounded-lg">
              <input
                type="checkbox"
                checked={uploadToDrive}
                onChange={(e) => setUploadToDrive(e.target.checked)}
                id="upload-drive-pdf2img"
                className="rounded border-slate-300 text-purple-600 focus:ring-purple-500"
              />
              <label htmlFor="upload-drive-pdf2img" className="text-sm text-slate-600 flex items-center gap-2 cursor-pointer">
                <CloudUpload size={14} />
                Auto-upload all images to Google Drive
              </label>
            </div>

            {uploadedFiles.length > 0 && (
              <div className="mt-3 p-3 bg-green-50 rounded-lg">
                <p className="text-sm text-green-700 flex items-center gap-2">
                  <CheckCircle size={14} />
                  {uploadedFiles.length} images uploaded to Drive
                </p>
              </div>
            )}

            <button
              onClick={handleConvert}
              disabled={!file || loading}
              className="w-full mt-6 bg-linear-to-r from-purple-600 to-pink-600 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 hover:shadow-lg transition-all disabled:opacity-50"
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

          {/* Info Section */}
          <div className="bg-linear-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-100">
            <h3 className="font-semibold text-slate-800 mb-2">Why convert PDF to Images?</h3>
            <ul className="space-y-2 text-sm text-slate-600">
              <li className="flex items-center gap-2">✓ Extract individual pages as images</li>
              <li className="flex items-center gap-2">✓ Share specific pages easily</li>
              <li className="flex items-center gap-2">✓ Use in presentations and social media</li>
              <li className="flex items-center gap-2">✓ High-quality output with original resolution</li>
              <li className="flex items-center gap-2 text-purple-600">✓ Auto-upload to Google Drive for backup</li>
            </ul>
          </div>
        </div>

        {/* Results Section */}
        {images.length > 0 && (
          <div className="mt-10 bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex flex-wrap justify-between items-center gap-3">
              <h2 className="font-bold text-slate-800 flex items-center gap-2">
                <ImageIcon size={18} className="text-purple-500" />
                Generated Images ({images.length} pages)
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={downloadAll}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-600 rounded-lg text-sm hover:bg-green-100 transition"
                >
                  <Download size={14} /> Download All
                </button>
                {uploadToDrive && (
                  <button
                    onClick={() => images.forEach((img, i) => uploadSingleToDrive(img, i))}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg text-sm hover:bg-indigo-100 transition"
                  >
                    <CloudUpload size={14} /> Upload Missing
                  </button>
                )}
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {images.map((img, i) => (
                  <div key={i} className="group relative">
                    <img
                      src={img.download}
                      alt={`Page ${i + 1}`}
                      className="w-full h-40 object-cover rounded-lg shadow-sm cursor-pointer hover:shadow-md transition"
                      onClick={() => setPreviewImg(img.download)}
                    />
                    <div className="absolute top-2 left-2 bg-black/60 text-white text-xs px-2 py-0.5 rounded-full">
                      Page {i + 1}
                    </div>
                    <div className="absolute bottom-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition">
                      <button
                        onClick={() => downloadImage(img)}
                        className="p-1.5 bg-white rounded-lg shadow-sm hover:bg-gray-50"
                      >
                        <Download size={12} className="text-slate-600" />
                      </button>
                      {uploadToDrive && (
                        <button
                          onClick={() => uploadSingleToDrive(img, i)}
                          className="p-1.5 bg-white rounded-lg shadow-sm hover:bg-gray-50"
                        >
                          <CloudUpload size={12} className="text-indigo-600" />
                        </button>
                      )}
                    </div>
                    {uploadedFiles.find(f => f.page === i + 1) && (
                      <div className="absolute top-2 right-2">
                        <CheckCircle size={14} className="text-green-500 bg-white rounded-full" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Preview Modal */}
        {previewImg && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50" onClick={() => setPreviewImg(null)}>
            <div className="relative max-w-[90vw] max-h-[90vh]">
              <img src={previewImg} alt="Preview" className="max-w-full max-h-[90vh] object-contain rounded-lg" />
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