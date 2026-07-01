// import { useEffect, useState } from "react";
// import { useNavigate, Routes, Route } from "react-router-dom";
// import {
//   FileText, Image, LogOut, Sparkles, Search, Zap, Plus, User,
//   ChevronRight, Cloud, ArrowUpRight, HardDrive, Grid, List, Layers,
//   Award, Gift, Eye, Edit2, Trash2, File, FileArchive, FolderOpen,
//   Clock, TrendingUp, Database, LayoutGrid, ListChecks, Star, Download,
//   Share2, MoreVertical, Bot, UploadCloud, ScanLine,
// } from "lucide-react";
// import api from "../services/api";
// import DriveFiles from "./DriveFiles";

// export default function Dashboard() {
//   const navigate = useNavigate();
//   const token = localStorage.getItem("token");

//   const [user, setUser] = useState(null);
//   const [files, setFiles] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [recentTemplates, setRecentTemplates] = useState([]);
//   const [viewMode, setViewMode] = useState("grid");
//   const [hoveredTool, setHoveredTool] = useState(null);
//   const [activeTab, setActiveTab] = useState("dashboard");

//   const [stats, setStats] = useState({
//     documents: 0,
//     images: 0,
//     templates: 0,
//     driveFilesCount: 0,
//     totalDriveSize: 0,
//   });

//   const colorMap = {
//     blue: "from-blue-500 to-blue-600",
//     purple: "from-purple-500 to-purple-600",
//     emerald: "from-emerald-500 to-emerald-600",
//     teal: "from-teal-500 to-teal-600",
//     indigo: "from-indigo-500 to-indigo-600",
//     rose: "from-rose-500 to-rose-600",
//     cyan: "from-cyan-500 to-cyan-600",
//   };

//   const iconBgMap = {
//     blue: "bg-blue-50", purple: "bg-purple-50", emerald: "bg-emerald-50",
//     teal: "bg-teal-50", indigo: "bg-indigo-50", rose: "bg-rose-50", cyan: "bg-cyan-50",
//   };

//   const iconColorMap = {
//     blue: "text-blue-600", purple: "text-purple-600", emerald: "text-emerald-600",
//     teal: "text-teal-600", indigo: "text-indigo-600", rose: "text-rose-600", cyan: "text-cyan-600",
//   };

//   // AI Assistant is first and marked as "featured" — everything else
//   // keeps its original spot, just reworded slightly to read as part of
//   // one document pipeline instead of separate disconnected tools.
//   const tools = [
//     { title: "AI Document Chat", desc: "Ask questions, get answers from your files", icon: Bot, color: "indigo", path: "/ai-assistant", badge: "AI", featured: true },
//     { title: "Smart Invoice", desc: "Create professional invoices", icon: FileText, color: "blue", path: "/invoice-generate" },
//     { title: "Image to PDF", desc: "Convert images to PDFs", icon: Image, color: "purple", path: "/pdf-generate" },
//     { title: "PDF to Image", desc: "Extract images from PDF", icon: Image, color: "teal", path: "/pdf-to-image" },
//     { title: "Text OCR", desc: "Extract text from documents", icon: ScanLine, color: "emerald", path: "/text-extractor" },
//     { title: "Compressor", desc: "Reduce file size", icon: Zap, color: "rose", path: "/compress" },
//     { title: "Template Library", desc: "Create & manage templates", icon: Layers, color: "indigo", path: "/templates" },
//   ];

//   const getFileIcon = (mimeType) => {
//     if (mimeType?.includes("pdf")) return <FileText size={14} className="text-red-500" />;
//     if (mimeType?.includes("image")) return <Image size={14} className="text-purple-500" />;
//     if (mimeType?.includes("zip")) return <FileArchive size={14} className="text-amber-500" />;
//     return <File size={14} className="text-slate-500" />;
//   };

//   const formatFileSize = (bytes) => {
//     if (!bytes) return "0 Bytes";
//     const sizes = ["Bytes", "KB", "MB", "GB"];
//     const i = Math.floor(Math.log(bytes) / Math.log(1024));
//     return parseFloat((bytes / Math.pow(1024, i)).toFixed(2)) + " " + sizes[i];
//   };

//   // Interceptor handles Authorization header automatically
//   const fetchDriveFiles = async () => {
//     const fileRes = await api.get("/drive/files");
//     const driveFiles = fileRes.data.files || [];
//     setFiles(driveFiles);
//     const totalSize = driveFiles.reduce((sum, file) => sum + (file.size || 0), 0);
//     setStats((prev) => ({
//       ...prev,
//       documents: driveFiles.length,
//       images: driveFiles.filter((f) => f.mimeType?.includes("image")).length,
//       driveFilesCount: driveFiles.length,
//       totalDriveSize: totalSize,
//     }));
//   };

//   useEffect(() => {
//     if (!token) {
//       navigate("/login");
//       return;
//     }

//     const fetchData = async () => {
//       try {
//         setLoading(true);

//         const params = new URLSearchParams(window.location.search);
//         if (params.get("drive_error")) {
//           window.history.replaceState({}, "", "/");
//           alert("Google Drive connection failed or was denied.");
//         }

//         // Interceptor auto-attaches Bearer token — no manual headers needed
//         const userRes = await api.get("/auth/me");
//         setUser(userRes.data);

//         if (params.get("drive_connected") === "true") {
//           window.history.replaceState({}, "", "/");
//         }

//         const isConnected =
//           userRes.data.googleTokens &&
//           userRes.data.googleTokens.access_token &&
//           Object.keys(userRes.data.googleTokens).length > 0;

//         if (isConnected) {
//           await fetchDriveFiles();
//         }

//         try {
//           const templateStatsRes = await api.get("/templates/stats/overview");
//           setStats((prev) => ({
//             ...prev,
//             templates: templateStatsRes.data.totalTemplates || 0,
//           }));
//         } catch {}

//         try {
//           const templatesRes = await api.get("/templates", { params: { limit: 4 } });
//           setRecentTemplates(templatesRes.data.templates?.slice(0, 4) || []);
//         } catch {}

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
//     localStorage.removeItem("user");
//     navigate("/login");
//   };

//   const handleGoogleConnect = async () => {
//     try {
//       const res = await api.get("/auth/google");
//       if (res.data.url) {
//         window.location.href = res.data.url;
//       }
//     } catch (err) {
//       if (err.response?.status === 401) {
//         alert("Session expired. Please login again.");
//         localStorage.removeItem("token");
//         navigate("/login");
//       } else {
//         alert("Google connection failed");
//       }
//     }
//   };

//   const renameFile = async (fileId, currentName) => {
//     const newName = prompt("Enter new file name:", currentName);
//     if (!newName || newName === currentName) return;
//     await api.put(`/drive/rename-file/${fileId}`, { newName });
//     await fetchDriveFiles();
//   };

//   const deleteFile = async (fileId, fileName) => {
//     if (!window.confirm(`Delete "${fileName}"?`)) return;
//     await api.delete(`/drive/delete-file/${fileId}`);
//     await fetchDriveFiles();
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200">
//         <div className="relative">
//           <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-indigo-600 border-b-4"></div>
//           <div className="absolute inset-0 flex items-center justify-center">
//             <div className="h-8 w-8 rounded-full bg-indigo-100 animate-pulse"></div>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   const isGoogleConnected =
//     user?.googleTokens &&
//     user.googleTokens.access_token &&
//     Object.keys(user.googleTokens).length > 0;

//   const ProtectedDriveRoute = ({ children }) => {
//     if (!isGoogleConnected) {
//       return (
//         <div className="text-center py-12">
//           <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
//             <Cloud size={32} className="text-slate-400" />
//           </div>
//           <h3 className="text-lg font-semibold text-slate-800 mb-2">Google Drive Not Connected</h3>
//           <p className="text-slate-500 mb-4">Please connect your Google Drive account to access this feature</p>
//           <button
//             onClick={handleGoogleConnect}
//             className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-2 rounded-lg font-medium hover:shadow-lg transition-all"
//           >
//             Connect Google Drive
//           </button>
//         </div>
//       );
//     }
//     return children;
//   };

//   const DashboardContent = () => (
//     <>
//       {/* AI hero banner — single headline, two CTAs, nothing else competing for attention */}
//       <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 lg:p-8 shadow-lg mb-8 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
//         <div>
//           <div className="inline-flex items-center gap-1.5 bg-white/15 text-white text-xs font-semibold px-3 py-1 rounded-full mb-3">
//             <Sparkles size={12} /> AI-Powered
//           </div>
//           <h1 className="text-2xl lg:text-3xl font-bold text-white mb-1">
//             Welcome back, {user?.name?.split(" ")[0]}
//           </h1>
//           <p className="text-indigo-100 text-sm max-w-md">
//             Chat with your documents — upload a file and ask questions in plain language.
//           </p>
//         </div>
//         <div className="flex gap-3 flex-shrink-0">
//           <button
//             onClick={() => navigate("/ai-assistant")}
//             className="inline-flex items-center gap-2 bg-white text-indigo-700 px-5 py-2.5 rounded-xl font-semibold shadow-sm hover:shadow-md transition-all"
//           >
//             <Bot size={16} /> Try AI Assistant
//           </button>
//           <button
//             onClick={() => navigate("/text-extractor")}
//             className="inline-flex items-center gap-2 bg-white/10 text-white px-5 py-2.5 rounded-xl font-semibold border border-white/30 hover:bg-white/20 transition-all"
//           >
//             <UploadCloud size={16} /> Upload Documents
//           </button>
//         </div>
//       </div>

//       <div className="grid md:grid-cols-4 gap-5 mb-8">
//         <StatCard title="Total Files" value={stats.driveFilesCount} subtitle={formatFileSize(stats.totalDriveSize)} icon={Database} gradient="from-blue-500 to-blue-600" />
//         <StatCard title="Templates" value={stats.templates} icon={Layers} gradient="from-purple-500 to-purple-600" />
//         <StatCard title="Images" value={stats.images} icon={Image} gradient="from-emerald-500 to-emerald-600" />
//         <StatCard title="Documents" value={stats.documents} icon={FileText} gradient="from-teal-500 to-teal-600" />
//       </div>

//       {!isGoogleConnected && (
//         <div className="relative overflow-hidden bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 rounded-2xl mb-8 shadow-xl">
//           <div className="relative p-6 flex justify-between items-center">
//             <div className="flex items-center gap-4">
//               <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl">
//                 <Cloud className="text-white" size={28} />
//               </div>
//               <div>
//                 <h3 className="text-xl font-bold text-white">Connect Google Drive</h3>
//                 <p className="text-indigo-100 text-sm mt-1">Sync, manage, and access all your cloud files in one place</p>
//               </div>
//             </div>
//             <button
//               onClick={handleGoogleConnect}
//               className="bg-white text-indigo-600 px-6 py-2.5 rounded-xl font-semibold hover:shadow-lg transition-all duration-200 hover:scale-105"
//             >
//               Connect Now
//             </button>
//           </div>
//         </div>
//       )}

//       <div className="mb-10">
//         <div className="flex items-center justify-between mb-5">
//           <div>
//             <h2 className="text-xl font-bold text-slate-800">Quick Tools</h2>
//             <p className="text-sm text-slate-500">AI-powered document processing</p>
//           </div>
//         </div>
//         <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
//           {tools.map((tool, idx) => {
//             const Icon = tool.icon;
//             return (
//               <div
//                 key={idx}
//                 onMouseEnter={() => setHoveredTool(idx)}
//                 onMouseLeave={() => setHoveredTool(null)}
//                 onClick={() => navigate(tool.path)}
//                 className={`group relative rounded-xl p-5 border shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden ${
//                   tool.featured ? "bg-gradient-to-br from-indigo-600 to-purple-600 border-transparent" : "bg-white border-slate-200"
//                 }`}
//               >
//                 <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 transition-transform group-hover:scale-110 ${
//                   tool.featured ? "bg-white/20" : iconBgMap[tool.color]
//                 }`}>
//                   <Icon size={22} className={tool.featured ? "text-white" : iconColorMap[tool.color]} />
//                 </div>
//                 <h3 className={`font-semibold mb-1 ${tool.featured ? "text-white" : "text-slate-800"}`}>{tool.title}</h3>
//                 <p className={`text-xs ${tool.featured ? "text-indigo-100" : "text-slate-400"}`}>{tool.desc}</p>
//                 {tool.badge && (
//                   <div className="absolute top-3 right-3">
//                     <div className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
//                       tool.featured ? "bg-white/20 text-white" : "bg-gradient-to-r from-amber-400 to-amber-500 text-white"
//                     }`}>
//                       {tool.badge}
//                     </div>
//                   </div>
//                 )}
//               </div>
//             );
//           })}
//         </div>
//       </div>

//       <div className="grid lg:grid-cols-2 gap-6">
//         <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
//           <div className="p-6 border-b border-slate-100">
//             <div className="flex items-center justify-between">
//               <div>
//                 <h2 className="font-bold text-slate-800">Recent Templates</h2>
//                 <p className="text-xs text-slate-500 mt-1">Your recently used templates</p>
//               </div>
//               <button onClick={() => navigate("/templates")} className="text-indigo-600 text-sm font-medium hover:text-indigo-700 transition-colors">
//                 View all
//               </button>
//             </div>
//           </div>
//           <div className="p-6">
//             {recentTemplates.length === 0 ? (
//               <div className="text-center py-8">
//                 <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
//                   <Layers size={24} className="text-slate-400" />
//                 </div>
//                 <p className="text-slate-400 text-sm">No templates yet</p>
//                 <button onClick={() => navigate("/templates")} className="mt-3 text-indigo-600 text-sm font-medium hover:text-indigo-700">
//                   Create your first template →
//                 </button>
//               </div>
//             ) : (
//               <div className="space-y-3">
//                 {recentTemplates.map((template) => (
//                   <div
//                     key={template._id}
//                     className="group flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-all duration-200 cursor-pointer"
//                     onClick={() => navigate("/templates")}
//                   >
//                     <div className="flex items-center gap-3">
//                       <div className="w-10 h-10 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-lg flex items-center justify-center">
//                         <FileText size={16} className="text-indigo-600" />
//                       </div>
//                       <div>
//                         <p className="font-medium text-slate-700 text-sm">{template.name}</p>
//                         <p className="text-xs text-slate-400">{template.category || "Uncategorized"}</p>
//                       </div>
//                     </div>
//                     <ChevronRight size={16} className="text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
//                   </div>
//                 ))}
//               </div>
//             )}
//           </div>
//         </div>

//         {isGoogleConnected && (
//           <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
//             <div className="p-6 border-b border-slate-100">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <h2 className="font-bold text-slate-800">Recent Drive Files</h2>
//                   <p className="text-xs text-slate-500 mt-1">Your cloud storage files</p>
//                 </div>
//                 <button onClick={() => navigate("/drive-files")} className="text-indigo-600 text-sm font-medium hover:text-indigo-700 transition-colors">
//                   View all
//                 </button>
//               </div>
//             </div>
//             <div className="p-6">
//               {files.length === 0 ? (
//                 <div className="text-center py-8">
//                   <HardDrive size={24} className="text-slate-400 mx-auto mb-3" />
//                   <p className="text-slate-400 text-sm">No files in drive</p>
//                 </div>
//               ) : (
//                 <div className="space-y-2">
//                   {files.slice(0, 5).map((file) => (
//                     <div key={file.id} className="group flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-all duration-200">
//                       <div className="flex items-center gap-3 flex-1">
//                         <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
//                           {getFileIcon(file.mimeType)}
//                         </div>
//                         <div className="flex-1 min-w-0">
//                           <p className="text-sm font-medium text-slate-700 truncate">{file.name}</p>
//                           <p className="text-xs text-slate-400">{formatFileSize(file.size)}</p>
//                         </div>
//                       </div>
//                       <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
//                         <button onClick={() => window.open(file.webViewLink, "_blank")} className="p-1.5 rounded-lg hover:bg-slate-200 transition-colors" title="View">
//                           <Eye size={14} className="text-slate-500" />
//                         </button>
//                         <button onClick={() => renameFile(file.id, file.name)} className="p-1.5 rounded-lg hover:bg-slate-200 transition-colors" title="Rename">
//                           <Edit2 size={14} className="text-slate-500" />
//                         </button>
//                         <button onClick={() => deleteFile(file.id, file.name)} className="p-1.5 rounded-lg hover:bg-red-100 transition-colors" title="Delete">
//                           <Trash2 size={14} className="text-slate-500 hover:text-red-500" />
//                         </button>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               )}
//               {files.length > 5 && (
//                 <button onClick={() => navigate("/drive-files")} className="mt-4 w-full text-center text-sm text-indigo-600 font-medium hover:text-indigo-700 py-2">
//                   View all {files.length} files →
//                 </button>
//               )}
//             </div>
//           </div>
//         )}
//       </div>

//       <div className="mt-8 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl p-6 shadow-xl relative overflow-hidden">
//         <div className="relative flex justify-between items-center">
//           <div className="flex items-center gap-4">
//             <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl">
//               <Trophy size={28} className="text-white" />
//             </div>
//             <div>
//               <h4 className="text-white font-bold text-lg">You're crushing it! 🚀</h4>
//               <p className="text-indigo-100 text-sm">
//                 {stats.driveFilesCount} files processed • {stats.templates} templates created
//               </p>
//             </div>
//           </div>
//         </div>
//       </div>
//     </>
//   );

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200">
//       <div className="max-w-7xl mx-auto px-6 py-8">
//         <div className="mb-8">
//           <div className="flex justify-between items-start mb-6">
//             <div>
//               <div className="flex items-center gap-3 mb-2">
//                 <div className="bg-gradient-to-r from-indigo-600 to-purple-600 w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg">
//                   <Sparkles className="text-white" size={24} />
//                 </div>
//                 <div>
//                   <h1 className="text-3xl font-bold text-slate-800">
//                     Welcome back,{" "}
//                     <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
//                       {user?.name?.split(" ")[0]}
//                     </span>
//                   </h1>
//                   <p className="text-slate-500 text-sm mt-1">Transform your documents with AI-powered tools</p>
//                 </div>
//               </div>
//             </div>
//             <div className="flex items-center gap-3">
//               <div className="bg-white/80 backdrop-blur-sm px-4 py-2 rounded-xl shadow-sm border border-slate-200">
//                 <div className="flex items-center gap-2">
//                   <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
//                   <span className="text-sm font-medium text-slate-700">Pro Plan</span>
//                 </div>
//               </div>
//               <button
//                 onClick={handleLogout}
//                 className="p-2.5 rounded-xl bg-white/80 backdrop-blur-sm hover:bg-red-50 transition-all duration-200 border border-slate-200"
//               >
//                 <LogOut size={18} className="text-slate-600 hover:text-red-500 transition-colors" />
//               </button>
//             </div>
//           </div>

//           <div className="flex gap-2 border-b border-slate-200 mb-6">
//             <button
//               onClick={() => { setActiveTab("dashboard"); navigate("/"); }}
//               className={`px-4 py-2 text-sm font-medium transition-all duration-200 ${
//                 activeTab === "dashboard" ? "text-indigo-600 border-b-2 border-indigo-600" : "text-slate-500 hover:text-slate-700"
//               }`}
//             >
//               Dashboard
//             </button>
//             {isGoogleConnected && (
//               <button
//                 onClick={() => { setActiveTab("drive-files"); navigate("/drive-files"); }}
//                 className={`px-4 py-2 text-sm font-medium transition-all duration-200 ${
//                   activeTab === "drive-files" ? "text-indigo-600 border-b-2 border-indigo-600" : "text-slate-500 hover:text-slate-700"
//                 }`}
//               >
//                 Drive Files
//               </button>
//             )}
//             <button
//               onClick={() => navigate("/templates")}
//               className="px-4 py-2 text-sm font-medium transition-all duration-200 text-slate-500 hover:text-slate-700"
//             >
//               Templates
//             </button>
//           </div>
//         </div>

//         {/* Nested routes inside MainPage */}
//         <Routes>
//           <Route path="/" element={<DashboardContent />} />
//           <Route
//             path="/drive-files"
//             element={
//               <ProtectedDriveRoute>
//                 <DriveFiles />
//               </ProtectedDriveRoute>
//             }
//           />
//         </Routes>
//       </div>
//     </div>
//   );
// }

// function Trophy(props) {
//   return (
//     <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//       <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
//       <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
//       <path d="M4 22h16" />
//       <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
//       <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
//       <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
//     </svg>
//   );
// }

// function StatCard({ title, value, subtitle, icon: Icon, gradient }) {
//   return (
//     <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 group">
//       <div className="flex items-start justify-between mb-3">
//         <p className="text-slate-500 text-sm font-medium">{title}</p>
//         <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center group-hover:scale-110 transition-transform`}>
//           <Icon size={18} className="text-white" />
//         </div>
//       </div>
//       <h3 className="text-2xl font-bold text-slate-800">{value}</h3>
//       {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
//     </div>
//   );
// }

import { useEffect, useState } from "react";
import { useNavigate, Routes, Route } from "react-router-dom";
import {
  FileText, Image, LogOut, Sparkles, Search, Zap,
  ChevronRight, Cloud, HardDrive, Layers,
  Eye, Edit2, Trash2, File, FileArchive,
  Database, Bot, UploadCloud, ScanLine, Brain,
  BookOpen, MessageSquare, Upload,
} from "lucide-react";
import api from "../services/api";
import DriveFiles from "./DriveFiles";

const TOOLS = [
  { title: "Smart Invoice",    desc: "Professional invoices in seconds",       icon: FileText,  color: "blue",   path: "/invoice-generate" },
  { title: "Image → PDF",      desc: "Merge images into a single PDF",         icon: Image,     color: "purple", path: "/pdf-generate" },
  { title: "PDF → Image",      desc: "Convert every page to an image",         icon: Image,     color: "teal",   path: "/pdf-to-image" },
  { title: "Text OCR",         desc: "Extract text from any document",         icon: ScanLine,  color: "emerald",path: "/text-extractor" },
  { title: "Compressor",       desc: "Shrink files without quality loss",      icon: Zap,       color: "rose",   path: "/compress" },
  { title: "Template Studio",  desc: "Build and reuse doc templates",          icon: Layers,    color: "amber",  path: "/templates" },
];

const ICON_BG = {
  blue: "#EFF6FF", purple: "#F5F3FF", emerald: "#ECFDF5",
  teal: "#F0FDFA", rose: "#FFF1F2", amber: "#FFFBEB", indigo: "#EEF2FF",
};
const ICON_COLOR = {
  blue: "#2563EB", purple: "#7C3AED", emerald: "#059669",
  teal: "#0D9488", rose: "#E11D48", amber: "#D97706", indigo: "#4F46E5",
};
const ACCENT_LIGHT = {
  blue: "#DBEAFE", purple: "#EDE9FE", emerald: "#D1FAE5",
  teal: "#CCFBF1", rose: "#FFE4E6", amber: "#FEF3C7", indigo: "#E0E7FF",
};

function getFileIcon(mimeType) {
  if (mimeType?.includes("pdf"))   return <FileText size={14} color="#EF4444" />;
  if (mimeType?.includes("image")) return <Image    size={14} color="#8B5CF6" />;
  if (mimeType?.includes("zip"))   return <FileArchive size={14} color="#F59E0B" />;
  return <File size={14} color="#94A3B8" />;
}

function formatSize(bytes) {
  if (!bytes) return "—";
  const s = ["B","KB","MB","GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return parseFloat((bytes / Math.pow(1024,i)).toFixed(1)) + " " + s[i];
}

/* ── Stat card ── */
function StatCard({ title, value, subtitle, icon: Icon, color = "blue" }) {
  return (
    <div style={{
      background: "#fff",
      border: "1px solid #F1F5F9",
      borderRadius: "16px",
      padding: "20px",
      boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
      display: "flex", flexDirection: "column", gap: "12px",
    }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <span style={{ fontSize:"12px", fontWeight:600, color:"#94A3B8", textTransform:"uppercase", letterSpacing:"0.05em" }}>{title}</span>
        <div style={{ width:36, height:36, borderRadius:10, background: ICON_BG[color], display:"flex", alignItems:"center", justifyContent:"center" }}>
          <Icon size={16} color={ICON_COLOR[color]} />
        </div>
      </div>
      <div>
        <div style={{ fontSize:"28px", fontWeight:700, color:"#0F172A", lineHeight:1 }}>{value}</div>
        {subtitle && <div style={{ fontSize:"12px", color:"#94A3B8", marginTop:4 }}>{subtitle}</div>}
      </div>
    </div>
  );
}

/* ── Tool card ── */
function ToolCard({ tool, onClick }) {
  const [hov, setHov] = useState(false);
  const Icon = tool.icon;
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: hov ? ICON_BG[tool.color] : "#fff",
        border: `1px solid ${hov ? ACCENT_LIGHT[tool.color] : "#F1F5F9"}`,
        borderRadius: "16px",
        padding: "20px",
        cursor: "pointer",
        transition: "all 0.18s ease",
        boxShadow: hov ? "0 4px 16px rgba(0,0,0,0.08)" : "0 1px 3px rgba(0,0,0,0.05)",
        transform: hov ? "translateY(-2px)" : "none",
      }}
    >
      <div style={{ width:44, height:44, borderRadius:12, background: ICON_BG[tool.color], display:"flex", alignItems:"center", justifyContent:"center", marginBottom:14 }}>
        <Icon size={20} color={ICON_COLOR[tool.color]} />
      </div>
      <div style={{ fontSize:"14px", fontWeight:600, color:"#0F172A", marginBottom:4 }}>{tool.title}</div>
      <div style={{ fontSize:"12px", color:"#94A3B8", lineHeight:1.5 }}>{tool.desc}</div>
    </div>
  );
}

/* ── RAG panel ── */
function RAGPanel({ navigate }) {
  return (
    <div style={{
      background: "linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)",
      borderRadius: "20px",
      padding: "28px",
      position: "relative",
      overflow: "hidden",
      height: "100%",
      boxSizing: "border-box",
    }}>
      {/* glow */}
      <div style={{ position:"absolute", top:-40, right:-40, width:160, height:160, borderRadius:"50%", background:"rgba(255,255,255,0.07)", filter:"blur(20px)" }} />
      <div style={{ position:"absolute", bottom:-20, left:-20, width:100, height:100, borderRadius:"50%", background:"rgba(255,255,255,0.05)", filter:"blur(16px)" }} />

      <div style={{ position:"relative" }}>
        {/* header */}
        <div style={{ display:"flex", alignItems:"flex-start", gap:14, marginBottom:20 }}>
          <div style={{ width:48, height:48, borderRadius:14, background:"rgba(255,255,255,0.2)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
            <Brain size={22} color="white" />
          </div>
          <div>
            <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4 }}>
              <span style={{ fontSize:"15px", fontWeight:700, color:"#fff" }}>AI Document Assistant</span>
            </div>
            <span style={{ fontSize:"11px", fontWeight:600, padding:"2px 8px", borderRadius:20, background:"rgba(255,255,255,0.2)", color:"rgba(255,255,255,0.9)" }}>
              RAG Powered
            </span>
          </div>
        </div>

        <p style={{ fontSize:"13px", color:"rgba(255,255,255,0.75)", lineHeight:1.6, marginBottom:20 }}>
          Upload a PDF, DOCX, or TXT — then ask questions in plain language. Answers are drawn strictly from your document using a retrieval-augmented generation pipeline.
        </p>

        {/* steps */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10, marginBottom:22 }}>
          {[
            { icon: Upload,       label:"Upload",  desc:"PDF / DOCX / TXT" },
            { icon: BookOpen,     label:"Index",   desc:"Chunked + embedded" },
            { icon: MessageSquare,label:"Ask",     desc:"Cited answers" },
          ].map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.label} style={{ background:"rgba(255,255,255,0.1)", borderRadius:12, padding:"12px 8px", textAlign:"center" }}>
                <div style={{ width:30, height:30, borderRadius:8, background:"rgba(255,255,255,0.15)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 8px" }}>
                  <Icon size={14} color="white" />
                </div>
                <div style={{ fontSize:"12px", fontWeight:600, color:"#fff", marginBottom:2 }}>{s.label}</div>
                <div style={{ fontSize:"11px", color:"rgba(255,255,255,0.6)" }}>{s.desc}</div>
              </div>
            );
          })}
        </div>

        <button
          onClick={() => navigate("/ai-assistant")}
          style={{
            width:"100%", padding:"13px", borderRadius:12, border:"none", cursor:"pointer",
            background:"rgba(255,255,255,0.95)", color:"#4F46E5",
            fontWeight:700, fontSize:"14px",
            display:"flex", alignItems:"center", justifyContent:"center", gap:8,
            boxShadow:"0 4px 16px rgba(0,0,0,0.2)",
            transition:"all 0.15s ease",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.transform = "scale(1.01)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.95)"; e.currentTarget.style.transform = "scale(1)"; }}
        >
          <Sparkles size={15} />
          Open AI Assistant
        </button>
      </div>
    </div>
  );
}

/* ── Main ── */
export default function Dashboard() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [user,             setUser]             = useState(null);
  const [files,            setFiles]            = useState([]);
  const [loading,          setLoading]          = useState(true);
  const [recentTemplates,  setRecentTemplates]  = useState([]);
  const [activeTab,        setActiveTab]        = useState("dashboard");
  const [stats, setStats] = useState({ documents:0, images:0, templates:0, driveFilesCount:0, totalDriveSize:0 });

  const fetchDriveFiles = async () => {
    const res = await api.get("/drive/files");
    const f = res.data.files || [];
    setFiles(f);
    const sz = f.reduce((s, x) => s + (x.size||0), 0);
    setStats(p => ({ ...p, documents:f.length, images:f.filter(x=>x.mimeType?.includes("image")).length, driveFilesCount:f.length, totalDriveSize:sz }));
  };

  useEffect(() => {
    if (!token) { navigate("/login"); return; }
    (async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams(window.location.search);
        if (params.get("drive_error")) { window.history.replaceState({},"","/"); alert("Google Drive connection failed or was denied."); }
        const userRes = await api.get("/auth/me");
        setUser(userRes.data);
        if (params.get("drive_connected")==="true") window.history.replaceState({},"","/");
        const conn = userRes.data.googleTokens?.access_token && Object.keys(userRes.data.googleTokens).length > 0;
        if (conn) await fetchDriveFiles();
        try { const s = await api.get("/templates/stats/overview"); setStats(p => ({...p, templates: s.data.totalTemplates||0})); } catch {}
        try { const t = await api.get("/templates", {params:{limit:4}}); setRecentTemplates(t.data.templates?.slice(0,4)||[]); } catch {}
      } catch(e){ console.error(e); } finally { setLoading(false); }
    })();
  }, [token, navigate]);

  const handleLogout = () => { localStorage.removeItem("token"); localStorage.removeItem("user"); navigate("/login"); };

  const handleGoogleConnect = async () => {
    try {
      const res = await api.get("/auth/google");
      if (res.data.url) window.location.href = res.data.url;
    } catch(err) {
      if (err.response?.status===401) { alert("Session expired."); localStorage.removeItem("token"); navigate("/login"); }
      else alert("Google connection failed");
    }
  };

  const renameFile = async (id, name) => {
    const n = prompt("New name:", name);
    if (!n || n===name) return;
    await api.put(`/drive/rename-file/${id}`, { newName:n });
    await fetchDriveFiles();
  };

  const deleteFile = async (id, name) => {
    if (!window.confirm(`Delete "${name}"?`)) return;
    await api.delete(`/drive/delete-file/${id}`);
    await fetchDriveFiles();
  };

  if (loading) return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"#F8FAFC" }}>
      <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:16 }}>
        <div style={{ width:48, height:48, borderRadius:14, background:"linear-gradient(135deg,#4F46E5,#7C3AED)", display:"flex", alignItems:"center", justifyContent:"center" }}>
          <FileText size={22} color="white" />
        </div>
        <div style={{ width:24, height:24, borderRadius:"50%", border:"3px solid #4F46E5", borderTopColor:"transparent", animation:"spin 0.7s linear infinite" }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    </div>
  );

  const isGoogleConnected = user?.googleTokens?.access_token && Object.keys(user.googleTokens).length > 0;
  const firstName = user?.name?.split(" ")[0] || "there";

  const ProtectedDriveRoute = ({ children }) => {
    if (!isGoogleConnected) return (
      <div style={{ display:"flex", flexDirection:"column", alignItems:"center", padding:"80px 0" }}>
        <div style={{ width:64, height:64, borderRadius:18, background:"#F1F5F9", display:"flex", alignItems:"center", justifyContent:"center", marginBottom:16 }}>
          <Cloud size={28} color="#94A3B8" />
        </div>
        <div style={{ fontSize:"16px", fontWeight:600, color:"#0F172A", marginBottom:8 }}>Google Drive not connected</div>
        <div style={{ fontSize:"13px", color:"#94A3B8", marginBottom:20 }}>Connect to access your cloud files</div>
        <button onClick={handleGoogleConnect} style={{ background:"linear-gradient(135deg,#4F46E5,#7C3AED)", color:"white", padding:"10px 24px", borderRadius:12, border:"none", cursor:"pointer", fontWeight:600, fontSize:"14px" }}>
          Connect Google Drive
        </button>
      </div>
    );
    return children;
  };

  const DashboardContent = () => (
    <div style={{ display:"flex", flexDirection:"column", gap:28 }}>

      {/* ── Hero banner ── */}
      <div style={{
        background: "linear-gradient(135deg, #4F46E5 0%, #7C3AED 55%, #9333EA 100%)",
        borderRadius: 24,
        padding: "32px 36px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 24,
        flexWrap: "wrap",
        boxShadow: "0 8px 32px rgba(79,70,229,0.3)",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* decorative circles */}
        <div style={{ position:"absolute", top:-30, right:180, width:140, height:140, borderRadius:"50%", background:"rgba(255,255,255,0.06)" }} />
        <div style={{ position:"absolute", bottom:-40, right:60, width:200, height:200, borderRadius:"50%", background:"rgba(255,255,255,0.04)" }} />

        <div style={{ position:"relative" }}>
          <div style={{ display:"inline-flex", alignItems:"center", gap:6, background:"rgba(255,255,255,0.15)", borderRadius:20, padding:"4px 12px", marginBottom:12 }}>
            <Sparkles size={12} color="white" />
            <span style={{ fontSize:"12px", fontWeight:600, color:"white" }}>AI-Powered Document Workspace</span>
          </div>
          <h1 style={{ fontSize:"26px", fontWeight:800, color:"white", margin:"0 0 6px", letterSpacing:"-0.02em" }}>
            Welcome back, {firstName} 👋
          </h1>
          <p style={{ fontSize:"14px", color:"rgba(255,255,255,0.75)", margin:0, maxWidth:440 }}>
            Upload a document and chat with it — or use any tool below to process, convert, and extract.
          </p>
        </div>

        <div style={{ display:"flex", gap:12, flexShrink:0, position:"relative" }}>
          <button
            onClick={() => navigate("/ai-assistant")}
            style={{ display:"inline-flex", alignItems:"center", gap:8, background:"white", color:"#4F46E5", padding:"11px 20px", borderRadius:12, border:"none", cursor:"pointer", fontWeight:700, fontSize:"14px", boxShadow:"0 2px 8px rgba(0,0,0,0.15)", transition:"all 0.15s" }}
            onMouseEnter={e=>{ e.currentTarget.style.transform="translateY(-1px)"; e.currentTarget.style.boxShadow="0 6px 16px rgba(0,0,0,0.2)"; }}
            onMouseLeave={e=>{ e.currentTarget.style.transform="none"; e.currentTarget.style.boxShadow="0 2px 8px rgba(0,0,0,0.15)"; }}
          >
            <Bot size={16} /> Try AI Assistant
          </button>
          <button
            onClick={() => navigate("/text-extractor")}
            style={{ display:"inline-flex", alignItems:"center", gap:8, background:"rgba(255,255,255,0.15)", color:"white", padding:"11px 20px", borderRadius:12, border:"1px solid rgba(255,255,255,0.3)", cursor:"pointer", fontWeight:600, fontSize:"14px", transition:"all 0.15s" }}
            onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,0.25)"}
            onMouseLeave={e=>e.currentTarget.style.background="rgba(255,255,255,0.15)"}
          >
            <UploadCloud size={16} /> Upload Document
          </button>
        </div>
      </div>

      {/* ── Stats ── */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14 }}>
        <StatCard title="Drive Files" value={stats.driveFilesCount} subtitle={formatSize(stats.totalDriveSize)} icon={Database} color="blue" />
        <StatCard title="Templates"   value={stats.templates}        icon={Layers}   color="purple" />
        <StatCard title="Images"      value={stats.images}           icon={Image}    color="emerald" />
        <StatCard title="Documents"   value={stats.documents}        icon={FileText} color="teal" />
      </div>

      {/* ── Google Drive banner ── */}
      {!isGoogleConnected && (
        <div style={{ background:"#EFF6FF", border:"1px solid #DBEAFE", borderRadius:16, padding:"18px 22px", display:"flex", alignItems:"center", justifyContent:"space-between", gap:16 }}>
          <div style={{ display:"flex", alignItems:"center", gap:14 }}>
            <div style={{ width:40, height:40, borderRadius:10, background:"#DBEAFE", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
              <Cloud size={18} color="#2563EB" />
            </div>
            <div>
              <div style={{ fontSize:"14px", fontWeight:600, color:"#1E3A8A" }}>Connect Google Drive</div>
              <div style={{ fontSize:"12px", color:"#3B82F6" }}>Sync and manage all your cloud files directly from DocuGen</div>
            </div>
          </div>
          <button
            onClick={handleGoogleConnect}
            style={{ flexShrink:0, background:"#2563EB", color:"white", padding:"9px 20px", borderRadius:10, border:"none", cursor:"pointer", fontWeight:600, fontSize:"13px", whiteSpace:"nowrap" }}
          >
            Connect Now →
          </button>
        </div>
      )}

      {/* ── Tools + RAG ── */}
      <div>
        <div style={{ display:"flex", alignItems:"baseline", justifyContent:"space-between", marginBottom:16 }}>
          <div>
            <h2 style={{ fontSize:"16px", fontWeight:700, color:"#0F172A", margin:0 }}>Quick Tools</h2>
            <p style={{ fontSize:"12px", color:"#94A3B8", margin:"4px 0 0" }}>Everything you need in one place</p>
          </div>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr", gap:16, alignItems:"start" }}>
          {/* tool grid */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12 }}>
            {TOOLS.map(tool => <ToolCard key={tool.path} tool={tool} onClick={() => navigate(tool.path)} />)}
          </div>
          {/* RAG panel */}
          <RAGPanel navigate={navigate} />
        </div>
      </div>

      {/* ── Recent Templates + Drive Files ── */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>

        {/* Templates */}
        <div style={{ background:"#fff", border:"1px solid #F1F5F9", borderRadius:16, overflow:"hidden", boxShadow:"0 1px 3px rgba(0,0,0,0.05)" }}>
          <div style={{ padding:"18px 22px", borderBottom:"1px solid #F8FAFC", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
            <div>
              <div style={{ fontSize:"14px", fontWeight:600, color:"#0F172A" }}>Recent Templates</div>
              <div style={{ fontSize:"11px", color:"#94A3B8", marginTop:2 }}>Your recently used templates</div>
            </div>
            <button onClick={() => navigate("/templates")} style={{ fontSize:"12px", fontWeight:600, color:"#4F46E5", background:"none", border:"none", cursor:"pointer" }}>View all →</button>
          </div>
          <div style={{ padding:"12px 16px" }}>
            {recentTemplates.length === 0 ? (
              <div style={{ display:"flex", flexDirection:"column", alignItems:"center", padding:"32px 0" }}>
                <div style={{ width:48, height:48, borderRadius:14, background:"#F8FAFC", display:"flex", alignItems:"center", justifyContent:"center", marginBottom:12 }}>
                  <Layers size={20} color="#CBD5E1" />
                </div>
                <div style={{ fontSize:"13px", color:"#94A3B8", marginBottom:10 }}>No templates yet</div>
                <button onClick={() => navigate("/templates")} style={{ fontSize:"12px", fontWeight:600, color:"#4F46E5", background:"none", border:"none", cursor:"pointer" }}>Create your first →</button>
              </div>
            ) : recentTemplates.map(t => (
              <div key={t._id} onClick={() => navigate("/templates")}
                style={{ display:"flex", alignItems:"center", gap:12, padding:"10px 6px", borderRadius:10, cursor:"pointer", transition:"background 0.12s" }}
                onMouseEnter={e=>e.currentTarget.style.background="#F8FAFC"}
                onMouseLeave={e=>e.currentTarget.style.background="transparent"}
              >
                <div style={{ width:36, height:36, borderRadius:10, background:"#EEF2FF", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                  <FileText size={15} color="#4F46E5" />
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:"13px", fontWeight:500, color:"#0F172A", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{t.name}</div>
                  <div style={{ fontSize:"11px", color:"#94A3B8" }}>{t.category || "Uncategorized"}</div>
                </div>
                <ChevronRight size={14} color="#CBD5E1" />
              </div>
            ))}
          </div>
        </div>

        {/* Drive Files */}
        <div style={{ background:"#fff", border:"1px solid #F1F5F9", borderRadius:16, overflow:"hidden", boxShadow:"0 1px 3px rgba(0,0,0,0.05)" }}>
          <div style={{ padding:"18px 22px", borderBottom:"1px solid #F8FAFC", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
            <div>
              <div style={{ fontSize:"14px", fontWeight:600, color:"#0F172A" }}>{isGoogleConnected ? "Recent Drive Files" : "Google Drive"}</div>
              <div style={{ fontSize:"11px", color:"#94A3B8", marginTop:2 }}>{isGoogleConnected ? "Your cloud storage files" : "Not connected yet"}</div>
            </div>
            {isGoogleConnected && <button onClick={() => navigate("/drive-files")} style={{ fontSize:"12px", fontWeight:600, color:"#2563EB", background:"none", border:"none", cursor:"pointer" }}>View all →</button>}
          </div>
          <div style={{ padding:"12px 16px" }}>
            {!isGoogleConnected ? (
              <div style={{ display:"flex", flexDirection:"column", alignItems:"center", padding:"32px 0" }}>
                <div style={{ width:48, height:48, borderRadius:14, background:"#F8FAFC", display:"flex", alignItems:"center", justifyContent:"center", marginBottom:12 }}>
                  <HardDrive size={20} color="#CBD5E1" />
                </div>
                <div style={{ fontSize:"13px", color:"#94A3B8", marginBottom:10 }}>No drive connected</div>
                <button onClick={handleGoogleConnect} style={{ fontSize:"12px", fontWeight:600, color:"#2563EB", background:"#EFF6FF", border:"1px solid #DBEAFE", padding:"5px 14px", borderRadius:8, cursor:"pointer" }}>Connect Drive →</button>
              </div>
            ) : files.length === 0 ? (
              <div style={{ display:"flex", flexDirection:"column", alignItems:"center", padding:"32px 0" }}>
                <HardDrive size={20} color="#CBD5E1" />
                <div style={{ fontSize:"13px", color:"#94A3B8", marginTop:8 }}>No files yet</div>
              </div>
            ) : (
              <>
                {files.slice(0,5).map(file => (
                  <div key={file.id}
                    style={{ display:"flex", alignItems:"center", gap:12, padding:"10px 6px", borderRadius:10, transition:"background 0.12s" }}
                    onMouseEnter={e=>{ e.currentTarget.style.background="#F8FAFC"; e.currentTarget.querySelector(".file-actions").style.opacity="1"; }}
                    onMouseLeave={e=>{ e.currentTarget.style.background="transparent"; e.currentTarget.querySelector(".file-actions").style.opacity="0"; }}
                  >
                    <div style={{ width:36, height:36, borderRadius:10, background:"#F8FAFC", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                      {getFileIcon(file.mimeType)}
                    </div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontSize:"13px", fontWeight:500, color:"#0F172A", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{file.name}</div>
                      <div style={{ fontSize:"11px", color:"#94A3B8" }}>{formatSize(file.size)}</div>
                    </div>
                    <div className="file-actions" style={{ display:"flex", gap:4, opacity:0, transition:"opacity 0.15s" }}>
                      {[
                        { icon: Eye,   fn: ()=>window.open(file.webViewLink,"_blank") },
                        { icon: Edit2, fn: ()=>renameFile(file.id, file.name) },
                        { icon: Trash2,fn: ()=>deleteFile(file.id, file.name), danger:true },
                      ].map(({icon:Ic, fn, danger},i)=>(
                        <button key={i} onClick={fn}
                          style={{ padding:"5px", borderRadius:7, background:"none", border:"none", cursor:"pointer", transition:"background 0.1s" }}
                          onMouseEnter={e=>e.currentTarget.style.background= danger?"#FEE2E2":"#F1F5F9"}
                          onMouseLeave={e=>e.currentTarget.style.background="none"}
                        >
                          <Ic size={13} color={danger?"#EF4444":"#94A3B8"} />
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
                {files.length > 5 && (
                  <button onClick={() => navigate("/drive-files")} style={{ width:"100%", textAlign:"center", fontSize:"12px", fontWeight:600, color:"#2563EB", background:"none", border:"none", cursor:"pointer", padding:"10px 0 2px" }}>
                    View all {files.length} files →
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight:"100vh", background:"#F8FAFC", fontFamily:"'Inter',sans-serif" }}>

      {/* ── Nav ── */}
      <div style={{
        position:"sticky", top:0, zIndex:10,
        background:"rgba(255,255,255,0.85)", backdropFilter:"blur(12px)",
        borderBottom:"1px solid #F1F5F9",
      }}>
        <div style={{ maxWidth:1280, margin:"0 auto", padding:"0 24px", height:56, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          {/* Logo */}
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ width:32, height:32, borderRadius:9, background:"linear-gradient(135deg,#4F46E5,#7C3AED)", display:"flex", alignItems:"center", justifyContent:"center" }}>
              <FileText size={15} color="white" />
            </div>
            <span style={{ fontWeight:800, fontSize:"15px", color:"#0F172A", letterSpacing:"-0.01em" }}>DocuGen</span>
          </div>

          {/* Nav tabs */}
          <div style={{ display:"flex", alignItems:"center", gap:2 }}>
            {[
              { label:"Dashboard", tab:"dashboard", path:"/" },
              { label:"Templates", tab:"templates", path:"/templates" },
              { label:"My Documents", tab:"documents", path:"/my-documents" },
              ...(isGoogleConnected ? [{ label:"Drive Files", tab:"drive", path:"/drive-files" }] : []),
            ].map(item => (
              <button key={item.tab} onClick={() => { setActiveTab(item.tab); navigate(item.path); }}
                style={{
                  padding:"6px 14px", borderRadius:8, fontSize:"13px", fontWeight:500, border:"none", cursor:"pointer", transition:"all 0.12s",
                  background: activeTab===item.tab ? "#EEF2FF" : "none",
                  color:      activeTab===item.tab ? "#4F46E5"  : "#64748B",
                }}
              >{item.label}</button>
            ))}
          </div>

          {/* User + logout */}
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ display:"flex", alignItems:"center", gap:8, padding:"5px 12px", borderRadius:10, background:"#F8FAFC", border:"1px solid #F1F5F9" }}>
              <div style={{ width:7, height:7, borderRadius:"50%", background:"#22C55E" }} />
              <span style={{ fontSize:"12px", fontWeight:500, color:"#475569" }}>{firstName}</span>
            </div>
            <button onClick={handleLogout}
              style={{ width:34, height:34, borderRadius:9, background:"#F8FAFC", border:"1px solid #F1F5F9", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", transition:"all 0.12s" }}
              onMouseEnter={e=>{ e.currentTarget.style.background="#FEE2E2"; e.currentTarget.style.borderColor="#FECACA"; }}
              onMouseLeave={e=>{ e.currentTarget.style.background="#F8FAFC"; e.currentTarget.style.borderColor="#F1F5F9"; }}
            >
              <LogOut size={14} color="#64748B" />
            </button>
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div style={{ maxWidth:1280, margin:"0 auto", padding:"28px 24px" }}>
        <Routes>
          <Route path="/" element={<DashboardContent />} />
          <Route path="/drive-files" element={<ProtectedDriveRoute><DriveFiles /></ProtectedDriveRoute>} />
        </Routes>
      </div>
    </div>
  );
} 