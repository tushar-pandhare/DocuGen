import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  FileText, Image, LogOut, LayoutDashboard, Sparkles, 
  Folder, ExternalLink, Search, Zap, Plus, User, 
  ChevronRight, Cloud, ArrowUpRight, Activity, 
  Layers, FileStack, TrendingUp, Star, Clock,
  Edit2, Trash2, Eye, File, FileArchive, 
  HardDrive, Grid, List, Settings, Shield,
  Award, Target, Users, Gift, BarChart3, Database
} from "lucide-react";

export default function Dashboard() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const [user, setUser] = useState(null);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ 
    documents: 0, 
    images: 0, 
    pages: 0,
    templates: 0,
    driveFilesCount: 0,
    totalDriveSize: 0
  });
  const [recentTemplates, setRecentTemplates] = useState([]);
  const [viewMode, setViewMode] = useState('grid');

  // Helper function to get file icon based on mime type
  const getFileIcon = (mimeType) => {
    if (mimeType?.includes('pdf')) {
      return <FileText size={14} className="text-red-500" />;
    } else if (mimeType?.includes('image')) {
      return <Image size={14} className="text-purple-500" />;
    } else if (mimeType?.includes('text')) {
      return <FileText size={14} className="text-blue-500" />;
    } else if (mimeType?.includes('zip') || mimeType?.includes('compressed')) {
      return <FileArchive size={14} className="text-amber-500" />;
    } else {
      return <File size={14} className="text-slate-500" />;
    }
  };

  // Helper function to format file size
  const formatFileSize = (bytes) => {
    if (!bytes) return '0 Bytes';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return parseFloat((bytes / Math.pow(1024, i)).toFixed(2)) + ' ' + sizes[i];
  };

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Get user data
        const userRes = await axios.get("http://localhost:5000/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(userRes.data);

        // Get Drive files if connected
        let driveFiles = [];
        if (userRes.data.googleTokens && Object.keys(userRes.data.googleTokens).length > 0) {
          try {
            const fileRes = await axios.get("http://localhost:5000/api/drive/files", {
              headers: { Authorization: `Bearer ${token}` },
            });
            driveFiles = fileRes.data.files || [];
            setFiles(driveFiles);
            
            // Calculate total size of all files
            const totalSize = driveFiles.reduce((sum, file) => sum + (file.size || 0), 0);
            
            setStats(prev => ({
              ...prev,
              documents: driveFiles.length,
              images: driveFiles.filter(f => f.mimeType?.includes('image')).length || 0,
              driveFilesCount: driveFiles.length,
              totalDriveSize: totalSize
            }));
          } catch (driveErr) {
            console.error("Drive fetch error:", driveErr);
          }
        }

        // Get template stats
        try {
          const templateStatsRes = await axios.get("http://localhost:5000/api/templates/stats/overview", {
            headers: { Authorization: `Bearer ${token}` },
          });
          setStats(prev => ({
            ...prev,
            templates: templateStatsRes.data.totalTemplates || 0
          }));
        } catch (templateErr) {
          console.error("Template stats error:", templateErr);
        }

        // Get recent templates
        try {
          const templatesRes = await axios.get("http://localhost:5000/api/templates", {
            headers: { Authorization: `Bearer ${token}` },
            params: { limit: 4 }
          });
          setRecentTemplates(templatesRes.data.templates?.slice(0, 4) || []);
        } catch (templatesErr) {
          console.error("Recent templates error:", templatesErr);
        }

      } catch (err) {
        console.error("Fetch data error:", err);
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
      const res = await axios.get("http://localhost:5000/api/auth/google", {
        headers: { Authorization: `Bearer ${token}` },
      });
      window.location.href = res.data.url;
    } catch (err) {
      alert("Google connection failed");
    }
  };

  const renameFile = async (fileId, currentName) => {
    const newName = prompt('Enter new file name:', currentName);
    if (newName && newName.trim() && newName !== currentName) {
      try {
        const response = await axios.put(
          `http://localhost:5000/api/drive/rename-file/${fileId}`,
          { newName: newName.trim() },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        if (response.data.success) {
          const fileRes = await axios.get("http://localhost:5000/api/drive/files", {
            headers: { Authorization: `Bearer ${token}` },
          });
          const updatedFiles = fileRes.data.files || [];
          setFiles(updatedFiles);
          
          // Update stats
          const totalSize = updatedFiles.reduce((sum, file) => sum + (file.size || 0), 0);
          setStats(prev => ({
            ...prev,
            documents: updatedFiles.length,
            driveFilesCount: updatedFiles.length,
            totalDriveSize: totalSize,
            images: updatedFiles.filter(f => f.mimeType?.includes('image')).length || 0
          }));
          
          alert('File renamed successfully!');
        }
      } catch (err) {
        console.error('Rename error:', err);
        alert(err.response?.data?.error || 'Failed to rename file');
      }
    }
  };

  const deleteFile = async (fileId, fileName) => {
    if (confirm(`Are you sure you want to delete "${fileName}"? This action cannot be undone.`)) {
      try {
        await axios.delete(
          `http://localhost:5000/api/drive/delete-file/${fileId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        const fileRes = await axios.get("http://localhost:5000/api/drive/files", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const updatedFiles = fileRes.data.files || [];
        setFiles(updatedFiles);
        
        // Update stats
        const totalSize = updatedFiles.reduce((sum, file) => sum + (file.size || 0), 0);
        setStats(prev => ({
          ...prev,
          documents: updatedFiles.length,
          driveFilesCount: updatedFiles.length,
          totalDriveSize: totalSize,
          images: updatedFiles.filter(f => f.mimeType?.includes('image')).length || 0
        }));
        
        alert('File deleted successfully!');
      } catch (err) {
        console.error('Delete error:', err);
        alert('Failed to delete file');
      }
    }
  };

  const tools = [
    { title: "Smart Invoice", desc: "Create professional invoices", icon: FileText, color: "blue", path: "/invoice-generate" },
    { title: "Image to PDF", desc: "Convert images to PDFs", icon: Image, color: "purple", path: "/pdf-generate" },
    { title: "PDF to Image", desc: "Extract images from PDF", icon: Image, color: "purple", path: "/pdf-to-image" },
    { title: "Text OCR", desc: "Extract text from documents", icon: Search, color: "emerald", path: "/text-extractor" },
    { title: "Compressor", desc: "Reduce file size", icon: Zap, color: "amber", path: "/compress" },
    { title: "Template Library", desc: "Create & manage templates", icon: Layers, color: "indigo", path: "/templates" },
    { title: "Drive Files", desc: "Manage your cloud files", icon: HardDrive, color: "orange", path: "/drive-files" },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-t-3 border-b-3 border-indigo-600"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Sparkles className="text-indigo-400 animate-pulse" size={24} />
          </div>
        </div>
      </div>
    );
  }

  const isGoogleConnected = user?.googleTokens && Object.keys(user.googleTokens).length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-1 h-8 bg-gradient-to-b from-indigo-600 to-violet-600 rounded-full"></div>
              <h1 className="text-4xl font-bold text-slate-800">
                Welcome back, <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">{user?.name?.split(' ')[0] || 'Guest'}</span>
              </h1>
            </div>
            <p className="text-slate-500 ml-3">Manage your documents smarter with AI-powered tools</p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-200 flex items-center gap-2">
              <Award size={16} className="text-emerald-500" />
              <span className="text-sm text-slate-600">Pro Plan</span>
            </div>
            <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-200 flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-violet-500 rounded-lg flex items-center justify-center">
                <User size={14} className="text-white" />
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-semibold text-slate-700">{user?.name}</p>
                <p className="text-xs text-slate-400">{user?.email}</p>
              </div>
            </div>
            <button 
              onClick={handleLogout}
              className="p-2 hover:bg-red-50 rounded-xl transition-colors group"
            >
              <LogOut size={20} className="text-slate-400 group-hover:text-red-500" />
            </button>
          </div>
        </div>

        {/* Stats Cards - Only 3 Cards Now */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 hover:shadow-md transition group">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center group-hover:scale-110 transition">
                <HardDrive size={20} className="text-blue-500" />
              </div>
              <span className="text-2xl font-bold text-slate-800">{stats.driveFilesCount}</span>
            </div>
            <p className="text-slate-500 text-sm">Files in Drive</p>
            {stats.totalDriveSize > 0 && (
              <p className="text-xs text-slate-400 mt-1">{formatFileSize(stats.totalDriveSize)}</p>
            )}
          </div>
          
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 hover:shadow-md transition group">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center group-hover:scale-110 transition">
                <Layers size={20} className="text-purple-500" />
              </div>
              <span className="text-2xl font-bold text-slate-800">{stats.templates}</span>
            </div>
            <p className="text-slate-500 text-sm">Templates Created</p>
          </div>
          
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 hover:shadow-md transition group">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center group-hover:scale-110 transition">
                <Image size={20} className="text-amber-500" />
              </div>
              <span className="text-2xl font-bold text-slate-800">{stats.images}</span>
            </div>
            <p className="text-slate-500 text-sm">Images in Drive</p>
          </div>
        </div>

        {/* Quick Actions Banner */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-6 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Sparkles size={24} className="text-white" />
              </div>
              <div>
                <h3 className="text-white font-bold text-lg">Quick Actions</h3>
                <p className="text-indigo-100 text-sm">Generate documents, manage templates, or access your drive</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => navigate("/invoice-generate")}
                className="px-4 py-2 bg-white text-indigo-600 rounded-xl font-semibold text-sm hover:shadow-lg transition"
              >
                New Invoice
              </button>
              <button
                onClick={() => navigate("/templates")}
                className="px-4 py-2 bg-white/20 text-white rounded-xl font-semibold text-sm hover:bg-white/30 transition"
              >
                Browse Templates
              </button>
            </div>
          </div>
        </div>

        {/* Quick Tools Grid */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-bold text-slate-800">Quick Tools</h2>
            <div className="flex gap-2">
              <button 
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition ${viewMode === 'grid' ? 'bg-indigo-100 text-indigo-600' : 'text-slate-400 hover:bg-slate-100'}`}
              >
                <Grid size={18} />
              </button>
              <button 
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition ${viewMode === 'list' ? 'bg-indigo-100 text-indigo-600' : 'text-slate-400 hover:bg-slate-100'}`}
              >
                <List size={18} />
              </button>
            </div>
          </div>
          
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4">
              {tools.map((tool, idx) => {
                const Icon = tool.icon;
                const colorMap = {
                  blue: "bg-blue-50 text-blue-600 group-hover:bg-blue-100",
                  purple: "bg-purple-50 text-purple-600 group-hover:bg-purple-100",
                  emerald: "bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100",
                  amber: "bg-amber-50 text-amber-600 group-hover:bg-amber-100",
                  indigo: "bg-indigo-50 text-indigo-600 group-hover:bg-indigo-100",
                  orange: "bg-orange-50 text-orange-600 group-hover:bg-orange-100"
                };
                return (
                  <div 
                    key={idx}
                    onClick={() => navigate(tool.path)}
                    className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 cursor-pointer group"
                  >
                    <div className={`w-12 h-12 rounded-xl ${colorMap[tool.color]} flex items-center justify-center mb-3 transition-all group-hover:scale-110`}>
                      <Icon size={22} />
                    </div>
                    <h3 className="font-semibold text-slate-800 mb-1 text-sm">{tool.title}</h3>
                    <p className="text-xs text-slate-400">{tool.desc}</p>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="space-y-2">
              {tools.map((tool, idx) => {
                const Icon = tool.icon;
                return (
                  <div 
                    key={idx}
                    onClick={() => navigate(tool.path)}
                    className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer group flex items-center gap-4"
                  >
                    <div className={`w-10 h-10 rounded-xl bg-${tool.color}-50 text-${tool.color}-600 flex items-center justify-center group-hover:scale-110 transition`}>
                      <Icon size={18} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-800">{tool.title}</h3>
                      <p className="text-xs text-slate-400">{tool.desc}</p>
                    </div>
                    <ChevronRight size={16} className="text-slate-300 group-hover:text-indigo-500" />
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent Templates & Drive Files Section */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Recent Templates */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Layers size={18} className="text-indigo-500" />
                <h2 className="font-bold text-slate-800">Recent Templates</h2>
              </div>
              <button 
                onClick={() => navigate("/templates")}
                className="text-xs text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
              >
                View All <ChevronRight size={12} />
              </button>
            </div>
            <div className="divide-y divide-slate-100">
              {recentTemplates.length === 0 ? (
                <div className="px-6 py-8 text-center">
                  <Layers size={32} className="mx-auto text-slate-300 mb-2" />
                  <p className="text-slate-400 text-sm">No templates yet</p>
                  <button
                    onClick={() => navigate("/templates/create")}
                    className="mt-2 text-indigo-600 text-sm hover:underline"
                  >
                    Create your first template
                  </button>
                </div>
              ) : (
                recentTemplates.map((template) => (
                  <div key={template._id} className="px-6 py-3 flex items-center justify-between hover:bg-slate-50 transition">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center">
                        <FileText size={14} className="text-indigo-500" />
                      </div>
                      <div>
                        <span className="text-sm font-medium text-slate-700">{template.name}</span>
                        <p className="text-xs text-slate-400">{template.category}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        <Star size={10} /> {template.likes || 0}
                      </span>
                      <button 
                        onClick={() => navigate(`/templates/edit/${template._id}`)}
                        className="text-xs text-indigo-600 hover:underline"
                      >
                        Use
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Drive Files Section */}
          {isGoogleConnected && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <HardDrive size={18} className="text-amber-500" />
                  <h2 className="font-bold text-slate-800">Recent Files</h2>
                  <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                    {files.length} files
                  </span>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => navigate("/drive-files")}
                    className="text-xs text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                  >
                    See All <ChevronRight size={12} />
                  </button>
                  <button 
                    onClick={() => window.open("https://drive.google.com", "_blank")}
                    className="text-xs text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                  >
                    Open Drive <ExternalLink size={12} />
                  </button>
                </div>
              </div>
              {files.length === 0 ? (
                <div className="px-6 py-8 text-center">
                  <HardDrive size={32} className="mx-auto text-slate-300 mb-2" />
                  <p className="text-slate-400 text-sm">No files in DocuGen folder yet</p>
                  <p className="text-xs text-slate-300 mt-1">Generated documents will appear here</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
                  {files.slice(0, 5).map((file) => (
                    <div key={file.id} className="px-6 py-3 flex items-center justify-between hover:bg-slate-50 transition group">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          {getFileIcon(file.mimeType)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-700 truncate">{file.name}</p>
                          <div className="flex items-center gap-3 mt-0.5">
                            <span className="text-xs text-slate-400">
                              {formatFileSize(file.size)}
                            </span>
                            <span className="text-xs text-slate-400">
                              {new Date(file.modifiedTime || file.createdTime).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-4 opacity-0 group-hover:opacity-100 transition">
                        <button 
                          onClick={() => window.open(file.webViewLink, "_blank")}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-indigo-50 transition"
                          title="View"
                        >
                          <Eye size={14} />
                        </button>
                        <button 
                          onClick={() => renameFile(file.id, file.name)}
                          className="p-1.5 text-slate-400 hover:text-emerald-600 rounded-lg hover:bg-emerald-50 transition"
                          title="Rename"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button 
                          onClick={() => deleteFile(file.id, file.name)}
                          className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition"
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {files.length > 5 && (
                <div className="px-6 py-3 border-t border-slate-100 text-center">
                  <button 
                    onClick={() => navigate("/drive-files")}
                    className="text-sm text-indigo-600 hover:text-indigo-700"
                  >
                    View all {files.length} files →
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Achievement Banner */}
        <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Trophy size={24} className="text-white" />
              </div>
              <div>
                <h4 className="text-white font-bold">You're on a roll!</h4>
                <p className="text-emerald-100 text-sm">
                  {stats.driveFilesCount} files in Drive • {stats.templates} templates created
                </p>
              </div>
            </div>
            <Gift size={24} className="text-white/60" />
          </div>
        </div>
      </div>
    </div>
  );
}

// Trophy Icon Component
function Trophy(props) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M6 9H4.5C3.8 9 3 8.2 3 7.5V5c0-1.1.9-2 2-2h14c1.1 0 2 .9 2 2v2.5c0 .7-.8 1.5-1.5 1.5H18" />
      <path d="M12 9v9" />
      <path d="M9 18h6" />
      <path d="M9 22h6" />
      <path d="M8 9h8" />
    </svg>
  );
}
// import axios from "axios";
// import { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { 
//   FileText, Image, LogOut, LayoutDashboard, Sparkles, 
//   Folder, ExternalLink, Search, Zap, Plus, User, 
//   ChevronRight, Cloud, ArrowUpRight, Activity 
// } from "lucide-react";

// export default function Dashboard() {
//   const navigate = useNavigate();
//   const token = localStorage.getItem("token");
//   const [user, setUser] = useState(null);
//   const [files, setFiles] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [stats, setStats] = useState({ documents: 0, images: 0, pages: 0 });

//   useEffect(() => {
//     if (!token) {
//       navigate("/login");
//       return;
//     }

//     const fetchData = async () => {
//       try {
//         const userRes = await axios.get("http://localhost:5000/api/auth/me", {
//           headers: { Authorization: `Bearer ${token}` },
//         });
//         setUser(userRes.data);

//         if (userRes.data.googleTokens) {
//           const fileRes = await axios.get("http://localhost:5000/api/drive/files", {
//             headers: { Authorization: `Bearer ${token}` },
//           });
//           setFiles(fileRes.data.files || []);
//           setStats({
//             documents: fileRes.data.files?.length || 0,
//             images: fileRes.data.files?.filter(f => f.mimeType?.includes('image')).length || 0,
//             pages: Math.floor(Math.random() * 100) + 50
//           });
//         }
//       } catch (err) {
//         console.error(err);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchData();
//   }, [token, navigate]);

//   const handleLogout = () => {
//     localStorage.removeItem("token");
//     navigate("/login");
//   };

//   const handleGoogleConnect = async () => {
//     try {
//       const res = await axios.get("http://localhost:5000/api/auth/google", {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       window.location.href = res.data.url;
//     } catch (err) {
//       alert("Google connection failed");
//     }
//   };

//   const tools = [
//     { title: "Smart Invoice", desc: "Create professional invoices", icon: FileText, color: "blue", path: "/invoice-generate" },
//     { title: "Image to PDF", desc: "Convert images to PDFs", icon: Image, color: "purple", path: "/pdf-generate" },
//     { title: "PDF to Image", desc: "Extract images from PDF", icon: Image, color: "purple", path: "/pdf-to-image" },
//     { title: "Text OCR", desc: "Extract text from documents", icon: Search, color: "emerald", path: "/text-extractor" },
//     { title: "Compressor", desc: "Reduce file size", icon: Zap, color: "amber", path: "/compress" },
//   ];

//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-50 to-slate-100">
//         <div className="relative">
//           <div className="animate-spin rounded-full h-16 w-16 border-t-3 border-b-3 border-indigo-600"></div>
//           <div className="absolute inset-0 flex items-center justify-center">
//             <Sparkles className="text-indigo-400 animate-pulse" size={24} />
//           </div>
//         </div>
//       </div>
//     );
//   }

//   const isGoogleConnected = user?.googleTokens && Object.keys(user.googleTokens).length > 0;

//   return (
//     <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-slate-100">
//       <div className="max-w-7xl mx-auto px-6 py-8">
//         {/* Header Section */}
//         <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4">
//           <div>
//             <div className="flex items-center gap-2 mb-2">
//               <div className="w-1 h-8 bg-linear-to-b from-indigo-600 to-violet-600 rounded-full"></div>
//               <h1 className="text-4xl font-bold text-slate-800">
//                 Welcome back, <span className="bg-linear-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">{user?.name?.split(' ')[0] || 'Guest'}</span>
//               </h1>
//             </div>
//             <p className="text-slate-500 ml-3">Manage your documents smarter with AI-powered tools</p>
//           </div>
          
//           <div className="flex items-center gap-3">
//             <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-200 flex items-center gap-2">
//               <Activity size={16} className="text-emerald-500" />
//               <span className="text-sm text-slate-600">Pro Plan</span>
//             </div>
//             <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-200 flex items-center gap-3">
//               <div className="w-8 h-8 bg-linear-to-br from-indigo-600 to-violet-500 rounded-lg flex items-center justify-center">
//                 <User size={14} className="text-white" />
//               </div>
//               <div className="hidden md:block">
//                 <p className="text-sm font-semibold text-slate-700">{user?.name}</p>
//                 <p className="text-xs text-slate-400">{user?.email}</p>
//               </div>
//             </div>
//             <button 
//               onClick={handleLogout}
//               className="p-2 hover:bg-red-50 rounded-xl transition-colors group"
//             >
//               <LogOut size={20} className="text-slate-400 group-hover:text-red-500" />
//             </button>
//           </div>
//         </div>

//         {/* Stats Cards */}
//         <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
//           <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:shadow-md transition">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-slate-500 text-sm">Total Documents</p>
//                 <p className="text-3xl font-bold text-slate-800 mt-1">{stats.documents}</p>
//               </div>
//               <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
//                 <FileText size={24} className="text-blue-500" />
//               </div>
//             </div>
//           </div>
          
//           <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:shadow-md transition">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-slate-500 text-sm">Images Processed</p>
//                 <p className="text-3xl font-bold text-slate-800 mt-1">{stats.images}</p>
//               </div>
//               <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center">
//                 <Image size={24} className="text-purple-500" />
//               </div>
//             </div>
//           </div>
          
//           <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:shadow-md transition">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-slate-500 text-sm">Pages Extracted</p>
//                 <p className="text-3xl font-bold text-slate-800 mt-1">{stats.pages}</p>
//               </div>
//               <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center">
//                 <Sparkles size={24} className="text-emerald-500" />
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Google Drive Connection */}
//         {!isGoogleConnected && (
//           <div className="relative overflow-hidden bg-linear-to-r from-indigo-600 to-violet-600 rounded-2xl p-8 mb-8 shadow-2xl">
//             <div className="absolute top-0 right-0 opacity-10">
//               <Cloud size={200} />
//             </div>
//             <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
//               <div>
//                 <h3 className="text-2xl font-bold text-white mb-2">Connect Google Drive</h3>
//                 <p className="text-indigo-100">Access your cloud files and auto-save generated documents</p>
//               </div>
//               <button 
//                 onClick={handleGoogleConnect}
//                 className="bg-white text-indigo-600 px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all flex items-center gap-2 group"
//               >
//                 <Plus size={18} />
//                 Link Account
//                 <ArrowUpRight size={16} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition" />
//               </button>
//             </div>
//           </div>
//         )}

//         {/* Quick Tools Grid */}
//         <div className="mb-8">
//           <div className="flex items-center justify-between mb-5">
//             <h2 className="text-xl font-bold text-slate-800">Quick Tools</h2>
//             <button className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
//               View all <ChevronRight size={14} />
//             </button>
//           </div>
//           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
//             {tools.map((tool, idx) => {
//               const Icon = tool.icon;
//               const colorMap = {
//                 blue: "bg-blue-50 text-blue-600 group-hover:bg-blue-100",
//                 purple: "bg-purple-50 text-purple-600 group-hover:bg-purple-100",
//                 emerald: "bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100",
//                 amber: "bg-amber-50 text-amber-600 group-hover:bg-amber-100"
//               };
//               return (
//                 <div 
//                   key={idx}
//                   onClick={() => navigate(tool.path)}
//                   className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 cursor-pointer group"
//                 >
//                   <div className={`w-12 h-12 rounded-xl ${colorMap[tool.color]} flex items-center justify-center mb-3 transition-all group-hover:scale-110`}>
//                     <Icon size={22} />
//                   </div>
//                   <h3 className="font-semibold text-slate-800 mb-1">{tool.title}</h3>
//                   <p className="text-xs text-slate-400">{tool.desc}</p>
//                 </div>
//               );
//             })}
//           </div>
//         </div>

//         {/* Recent Files */}
//         {isGoogleConnected && files.length > 0 && (
//           <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
//             <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
//               <div className="flex items-center gap-2">
//                 <Folder size={18} className="text-amber-500" />
//                 <h2 className="font-bold text-slate-800">Recent Files</h2>
//               </div>
//               <button 
//                 onClick={() => window.open("https://drive.google.com", "_blank")}
//                 className="text-xs text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
//               >
//                 Open Drive <ExternalLink size={12} />
//               </button>
//             </div>
//             <div className="divide-y divide-slate-100">
//               {files.slice(0, 5).map((file) => (
//                 <div key={file.id} className="px-6 py-3 flex items-center justify-between hover:bg-slate-50 transition">
//                   <div className="flex items-center gap-3">
//                     <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
//                       <FileText size={14} className="text-slate-500" />
//                     </div>
//                     <span className="text-sm text-slate-700">{file.name}</span>
//                   </div>
//                   <button 
//                     onClick={() => window.open(`https://drive.google.com/file/d/${file.id}/view`, "_blank")}
//                     className="text-xs text-indigo-600 hover:underline"
//                   >
//                     View
//                   </button>
//                 </div>
//               ))}
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }