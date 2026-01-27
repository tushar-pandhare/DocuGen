import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Home, FileText } from "lucide-react";

export default function ImageGenerator() {
  const [image, setImage] = useState(null);
  const [file, setFile] = useState(null);
  const dropRef = useRef(null);
  const navigate = useNavigate();

  const handleFile = file => {
    if (!file || !file.type.startsWith("image")) return;
    setFile(file);

    const reader = new FileReader();
    reader.onload = e => setImage(e.target.result);
    reader.readAsDataURL(file);
  };

  const handleInput = e => handleFile(e.target.files[0]);

  const handleDrop = e => {
    e.preventDefault();
    handleFile(e.dataTransfer.files[0]);
  };

  const handlePaste = e => {
    for (const item of e.clipboardData.items) {
      if (item.type.startsWith("image")) {
        handleFile(item.getAsFile());
      }
    }
  };

  useEffect(() => {
    const div = dropRef.current;
    div.addEventListener("paste", handlePaste);
    return () => div.removeEventListener("paste", handlePaste);
  }, []);

  const handleSubmit = async () => {
    if (!file) return alert("Select an image first");

    const formData = new FormData();
    formData.append("image", file);

    const res = await fetch("http://localhost:5000/api/pdf/img", {
      method: "POST",
      body: formData,
    });

    const type = res.headers.get("content-type");

    if (!type || !type.includes("application/pdf")) {
      const text = await res.text();
      console.error(text);
      alert("Server error — check backend console");
      return;
    }

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    window.open(url);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-10">

      {/* Top Navigation */}
      <div className="max-w-5xl mx-auto mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">
          Image to PDF
        </h1>

        <div className="flex gap-3">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white border hover:bg-gray-50 transition"
          >
            <Home size={16} />
            Home
          </button>

          <button
            onClick={() => navigate("/invoice-generate")}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-black text-white hover:bg-gray-900 transition"
          >
            <FileText size={16} />
            Invoice Generator
          </button>
        </div>
      </div>

      {/* Main Card */}
      <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-xl p-10 flex flex-col items-center gap-6">

        <div
          ref={dropRef}
          onDrop={handleDrop}
          onDragOver={e => e.preventDefault()}
          tabIndex={0}
          className="w-full max-w-xl h-80 border-2 border-dashed border-gray-400 rounded-xl flex items-center justify-center cursor-pointer"
        >
          {image ? (
            <img src={image} className="max-h-full max-w-full rounded-lg" />
          ) : (
            <label className="text-gray-500 text-center cursor-pointer">
              Click, Paste, or Drag Image Here
              <input type="file" accept="image/*" hidden onChange={handleInput} />
            </label>
          )}
        </div>

        <button
          onClick={handleSubmit}
          className="bg-black text-white px-8 py-3 rounded-xl hover:bg-gray-900 transition font-medium"
        >
          Convert Image to PDF
        </button>

      </div>
    </div>
  );
}
