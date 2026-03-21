import { useState } from "react";
import axios from "axios";
import {
  UploadCloud,
  FileText,
  Loader2,
  Download,
  ImageIcon,
  Eye,
  CloudUpload,
} from "lucide-react";

export default function PdfToImage() {
  const [file, setFile] = useState(null);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [previewImg, setPreviewImg] = useState(null);

  /* ================= FILE SELECT ================= */
  const handleSelect = (e) => {
    const selectedFile = e.target.files[0];

    setFile(selectedFile);

    // ✅ CLEAR OLD DATA
    setImages([]);
    setPreviewImg(null);
  };

  /* ================= CONVERT ================= */
  const handleConvert = async () => {
    if (!file) return alert("Upload a PDF first");

    const formData = new FormData();
    formData.append("file", file);

    try {
      setLoading(true);

      // ✅ CLEAR OLD IMAGES BEFORE NEW REQUEST
      setImages([]);

      const res = await axios.post(
        "http://localhost:5000/api/pdf-to-image",
        formData
      );

      setImages(res.data.images);
    } catch (err) {
      console.error(err);
      alert("Conversion failed");
    } finally {
      setLoading(false);
    }
  };

  /* ================= DOWNLOAD SINGLE ================= */
  const downloadImage = (img) => {
    const a = document.createElement("a");
    a.href = img.download;
    a.download = img.name;
    a.click();
  };

  /* ================= UPLOAD SINGLE ================= */
  const uploadSingleToDrive = async (img) => {
    try {
      const blob = await fetch(img.download).then((res) => res.blob());

      const formData = new FormData();
      formData.append("file", blob, img.name);

      await axios.post(
        "http://localhost:5000/api/drive/upload",
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      alert(`${img.name} uploaded to Drive 🚀`);
    } catch (err) {
      console.error(err);
      alert("Upload failed");
    }
  };

  /* ================= UPLOAD ALL ================= */
  const uploadAllToDrive = async () => {
    try {
      for (let img of images) {
        await uploadSingleToDrive(img);
      }
      alert("All images uploaded 🚀");
    } catch {
      alert("Bulk upload failed");
    }
  };

  /* ================= DOWNLOAD ALL ================= */
  const downloadAll = () => {
    images.forEach(downloadImage);
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-indigo-100 py-10 px-4">
      <div className="max-w-6xl mx-auto">

        {/* HEADER */}
        <div className="text-center mb-10">
          <h1 className="text-5xl font-extrabold text-slate-800">
            PDF → Image Converter 🖼️
          </h1>
          <p className="text-slate-500 mt-2 text-lg">
            Convert & manage images like a pro
          </p>
        </div>

        {/* UPLOAD SECTION */}
        <div className="bg-white p-8 rounded-2xl shadow-lg border mb-8">
          <div className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-xl p-8 text-center relative cursor-pointer bg-slate-50">
            <input
              type="file"
              accept="application/pdf"
              onChange={handleSelect}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
            <UploadCloud className="mx-auto h-12 w-12 text-slate-400" />
            <p className="text-blue-600 font-semibold mt-3">Upload PDF</p>
          </div>

          {file && (
            <div className="mt-4 flex items-center gap-3 bg-slate-100 p-3 rounded-lg">
              <FileText className="text-blue-500" />
              {file.name}
            </div>
          )}

          <button
            onClick={handleConvert}
            disabled={!file || loading}
            className="mt-6 w-full bg-blue-600 text-white py-3 rounded-xl font-semibold flex justify-center gap-2 hover:bg-blue-700 transition"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" />
                Converting...
              </>
            ) : (
              <>
                <ImageIcon />
                Convert
              </>
            )}
          </button>

          {/* LOADING MESSAGE */}
          {loading && (
            <p className="text-center text-slate-500 mt-4">
              Processing PDF... please wait ⏳
            </p>
          )}
        </div>

        {/* RESULTS */}
        {images.length > 0 && (
          <div className="bg-white p-6 rounded-2xl shadow-lg border">

            {/* ACTIONS */}
            <div className="flex flex-wrap gap-3 justify-between mb-6">
              <h2 className="text-xl font-bold">Generated Images</h2>

              <div className="flex gap-2">
                <button
                  onClick={downloadAll}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg flex gap-2 hover:bg-green-700"
                >
                  <Download size={16} /> Download All
                </button>

                <button
                  onClick={uploadAllToDrive}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex gap-2 hover:bg-indigo-700"
                >
                  <CloudUpload size={16} /> Upload All
                </button>
              </div>
            </div>

            {/* GRID */}
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
              {images.map((img, i) => (
                <div
                  key={i}
                  className="border rounded-xl overflow-hidden shadow hover:shadow-lg transition"
                >
                  <img
                    src={img.download}
                    alt=""
                    className="w-full h-48 object-cover cursor-pointer"
                    onClick={() => setPreviewImg(img.download)}
                  />

                  <div className="p-3 flex flex-wrap gap-2 justify-between">
                    
                    <button
                      onClick={() => setPreviewImg(img.download)}
                      className="text-blue-600 text-xs flex gap-1 hover:underline"
                    >
                      <Eye size={14} /> Open
                    </button>

                    <button
                      onClick={() => downloadImage(img)}
                      className="text-green-600 text-xs flex gap-1 hover:underline"
                    >
                      <Download size={14} /> Download
                    </button>

                    <button
                      onClick={() => uploadSingleToDrive(img)}
                      className="text-indigo-600 text-xs flex gap-1 hover:underline"
                    >
                      <CloudUpload size={14} /> Drive
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PREVIEW MODAL */}
        {previewImg && (
          <div
            onClick={() => setPreviewImg(null)}
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
          >
            <img
              src={previewImg}
              alt=""
              className="max-h-[90%] max-w-[90%] rounded-xl shadow-2xl"
            />
          </div>
        )}
      </div>
    </div>
  );
}