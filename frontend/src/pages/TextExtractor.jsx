// import { useState } from "react";
// import { useNavigate } from "react-router-dom";

// export default function TextExtractor() {
//   const [file, setFile] = useState(null);
//   const [text, setText] = useState("");
//   const [loading, setLoading] = useState(false);

//   const navigate = useNavigate();

//   const handleFile = (e) => {
//     setFile(e.target.files[0]);
//   };

//   const handleExtract = async () => {
//     if (!file) return alert("Upload file first");

//     const token = localStorage.getItem("token");
//     if (!token) {
//       navigate("/login");
//       return;
//     }

//     const formData = new FormData();
//     formData.append("file", file);

//     try {
//       setLoading(true);

//       const res = await fetch("http://localhost:5000/api/ocr/extract-text", {
//         method: "POST",
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//         body: formData,
//       });

//       const data = await res.json();

//       if (!res.ok) {
//         alert(data.message);
//         return;
//       }

//       setText(data.text);
//     } catch (err) {
//       console.error(err);
//       alert("Error extracting text");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const copyText = () => {
//     navigator.clipboard.writeText(text);
//     alert("Copied!");
//   };

//   return (
//     <div className="p-10 min-h-screen bg-gray-100">
//       <div className="max-w-3xl mx-auto bg-white p-6 rounded-xl shadow">
//         <h1 className="text-xl font-bold mb-4">Text Extractor (OCR)</h1>

//         <input type="file" onChange={handleFile} />

//         <button
//           onClick={handleExtract}
//           className="mt-4 px-4 py-2 bg-black text-white rounded"
//         >
//           {loading ? "Extracting..." : "Extract Text"}
//         </button>

//         {text && (
//           <>
//             <textarea
//               value={text}
//               readOnly
//               className="w-full mt-4 p-3 border rounded h-60"
//             />

//             <button
//               onClick={copyText}
//               className="mt-2 px-4 py-2 bg-green-600 text-white rounded"
//             >
//               Copy Text
//             </button>
//           </>
//         )}
//       </div>
//     </div>
//   );
// }
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function TextExtractor() {
  const [file, setFile] = useState(null);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleFile = (e) => {
    setFile(e.target.files[0]);
  };

  const handleExtract = async () => {
    if (!file) return alert("Please upload a file first");

    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      setLoading(true);

      const res = await fetch("http://localhost:5000/api/ocr/extract-text", {
        // Change to your production URL if needed
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Extraction failed");
        return;
      }

      setText(data.text);
    } catch (err) {
      console.error(err);
      alert("Error connecting to server");
    } finally {
      setLoading(false);
    }
  };

  const copyText = () => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 font-sans antialiased text-slate-900">
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
            Text <span className="text-indigo-600">Extractor</span>
          </h1>
          <p className="mt-3 text-lg text-slate-600">
            Upload images or PDFs to extract text instantly using AI-powered OCR.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {/* Left Column: Upload Section */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 text-sm">1</span>
              Upload Document
            </h2>
            
            <div className="relative group">
              <input
                type="file"
                onChange={handleFile}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <div className={`mt-1 flex justify-center px-6 pt-10 pb-10 border-2 border-dashed rounded-xl transition-all ${file ? 'border-indigo-400 bg-indigo-50' : 'border-slate-300 group-hover:border-indigo-400 bg-slate-50'}`}>
                <div className="space-y-2 text-center">
                  <svg className="mx-auto h-12 w-12 text-slate-400 group-hover:text-indigo-500 transition-colors" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <div className="flex text-sm text-slate-600">
                    <span className="relative font-medium text-indigo-600 group-hover:text-indigo-500">
                      {file ? "File selected!" : "Upload a file"}
                    </span>
                    {!file && <p className="pl-1">or drag and drop</p>}
                  </div>
                  <p className="text-xs text-slate-500">
                    {file ? file.name : "PNG, JPG, PDF up to 10MB"}
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={handleExtract}
              disabled={loading}
              className={`w-full mt-6 flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white transition-all
                ${loading ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98]'}`}
            >
              {loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </span>
              ) : "Extract Text"}
            </button>
          </div>

          {/* Right Column: Results Section */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 flex flex-col">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-green-600 text-sm">2</span>
              Extracted Results
            </h2>

            {!text && !loading && (
              <div className="flex-1 flex flex-col items-center justify-center border-2 border-slate-100 rounded-xl bg-slate-50 p-6 text-center">
                <p className="text-slate-400 italic">No text extracted yet. Upload a file and click extract to see the magic.</p>
              </div>
            )}

            {loading && (
              <div className="flex-1 space-y-4 animate-pulse">
                <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                <div className="h-4 bg-slate-200 rounded"></div>
                <div className="h-4 bg-slate-200 rounded w-5/6"></div>
                <div className="h-4 bg-slate-200 rounded w-2/3"></div>
              </div>
            )}

            {text && !loading && (
              <div className="flex-1 flex flex-col">
                <textarea
                  value={text}
                  readOnly
                  className="flex-1 w-full p-4 border border-slate-200 rounded-xl bg-slate-50 text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none text-sm leading-relaxed"
                  placeholder="The extracted text will appear here..."
                />
                <button
                  onClick={copyText}
                  className="mt-4 inline-flex items-center justify-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors font-medium text-sm"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                  </svg>
                  Copy to Clipboard
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}