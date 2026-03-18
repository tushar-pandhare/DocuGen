import axios from "axios";
import { useEffect, useState } from "react";
import {
  FileText,
  Image,
  LogOut,
  LayoutDashboard,
  Sparkles,
  Folder,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  /* ================= FETCH USER ================= */
  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchUser = async () => {
      try {
        const res = await axios.get(
          "http://localhost:5000/api/auth/me",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setUser(res.data);
      } catch (err) {
        localStorage.removeItem("token");
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [token, navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };


const handleGoogleConnect = async () => {
  try {
    const res = await axios.get(
      "http://localhost:5000/api/auth/google",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    // Now redirect to Google OAuth URL
    window.location.href = res.data.url;

  } catch (err) {
    console.error(err.response?.data);
    alert("Google connection failed");
  }
};


  if (loading) return <div className="p-10">Loading...</div>;

  const firstLetter = user?.name?.charAt(0).toUpperCase() || "U";
  const isGoogleConnected =
    user?.googleTokens && Object.keys(user.googleTokens).length > 0;

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* SIDEBAR */}
      <div className="w-64 bg-white shadow-xl flex flex-col justify-between p-6">
        <div>
          <h1 className="text-2xl font-bold text-indigo-600 mb-10">
            DocuGen
          </h1>

          <div className="space-y-4">
            <button className="flex items-center gap-3 w-full px-4 py-3 rounded-xl bg-indigo-100 text-indigo-600 font-semibold">
              <LayoutDashboard size={20} />
              Dashboard
            </button>

            <button
              onClick={() => navigate("/invoice-generate")}
              className="flex items-center gap-3 w-full px-4 py-3 rounded-xl hover:bg-gray-100 text-gray-600"
            >
              <FileText size={20} />
              Invoice Generator
            </button>

            <button
              onClick={() => navigate("/pdf-generate")}
              className="flex items-center gap-3 w-full px-4 py-3 rounded-xl hover:bg-gray-100 text-gray-600"
            >
              <Image size={20} />
              Image to PDF
            </button>
          </div>

          {/* GOOGLE DRIVE */}
          <div className="mt-8 space-y-3">
            <button
              onClick={handleGoogleConnect}
              disabled={isGoogleConnected}
              className={`w-full px-4 py-2 rounded-xl transition ${
                isGoogleConnected
                  ? "bg-green-100 text-green-600 cursor-not-allowed"
                  : "bg-indigo-600 text-white hover:bg-indigo-700"
              }`}
            >
              {isGoogleConnected
                ? "Google Drive Connected ✅"
                : "Connect Google Drive"}
            </button>

            {isGoogleConnected && (
              <button
                onClick={() => navigate("/drive-files")}
                className="flex items-center justify-center gap-2 w-full bg-white border px-4 py-2 rounded-xl hover:bg-gray-50"
              >
                <Folder size={18} />
                View Drive Files
              </button>
            )}
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-red-500 hover:bg-red-50 px-4 py-2 rounded-xl"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>

      {/* MAIN */}
      <div className="flex-1 p-10">
        <div className="flex justify-between items-center mb-10">
          <h2 className="text-3xl font-bold text-gray-800">
            Dashboard Overview
          </h2>

          <div className="flex items-center gap-4 bg-white px-4 py-2 rounded-xl shadow">
            <div className="w-10 h-10 bg-indigo-600 text-white rounded-full flex items-center justify-center font-semibold">
              {firstLetter}
            </div>
            <div>
              <p className="text-sm font-semibold">{user?.name}</p>
              <p className="text-xs text-gray-500">{user?.email}</p>
            </div>
          </div>
        </div>

        <div className="bg-linear-to-r from-indigo-600 to-purple-600 text-white p-10 rounded-3xl shadow-xl">
          <h3 className="text-4xl font-bold mb-4">
            Welcome back, {user?.name} 👋
          </h3>
          <p>Manage your documents with Google Drive sync.</p>
        </div>

        <div className="mt-16 text-gray-400 text-sm flex items-center gap-2">
          <Sparkles size={16} />
          Clean Auth Architecture • Production Ready
        </div>
      </div>
    </div>
  );
}