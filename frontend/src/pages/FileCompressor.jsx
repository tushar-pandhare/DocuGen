import { useState } from "react";
import axios from "axios";
import {
  UploadCloud,
  FileText,
  ImageIcon,
  Zap,
  CheckCircle,
  Loader2,
} from "lucide-react";

export default function FileCompressor() {
  const [files, setFiles] = useState([]);
  const [progress, setProgress] = useState(0);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploadToDrive, setUploadToDrive] = useState(false);

  const handleSelect = (e) => {
    const selected = Array.from(e.target.files);
    setFiles(selected);

    if (selected[0]?.type.startsWith("image")) {
      setPreview(URL.createObjectURL(selected[0]));
    } else {
      setPreview(null);
    }
  };

  const formatSize = (bytes) => {
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const handleCompress = async () => {
    if (!files.length) return;

    setLoading(true);
    setProgress(0);

    const formData = new FormData();
    files.forEach((f) => formData.append("files", f));
    formData.append("quality", 60);
    formData.append("uploadToDrive", uploadToDrive);

    try {
      const res = await axios.post(
        "http://localhost:5000/api/compress",
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
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
        alert("Uploaded to Google Drive 🚀");
      }

    } catch (err) {
      alert("Compression failed");
    } finally {
      setLoading(false);
      setProgress(0);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-100 via-white to-slate-200 flex items-center justify-center px-4 py-10">
      
      <div className="w-full max-w-5xl bg-white border border-slate-200 rounded-3xl shadow-xl p-8">
        
        {/* HEADER */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-slate-800">
            🚀 Smart File Compressor
          </h1>
          <p className="text-slate-500 mt-2">
            Compress images & PDFs or upload directly to Google Drive
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">

          {/* LEFT */}
          <div>
            <div className="border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-2xl p-8 text-center transition-all relative group bg-slate-50">
              
              <input
                type="file"
                multiple
                onChange={handleSelect}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />

              <UploadCloud className="mx-auto h-12 w-12 text-slate-400 group-hover:text-emerald-500 transition" />
              <p className="text-emerald-600 font-semibold mt-3">
                Click or Drag files here
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Images, PDFs supported
              </p>
            </div>

            {/* GOOGLE DRIVE */}
            <div className="mt-5 flex items-center gap-2 text-slate-600">
              <input
                type="checkbox"
                checked={uploadToDrive}
                onChange={(e) => setUploadToDrive(e.target.checked)}
              />
              Upload to Google Drive
            </div>

            {/* BUTTON */}
            <button
              onClick={handleCompress}
              disabled={loading || !files.length}
              className="mt-6 w-full bg-linear-to-r from-emerald-500 to-green-600 hover:scale-105 transition-transform text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 shadow-md disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  Processing...
                </>
              ) : (
                <>
                  <Zap size={18} />
                  Compress Files
                </>
              )}
            </button>

            {/* PROGRESS */}
            {progress > 0 && (
              <div className="mt-4">
                <div className="text-xs text-slate-600 mb-1">{progress}%</div>
                <div className="w-full bg-slate-200 h-2 rounded-full">
                  <div
                    className="bg-emerald-500 h-2 rounded-full transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* RIGHT */}
          <div className="space-y-4">
            {files.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-400 border border-slate-200 rounded-xl p-6 bg-slate-50">
                No files selected
              </div>
            ) : (
              files.map((f, i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 bg-white border border-slate-200 p-4 rounded-xl shadow-sm hover:shadow-md transition"
                >
                  <div className="p-3 bg-slate-100 rounded-lg">
                    {f.type.startsWith("image") ? (
                      <ImageIcon className="text-emerald-500" />
                    ) : (
                      <FileText className="text-blue-500" />
                    )}
                  </div>

                  <div className="flex-1">
                    <p className="text-slate-800 text-sm font-semibold truncate">
                      {f.name}
                    </p>
                    <p className="text-slate-500 text-xs">
                      {formatSize(f.size)}
                    </p>
                  </div>

                  <CheckCircle className="text-emerald-500" size={18} />
                </div>
              ))
            )}

            {/* PREVIEW */}
            {preview && (
              <img
                src={preview}
                alt="preview"
                className="mt-4 rounded-xl shadow"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// import { useState } from "react";
// import axios from "axios";
// import { Upload, FileText, Zap, Archive, CheckCircle } from "lucide-react";

// export default function FileCompressor() {
//   const [files, setFiles] = useState([]);
//   const [progress, setProgress] = useState(0);
//   const [preview, setPreview] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [uploadToDrive, setUploadToDrive] = useState(false);

//   const handleSelect = (e) => {
//     const selected = Array.from(e.target.files);
//     setFiles(selected);
//     setProgress(0);

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

//       const results = res.data.files;

//       // Download files
//       results.forEach((file) => {
//         if (file.download) {
//           const link = document.createElement("a");
//           link.href = file.download;
//           link.download = file.name;
//           link.click();
//         }
//       });

//       if (uploadToDrive) {
//         alert("Uploaded to Google Drive successfully!");
//       }

//     } catch (err) {
//       console.error(err);
//       alert("Compression failed");
//     } finally {
//       setLoading(false);
//       setProgress(0);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-slate-50 py-10 px-4">
//       <div className="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow">
//         <h1 className="text-3xl font-bold mb-6 text-center">
//           File Compressor 🚀
//         </h1>

//         {/* Upload */}
//         <input type="file" multiple onChange={handleSelect} />

//         {/* Preview */}
//         {preview && (
//           <img src={preview} alt="preview" className="w-40 mt-4" />
//         )}

//         {/* Progress */}
//         {progress > 0 && (
//           <div className="mt-4">
//             <div>{progress}%</div>
//             <div className="w-full bg-gray-200 h-2">
//               <div
//                 className="bg-green-500 h-2"
//                 style={{ width: `${progress}%` }}
//               />
//             </div>
//           </div>
//         )}

//         {/* Google Drive Option */}
//         <div className="mt-4">
//           <input
//             type="checkbox"
//             checked={uploadToDrive}
//             onChange={(e) => setUploadToDrive(e.target.checked)}
//           />
//           <span className="ml-2">Upload to Google Drive</span>
//         </div>

//         {/* Button */}
//         <button
//           onClick={handleCompress}
//           disabled={loading}
//           className="mt-6 bg-green-600 text-white px-6 py-2 rounded"
//         >
//           {loading ? "Processing..." : "Compress Files"}
//         </button>

//         {/* File List */}
//         <div className="mt-6">
//           {files.map((f, i) => (
//             <div key={i} className="text-sm">
//               {f.name} ({formatSize(f.size)})
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// }