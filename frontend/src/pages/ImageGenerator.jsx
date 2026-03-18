import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Home, FileText } from "lucide-react";

export default function ImageGenerator() {
  const [images, setImages] = useState([]);      // ✅ multiple previews
  const [files, setFiles] = useState([]);        // ✅ multiple files
  const dropRef = useRef(null);
  const navigate = useNavigate();

  /* ================= HANDLE FILES ================= */
  const handleFiles = (selectedFiles) => {
    const imageFiles = Array.from(selectedFiles).filter(file =>
      file.type.startsWith("image")
    );

    if (!imageFiles.length) return;

    setFiles(prev => [...prev, ...imageFiles]);

    imageFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = e =>
        setImages(prev => [...prev, e.target.result]);
      reader.readAsDataURL(file);
    });
  };

  const handleInput = e => handleFiles(e.target.files);

  const handleDrop = e => {
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
  };

  const handlePaste = e => {
    const items = Array.from(e.clipboardData.items)
      .filter(item => item.type.startsWith("image"))
      .map(item => item.getAsFile());

    handleFiles(items);
  };

  useEffect(() => {
    const div = dropRef.current;
    div.addEventListener("paste", handlePaste);
    return () => div.removeEventListener("paste", handlePaste);
  }, []);

  /* ================= SUBMIT ================= */
  const handleSubmit = async () => {
    if (!files.length) return alert("Select at least one image");

    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    const formData = new FormData();

    files.forEach(file => {
      formData.append("images", file);  // ✅ multiple images
    });

    try {
      const res = await fetch("http://localhost:5000/api/pdf/img", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Upload failed");
        return;
      }

      /* ===== DOWNLOAD PDF ===== */
      const byteCharacters = atob(data.pdfBase64);
      const byteNumbers = new Array(byteCharacters.length)
        .fill()
        .map((_, i) => byteCharacters.charCodeAt(i));

      const blob = new Blob([new Uint8Array(byteNumbers)], {
        type: "application/pdf",
      });

      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = data.fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();

      /* ===== OPEN DRIVE ===== */
      if (data.file?.id) {
        window.open(
          `https://drive.google.com/file/d/${data.file.id}/view`,
          "_blank"
        );
      }

    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-10">

      {/* TOP NAV */}
      <div className="max-w-5xl mx-auto mb-6 flex justify-between">
        <h1 className="text-2xl font-bold">Image to PDF</h1>

        <div className="flex gap-3">
          <button
            onClick={() => navigate("/")}
            className="px-4 py-2 bg-white border rounded-lg"
          >
            <Home size={16} />
          </button>

          <button
            onClick={() => navigate("/invoice-generate")}
            className="px-4 py-2 bg-black text-white rounded-lg"
          >
            <FileText size={16} />
          </button>
        </div>
      </div>

      {/* MAIN CARD */}
      <div className="max-w-5xl mx-auto bg-white p-10 rounded-2xl shadow-xl">

        <div
          ref={dropRef}
          onDrop={handleDrop}
          onDragOver={e => e.preventDefault()}
          className="border-2 border-dashed rounded-xl p-10 text-center cursor-pointer"
        >
          <label className="cursor-pointer text-gray-500">
            Click, Paste, or Drag Multiple Images
            <input
              type="file"
              accept="image/*"
              multiple     // ✅ IMPORTANT
              hidden
              onChange={handleInput}
            />
          </label>
        </div>

        {/* PREVIEW GRID */}
        {images.length > 0 && (
          <div className="grid grid-cols-3 gap-4 mt-6">
            {images.map((img, index) => (
              <img
                key={index}
                src={img}
                alt="preview"
                className="rounded-lg shadow"
              />
            ))}
          </div>
        )}

        <button
          onClick={handleSubmit}
          className="mt-8 bg-black text-white px-8 py-3 rounded-xl"
        >
          Convert {files.length > 1 ? "Images" : "Image"} to PDF
        </button>

      </div>
    </div>
  );
}