import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Home, Pencil, Check, X, FileText } from "lucide-react";

export default function DriveFiles() {
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [newName, setNewName] = useState("");

  /* ================= FETCH FILES ================= */
  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchFiles = async () => {
      try {
        const res = await axios.get(
          "http://localhost:5000/api/invoice/drive-files",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setFiles(res.data);
      } catch (err) {
        alert("Failed to load Drive files");
      } finally {
        setLoading(false);
      }
    };

    fetchFiles();
  }, [token, navigate]);

  /* ================= RENAME FILE ================= */
  const handleRename = async (fileId) => {
    if (!newName.trim()) {
      alert("File name cannot be empty");
      return;
    }

    try {
      await axios.put(
        `http://localhost:5000/api/invoice/rename-file/${fileId}`,
        { newName },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // update UI instantly
      setFiles((prev) =>
        prev.map((file) =>
          file.id === fileId ? { ...file, name: newName } : file
        )
      );

      setEditingId(null);
      setNewName("");
    } catch (err) {
      alert("Rename failed");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-10">
      {/* ================= HEADER ================= */}
      <div className="max-w-5xl mx-auto mb-8 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">
          Google Drive Files
        </h1>

        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 px-4 py-2 bg-white border rounded-lg hover:bg-gray-50 transition"
        >
          <Home size={16} />
          Home
        </button>
      </div>

      {/* ================= MAIN CARD ================= */}
      <div className="max-w-5xl mx-auto bg-white shadow-2xl rounded-2xl p-8">
        {loading ? (
          <p className="text-gray-500">Loading files...</p>
        ) : files.length === 0 ? (
          <div className="text-center text-gray-500">
            <FileText size={40} className="mx-auto mb-3 opacity-40" />
            <p>No files found in DocuGen folder.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {files.map((file) => (
              <div
                key={file.id}
                className="flex justify-between items-center border p-4 rounded-xl hover:bg-gray-50 transition"
              >
                {/* LEFT SIDE */}
                <div className="flex-1">
                  {editingId === file.id ? (
                    <input
                      type="text"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className="border px-3 py-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-black"
                    />
                  ) : (
                    <>
                      <p className="font-semibold text-gray-800">
                        {file.name}
                      </p>
                      <p className="text-xs text-gray-400">
                        {file.createdTime
                          ? new Date(file.createdTime).toLocaleString()
                          : ""}
                      </p>
                    </>
                  )}
                </div>

                {/* RIGHT SIDE ACTIONS */}
                <div className="flex gap-3 ml-6">
                  {editingId === file.id ? (
                    <>
                      <button
                        onClick={() => handleRename(file.id)}
                        className="flex items-center gap-1 bg-green-600 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-green-700 transition"
                      >
                        <Check size={14} />
                        Save
                      </button>

                      <button
                        onClick={() => {
                          setEditingId(null);
                          setNewName("");
                        }}
                        className="flex items-center gap-1 bg-gray-300 px-3 py-1.5 rounded-lg text-sm hover:bg-gray-400 transition"
                      >
                        <X size={14} />
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <a
                        href={file.webViewLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-black text-white px-3 py-1.5 rounded-lg text-sm hover:bg-gray-900 transition"
                      >
                        View
                      </a>

                      <button
                        onClick={() => {
                          setEditingId(file.id);
                          setNewName(file.name);
                        }}
                        className="flex items-center gap-1 bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-blue-700 transition"
                      >
                        <Pencil size={14} />
                        Rename
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* FOOTER */}
      <p className="text-center text-xs text-gray-400 mt-8">
        Google Drive Integration • MERN Stack • Secure JWT Auth
      </p>
    </div>
  );
}