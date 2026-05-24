import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate, Routes, Route } from "react-router-dom";
import {
  FileText,
  Image,
  LogOut,
  Sparkles,
  Search,
  Zap,
  Plus,
  User,
  ChevronRight,
  Cloud,
  ArrowUpRight,
  HardDrive,
  Grid,
  List,
  Layers,
  Award,
  Gift,
  Eye,
  Edit2,
  Trash2,
  File,
  FileArchive,
  FolderOpen,
  Clock,
  TrendingUp,
  Database,
  LayoutGrid,
  ListChecks,
  Star,
  Download,
  Share2,
  MoreVertical,
} from "lucide-react";

// Import your components
import DriveFiles from "./DriveFiles";

export default function Dashboard() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [user, setUser] = useState(null);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [recentTemplates, setRecentTemplates] = useState([]);
  const [viewMode, setViewMode] = useState("grid");
  const [hoveredTool, setHoveredTool] = useState(null);
  const [activeTab, setActiveTab] = useState("dashboard");

  const [stats, setStats] = useState({
    documents: 0,
    images: 0,
    templates: 0,
    driveFilesCount: 0,
    totalDriveSize: 0,
  });

  const colorMap = {
    blue: "from-blue-500 to-blue-600",
    purple: "from-purple-500 to-purple-600",
    emerald: "from-emerald-500 to-emerald-600",
    teal: "from-teal-500 to-teal-600",
    indigo: "from-indigo-500 to-indigo-600",
    rose: "from-rose-500 to-rose-600",
    cyan: "from-cyan-500 to-cyan-600",
  };

  const iconBgMap = {
    blue: "bg-blue-50",
    purple: "bg-purple-50",
    emerald: "bg-emerald-50",
    teal: "bg-teal-50",
    indigo: "bg-indigo-50",
    rose: "bg-rose-50",
    cyan: "bg-cyan-50",
  };

  const iconColorMap = {
    blue: "text-blue-600",
    purple: "text-purple-600",
    emerald: "text-emerald-600",
    teal: "text-teal-600",
    indigo: "text-indigo-600",
    rose: "text-rose-600",
    cyan: "text-cyan-600",
  };

  const tools = [
    {
      title: "Smart Invoice",
      desc: "Create professional invoices",
      icon: FileText,
      color: "blue",
      path: "/invoice-generate",
      badge: "Popular",
    },
    {
      title: "Image to PDF",
      desc: "Convert images to PDFs",
      icon: Image,
      color: "purple",
      path: "/pdf-generate",
    },
    {
      title: "PDF to Image",
      desc: "Extract images from PDF",
      icon: Image,
      color: "teal",
      path: "/pdf-to-image",
    },
    {
      title: "Text OCR",
      desc: "Extract text from documents",
      icon: Search,
      color: "emerald",
      path: "/text-extractor",
    },
    {
      title: "Compressor",
      desc: "Reduce file size",
      icon: Zap,
      color: "rose",
      path: "/compress",
    },
    {
      title: "Template Library",
      desc: "Create & manage templates",
      icon: Layers,
      color: "indigo",
      path: "/templates",
    },
  ];

  const getFileIcon = (mimeType) => {
    if (mimeType?.includes("pdf")) {
      return <FileText size={14} className="text-red-500" />;
    } else if (mimeType?.includes("image")) {
      return <Image size={14} className="text-purple-500" />;
    } else if (mimeType?.includes("zip")) {
      return <FileArchive size={14} className="text-amber-500" />;
    }
    return <File size={14} className="text-slate-500" />;
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return "0 Bytes";
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return (
      parseFloat((bytes / Math.pow(1024, i)).toFixed(2)) + " " + sizes[i]
    );
  };

  const fetchDriveFiles = async () => {
    const fileRes = await axios.get(
      "http://localhost:5000/api/drive/files",
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    const driveFiles = fileRes.data.files || [];
    setFiles(driveFiles);

    const totalSize = driveFiles.reduce(
      (sum, file) => sum + (file.size || 0),
      0
    );

    setStats((prev) => ({
      ...prev,
      documents: driveFiles.length,
      images: driveFiles.filter((f) =>
        f.mimeType?.includes("image")
      ).length,
      driveFilesCount: driveFiles.length,
      totalDriveSize: totalSize,
    }));
  };

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);

        // ✅ Handle URL params FIRST, inside the async function
        const params = new URLSearchParams(window.location.search);
        if (params.get("drive_error")) {
          window.history.replaceState({}, "", "/");
          alert("Google Drive connection failed or was denied.");
        }

        const userRes = await axios.get(
          "http://localhost:5000/api/auth/me",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setUser(userRes.data);

        // ✅ If drive just connected, clean URL and use fresh data
        if (params.get("drive_connected") === "true") {
          window.history.replaceState({}, "", "/");
        }

        const isConnected =
          userRes.data.googleTokens &&
          userRes.data.googleTokens.access_token &&
          Object.keys(userRes.data.googleTokens).length > 0;

        if (isConnected) {
          await fetchDriveFiles();
        }

        try {
          const templateStatsRes = await axios.get(
            "http://localhost:5000/api/templates/stats/overview",
            { headers: { Authorization: `Bearer ${token}` } }
          );
          setStats((prev) => ({
            ...prev,
            templates: templateStatsRes.data.totalTemplates || 0,
          }));
        } catch {}

        try {
          const templatesRes = await axios.get(
            "http://localhost:5000/api/templates",
            {
              headers: { Authorization: `Bearer ${token}` },
              params: { limit: 4 },
            }
          );
          setRecentTemplates(templatesRes.data.templates?.slice(0, 4) || []);
        } catch {}

      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token, navigate]);  

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const handleGoogleConnect = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/auth/google",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.data.url) {
        window.location.href = res.data.url;
      }
    } catch (err) {
      if (err.response?.status === 401) {
        alert("Session expired. Please login again.");
        localStorage.removeItem("token");
        navigate("/login");
      } else {
        alert("Google connection failed");
      }
    }
  };

  const renameFile = async (fileId, currentName) => {
    const newName = prompt("Enter new file name:", currentName);
    if (!newName || newName === currentName) return;

    await axios.put(
      `http://localhost:5000/api/drive/rename-file/${fileId}`,
      { newName },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    await fetchDriveFiles();
  };

  const deleteFile = async (fileId, fileName) => {
    if (!window.confirm(`Delete "${fileName}"?`)) return;

    await axios.delete(
      `http://localhost:5000/api/drive/delete-file/${fileId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    await fetchDriveFiles();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-indigo-600 border-b-4"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-8 w-8 rounded-full bg-indigo-100 animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  // const isGoogleConnected =
  //   user?.googleTokens &&
  //   Object.keys(user.googleTokens).length > 0;
  const isGoogleConnected =
  user?.googleTokens &&
  user.googleTokens.access_token && // must have actual token
  Object.keys(user.googleTokens).length > 0;

  // Protected component wrapper for drive-related routes
  const ProtectedDriveRoute = ({ children }) => {
    if (!isGoogleConnected) {
      return (
        <div className="text-center py-12">
          <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Cloud size={32} className="text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-800 mb-2">
            Google Drive Not Connected
          </h3>
          <p className="text-slate-500 mb-4">
            Please connect your Google Drive account to access this feature
          </p>
          <button
            onClick={handleGoogleConnect}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-2 rounded-lg font-medium hover:shadow-lg transition-all"
          >
            Connect Google Drive
          </button>
        </div>
      );
    }
    return children;
  };

  // Main Dashboard Content
  const DashboardContent = () => (
    <>
      {/* Stats Cards */}
      <div className="grid md:grid-cols-4 gap-5 mb-8">
        <StatCard
          title="Total Files"
          value={stats.driveFilesCount}
          subtitle={formatFileSize(stats.totalDriveSize)}
          icon={Database}
          gradient="from-blue-500 to-blue-600"
        />
        <StatCard
          title="Templates"
          value={stats.templates}
          icon={Layers}
          gradient="from-purple-500 to-purple-600"
        />
        <StatCard
          title="Images"
          value={stats.images}
          icon={Image}
          gradient="from-emerald-500 to-emerald-600"
        />
        <StatCard
          title="Documents"
          value={stats.documents}
          icon={FileText}
          gradient="from-teal-500 to-teal-600"
        />
      </div>

      {/* Google Drive Connection Banner - Only show if not connected */}
      {!isGoogleConnected && (
        <div className="relative overflow-hidden bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 rounded-2xl mb-8 shadow-xl">
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }}></div>
          <div className="relative p-6 flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl">
                <Cloud className="text-white" size={28} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">
                  Connect Google Drive
                </h3>
                <p className="text-indigo-100 text-sm mt-1">
                  Sync, manage, and access all your cloud files in one place
                </p>
              </div>
            </div>

            <button
              onClick={handleGoogleConnect}
              className="bg-white text-indigo-600 px-6 py-2.5 rounded-xl font-semibold hover:shadow-lg transition-all duration-200 hover:scale-105"
            >
              Connect Now
            </button>
          </div>
        </div>
      )}

      {/* Tools Grid */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Quick Tools</h2>
            <p className="text-sm text-slate-500">AI-powered document processing</p>
          </div>
          <div className="flex gap-2">
            <button className="text-sm text-indigo-600 font-medium hover:text-indigo-700 transition-colors">
              View all tools
            </button>
            <ChevronRight size={16} className="text-indigo-600" />
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {tools.map((tool, idx) => {
            const Icon = tool.icon;
            return (
              <div
                key={idx}
                onMouseEnter={() => setHoveredTool(idx)}
                onMouseLeave={() => setHoveredTool(null)}
                onClick={() => navigate(tool.path)}
                className="group relative bg-white rounded-xl p-5 border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-100 translate-x-[-100%] group-hover:translate-x-[100%] transition-all duration-1000"></div>
                
                <div className={`w-12 h-12 rounded-xl ${iconBgMap[tool.color]} flex items-center justify-center mb-3 transition-transform group-hover:scale-110`}>
                  <Icon size={22} className={iconColorMap[tool.color]} />
                </div>
                
                <h3 className="font-semibold text-slate-800 mb-1">
                  {tool.title}
                </h3>
                <p className="text-xs text-slate-400">
                  {tool.desc}
                </p>
                
                {tool.badge && (
                  <div className="absolute top-3 right-3">
                    <div className="bg-gradient-to-r from-amber-400 to-amber-500 text-white text-[10px] px-2 py-0.5 rounded-full font-medium">
                      {tool.badge}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Templates and Files Section */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Templates Panel */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-bold text-slate-800">Recent Templates</h2>
                <p className="text-xs text-slate-500 mt-1">Your recently used templates</p>
              </div>
              <button 
                onClick={() => navigate("/templates")}
                className="text-indigo-600 text-sm font-medium hover:text-indigo-700 transition-colors"
              >
                View all
              </button>
            </div>
          </div>
          <div className="p-6">
            {recentTemplates.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Layers size={24} className="text-slate-400" />
                </div>
                <p className="text-slate-400 text-sm">No templates yet</p>
                <button 
                  onClick={() => navigate("/templates")}
                  className="mt-3 text-indigo-600 text-sm font-medium hover:text-indigo-700"
                >
                  Create your first template →
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {recentTemplates.map((template) => (
                  <div
                    key={template._id}
                    className="group flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-all duration-200 cursor-pointer"
                    onClick={() => navigate("/templates")}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-lg flex items-center justify-center">
                        <FileText size={16} className="text-indigo-600" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-700 text-sm">
                          {template.name}
                        </p>
                        <p className="text-xs text-slate-400">
                          {template.category || "Uncategorized"}
                        </p>
                      </div>
                    </div>
                    <ChevronRight size={16} className="text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Drive Files Panel - Only show if connected */}
        {isGoogleConnected && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-bold text-slate-800">Recent Drive Files</h2>
                  <p className="text-xs text-slate-500 mt-1">Your cloud storage files</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
                    className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    {viewMode === "grid" ? <List size={16} /> : <Grid size={16} />}
                  </button>
                  <button
                    onClick={() => navigate("/drive-files")}
                    className="text-indigo-600 text-sm font-medium hover:text-indigo-700 transition-colors"
                  >
                    View all
                  </button>
                </div>
              </div>
            </div>
            <div className="p-6">
              {files.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <HardDrive size={24} className="text-slate-400" />
                  </div>
                  <p className="text-slate-400 text-sm">No files in drive</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {files.slice(0, 5).map((file) => (
                    <div
                      key={file.id}
                      className="group flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-all duration-200"
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                          {getFileIcon(file.mimeType)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-700 truncate">
                            {file.name}
                          </p>
                          <p className="text-xs text-slate-400">
                            {formatFileSize(file.size)}
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => window.open(file.webViewLink, "_blank")}
                          className="p-1.5 rounded-lg hover:bg-slate-200 transition-colors"
                          title="View"
                        >
                          <Eye size={14} className="text-slate-500" />
                        </button>
                        <button
                          onClick={() => renameFile(file.id, file.name)}
                          className="p-1.5 rounded-lg hover:bg-slate-200 transition-colors"
                          title="Rename"
                        >
                          <Edit2 size={14} className="text-slate-500" />
                        </button>
                        <button
                          onClick={() => deleteFile(file.id, file.name)}
                          className="p-1.5 rounded-lg hover:bg-red-100 transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={14} className="text-slate-500 hover:text-red-500" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {files.length > 5 && (
                <button 
                  onClick={() => navigate("/drive-files")}
                  className="mt-4 w-full text-center text-sm text-indigo-600 font-medium hover:text-indigo-700 py-2"
                >
                  View all {files.length} files →
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Achievement Banner */}
      <div className="mt-8 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }}></div>
        <div className="relative flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl">
              <Trophy size={28} className="text-white" />
            </div>
            <div>
              <h4 className="text-white font-bold text-lg">
                You're crushing it! 🚀
              </h4>
              <p className="text-indigo-100 text-sm">
                {stats.driveFilesCount} files processed • {stats.templates} templates created
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <div className="bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-lg">
              <span className="text-white text-sm font-medium">+{stats.driveFilesCount + stats.templates} achievements</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg">
                  <Sparkles className="text-white" size={24} />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-slate-800">
                    Welcome back,{" "}
                    <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                      {user?.name?.split(" ")[0]}
                    </span>
                  </h1>
                  <p className="text-slate-500 text-sm mt-1">
                    Transform your documents with AI-powered tools
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="bg-white/80 backdrop-blur-sm px-4 py-2 rounded-xl shadow-sm border border-slate-200">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
                  <span className="text-sm font-medium text-slate-700">Pro Plan</span>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="p-2.5 rounded-xl bg-white/80 backdrop-blur-sm hover:bg-red-50 transition-all duration-200 border border-slate-200"
              >
                <LogOut size={18} className="text-slate-600 hover:text-red-500 transition-colors" />
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex gap-2 border-b border-slate-200 mb-6">
            <button
              onClick={() => {
                setActiveTab("dashboard");
                navigate("/dashboard");
              }}
              className={`px-4 py-2 text-sm font-medium transition-all duration-200 ${
                activeTab === "dashboard"
                  ? "text-indigo-600 border-b-2 border-indigo-600"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Dashboard
            </button>
            {isGoogleConnected && (
              <button
                onClick={() => {
                  setActiveTab("drive-files");
                  navigate("/drive-files");
                }}
                className={`px-4 py-2 text-sm font-medium transition-all duration-200 ${
                  activeTab === "drive-files"
                    ? "text-indigo-600 border-b-2 border-indigo-600"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                Drive Files
              </button>
            )}
            <button
              onClick={() => navigate("/templates")}
              className={`px-4 py-2 text-sm font-medium transition-all duration-200 ${
                activeTab === "templates"
                  ? "text-indigo-600 border-b-2 border-indigo-600"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Templates
            </button>
          </div>
        </div>

        {/* Route Content */}
        <Routes>
          <Route 
            path="/" 
            element={<DashboardContent />} 
          />
          <Route 
            path="/drive-files" 
            element={
              <ProtectedDriveRoute>
                <DriveFiles />
              </ProtectedDriveRoute>
            } 
          />
        </Routes>
      </div>
    </div>
  );
}

// Trophy Icon Component
function Trophy(props) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
      <path d="M4 22h16" />
      <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
      <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
    </svg>
  );
}

function StatCard({ title, value, subtitle, icon: Icon, gradient }) {
  return (
    <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 group">
      <div className="flex items-start justify-between mb-3">
        <p className="text-slate-500 text-sm font-medium">{title}</p>
        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center group-hover:scale-110 transition-transform`}>
          <Icon size={18} className="text-white" />
        </div>
      </div>
      <h3 className="text-2xl font-bold text-slate-800">{value}</h3>
      {subtitle && (
        <p className="text-xs text-slate-400 mt-1">{subtitle}</p>
      )}
    </div>
  );
}
