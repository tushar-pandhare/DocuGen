// import { useEffect, useState } from "react";
// import axios from "axios";
// import { useNavigate } from "react-router-dom";
// import { Home, Pencil, Check, X, FileText } from "lucide-react";

// export default function DriveFiles() {
//   const token = localStorage.getItem("token");
//   const navigate = useNavigate();

//   const [files, setFiles] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [editingId, setEditingId] = useState(null);
//   const [newName, setNewName] = useState("");

//   /* ================= FETCH FILES ================= */
//   useEffect(() => {
//     if (!token) {
//       navigate("/login");
//       return;
//     }

//     const fetchFiles = async () => {
//       try {
//         const res = await axios.get(
//           "http://localhost:5000/api/invoice/drive-files",
//           {
//             headers: {
//               Authorization: `Bearer ${token}`,
//             },
//           }
//         );

//         setFiles(res.data);
//       } catch (err) {
//         alert("Failed to load Drive files");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchFiles();
//   }, [token, navigate]);

//   /* ================= RENAME FILE ================= */
//   const handleRename = async (fileId) => {
//     if (!newName.trim()) {
//       alert("File name cannot be empty");
//       return;
//     }

//     try {
//       await axios.put(
//         `http://localhost:5000/api/invoice/rename-file/${fileId}`,
//         { newName },
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         }
//       );

//       // update UI instantly
//       setFiles((prev) =>
//         prev.map((file) =>
//           file.id === fileId ? { ...file, name: newName } : file
//         )
//       );

//       setEditingId(null);
//       setNewName("");
//     } catch (err) {
//       alert("Rename failed");
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gray-100 p-10">
//       {/* ================= HEADER ================= */}
//       <div className="max-w-5xl mx-auto mb-8 flex justify-between items-center">
//         <h1 className="text-2xl font-bold text-gray-800">
//           Google Drive Files
//         </h1>

//         <button
//           onClick={() => navigate("/")}
//           className="flex items-center gap-2 px-4 py-2 bg-white border rounded-lg hover:bg-gray-50 transition"
//         >
//           <Home size={16} />
//           Home
//         </button>
//       </div>

//       {/* ================= MAIN CARD ================= */}
//       <div className="max-w-5xl mx-auto bg-white shadow-2xl rounded-2xl p-8">
//         {loading ? (
//           <p className="text-gray-500">Loading files...</p>
//         ) : files.length === 0 ? (
//           <div className="text-center text-gray-500">
//             <FileText size={40} className="mx-auto mb-3 opacity-40" />
//             <p>No files found in DocuGen folder.</p>
//           </div>
//         ) : (
//           <div className="space-y-4">
//             {files.map((file) => (
//               <div
//                 key={file.id}
//                 className="flex justify-between items-center border p-4 rounded-xl hover:bg-gray-50 transition"
//               >
//                 {/* LEFT SIDE */}
//                 <div className="flex-1">
//                   {editingId === file.id ? (
//                     <input
//                       type="text"
//                       value={newName}
//                       onChange={(e) => setNewName(e.target.value)}
//                       className="border px-3 py-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-black"
//                     />
//                   ) : (
//                     <>
//                       <p className="font-semibold text-gray-800">
//                         {file.name}
//                       </p>
//                       <p className="text-xs text-gray-400">
//                         {file.createdTime
//                           ? new Date(file.createdTime).toLocaleString()
//                           : ""}
//                       </p>
//                     </>
//                   )}
//                 </div>

//                 {/* RIGHT SIDE ACTIONS */}
//                 <div className="flex gap-3 ml-6">
//                   {editingId === file.id ? (
//                     <>
//                       <button
//                         onClick={() => handleRename(file.id)}
//                         className="flex items-center gap-1 bg-green-600 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-green-700 transition"
//                       >
//                         <Check size={14} />
//                         Save
//                       </button>

//                       <button
//                         onClick={() => {
//                           setEditingId(null);
//                           setNewName("");
//                         }}
//                         className="flex items-center gap-1 bg-gray-300 px-3 py-1.5 rounded-lg text-sm hover:bg-gray-400 transition"
//                       >
//                         <X size={14} />
//                         Cancel
//                       </button>
//                     </>
//                   ) : (
//                     <>
//                       <a
//                         href={file.webViewLink}
//                         target="_blank"
//                         rel="noopener noreferrer"
//                         className="bg-black text-white px-3 py-1.5 rounded-lg text-sm hover:bg-gray-900 transition"
//                       >
//                         View
//                       </a>

//                       <button
//                         onClick={() => {
//                           setEditingId(file.id);
//                           setNewName(file.name);
//                         }}
//                         className="flex items-center gap-1 bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-blue-700 transition"
//                       >
//                         <Pencil size={14} />
//                         Rename
//                       </button>
//                     </>
//                   )}
//                 </div>
//               </div>
//             ))}
//           </div>
//         )}
//       </div>

//       {/* FOOTER */}
//       <p className="text-center text-xs text-gray-400 mt-8">
//         Google Drive Integration • MERN Stack • Secure JWT Auth
//       </p>
//     </div>
//   );
// }
// pages/DriveFiles.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { 
  Folder, ExternalLink, Search, ArrowLeft, 
  FileText, Image, File, FileArchive, Edit2, 
  Trash2, Eye, Download, Calendar, HardDrive,
  Sparkles, Grid, List, RefreshCw, Database,
  PieChart, TrendingUp, Clock, CheckCircle, XCircle
} from 'lucide-react';

export default function DriveFiles() {
  const navigate = useNavigate();
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [refreshing, setRefreshing] = useState(false);
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    try {
      setLoading(true);
      const res = await axios.get('http://localhost:5000/api/drive/files', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFiles(res.data.files || []);
    } catch (err) {
      console.error('Fetch files error:', err);
      alert('Failed to load files');
    } finally {
      setLoading(false);
    }
  };

  const refreshFiles = async () => {
    setRefreshing(true);
    await fetchFiles();
    setRefreshing(false);
  };

  const renameFile = async (fileId, currentName) => {
    const newName = prompt('Enter new file name:', currentName);
    if (newName && newName.trim() && newName !== currentName) {
      try {
        await axios.put(
          `http://localhost:5000/api/drive/rename-file/${fileId}`,
          { newName: newName.trim() },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        fetchFiles();
      } catch (err) {
        alert('Failed to rename file');
      }
    }
  };

  const deleteFile = async (fileId, fileName) => {
    if (confirm(`Delete "${fileName}"? This action cannot be undone.`)) {
      try {
        await axios.delete(
          `http://localhost:5000/api/drive/delete-file/${fileId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        fetchFiles();
      } catch (err) {
        alert('Failed to delete file');
      }
    }
  };

  const getFileIcon = (mimeType, size = 20) => {
    if (mimeType?.includes('pdf')) return <FileText size={size} className="text-red-500" />;
    if (mimeType?.includes('image')) return <Image size={size} className="text-purple-500" />;
    if (mimeType?.includes('zip')) return <FileArchive size={size} className="text-amber-500" />;
    if (mimeType?.includes('text')) return <FileText size={size} className="text-blue-500" />;
    return <File size={size} className="text-slate-500" />;
  };

  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return '0 Bytes';
    if (bytes === undefined || bytes === null) return '0 Bytes';
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return parseFloat((bytes / Math.pow(1024, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileTypeColor = (mimeType) => {
    if (mimeType?.includes('pdf')) return 'border-red-200 bg-red-50';
    if (mimeType?.includes('image')) return 'border-purple-200 bg-purple-50';
    if (mimeType?.includes('zip')) return 'border-amber-200 bg-amber-50';
    return 'border-slate-200 bg-slate-50';
  };

  const filteredFiles = files.filter(file => 
    file.name?.toLowerCase().includes(search.toLowerCase())
  );

  const totalSize = files.reduce((sum, file) => sum + (parseInt(file.size) || 0), 0);
  const pdfCount = files.filter(f => f.mimeType?.includes('pdf')).length;
  const imageCount = files.filter(f => f.mimeType?.includes('image')).length;
  const otherCount = files.length - pdfCount - imageCount;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
          <button 
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-slate-500 hover:text-slate-700 transition group w-fit"
          >
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition" />
            Back to Dashboard
          </button>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                <Folder size={16} className="text-amber-600" />
              </div>
              <span className="text-sm font-medium text-slate-600">Drive Files</span>
            </div>
            
            <button
              onClick={refreshFiles}
              disabled={refreshing}
              className="p-2 text-slate-500 hover:text-indigo-600 rounded-xl hover:bg-indigo-50 transition"
              title="Refresh"
            >
              <RefreshCw size={18} className={refreshing ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>

        {/* Hero Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 px-5 py-2 rounded-full mb-5 shadow-sm">
            <Sparkles size={14} className="text-white" />
            <span className="text-xs font-medium text-white">Google Drive Integration</span>
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-800 mb-3">
            My <span className="bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">Drive Files</span>
          </h1>
          <p className="text-slate-500 max-w-2xl mx-auto text-sm sm:text-base">
            Manage all your files stored in the DocuGen folder on Google Drive
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 hover:shadow-md transition group">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center group-hover:scale-110 transition">
                <Folder size={20} className="text-amber-500" />
              </div>
              <span className="text-2xl font-bold text-slate-800">{files.length}</span>
            </div>
            <p className="text-slate-500 text-sm">Total Files</p>
          </div>
          
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 hover:shadow-md transition group">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center group-hover:scale-110 transition">
                <HardDrive size={20} className="text-blue-500" />
              </div>
              <span className="text-2xl font-bold text-slate-800">{formatFileSize(totalSize)}</span>
            </div>
            <p className="text-slate-500 text-sm">Total Size</p>
          </div>
          
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 hover:shadow-md transition group">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center group-hover:scale-110 transition">
                <FileText size={20} className="text-red-500" />
              </div>
              <span className="text-2xl font-bold text-slate-800">{pdfCount}</span>
            </div>
            <p className="text-slate-500 text-sm">PDF Files</p>
          </div>
          
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 hover:shadow-md transition group">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center group-hover:scale-110 transition">
                <Image size={20} className="text-purple-500" />
              </div>
              <span className="text-2xl font-bold text-slate-800">{imageCount}</span>
            </div>
            <p className="text-slate-500 text-sm">Image Files</p>
          </div>
        </div>

        {/* Search and View Options */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Search files by name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2.5 rounded-xl transition ${viewMode === 'grid' ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
              >
                <Grid size={18} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2.5 rounded-xl transition ${viewMode === 'list' ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
              >
                <List size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Files Display */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-amber-200 border-t-amber-600"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Folder className="text-amber-400 animate-pulse" size={24} />
              </div>
            </div>
          </div>
        ) : filteredFiles.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
            <div className="w-20 h-20 bg-slate-100 rounded-3xl flex items-center justify-center mx-auto mb-4">
              <Folder size={36} className="text-slate-300" />
            </div>
            <p className="text-slate-500 font-medium">No files found</p>
            <p className="text-slate-400 text-sm mt-1">
              {search ? 'Try a different search term' : 'Upload files to see them here'}
            </p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredFiles.map((file) => (
              <div
                key={file.id}
                className={`bg-white rounded-2xl border ${getFileTypeColor(file.mimeType)} hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group overflow-hidden`}
              >
                <div className="relative h-32 bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                  {getFileIcon(file.mimeType, 40)}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                    <button
                      onClick={() => window.open(file.webViewLink, "_blank")}
                      className="p-2 bg-white rounded-lg hover:bg-gray-100 transition shadow-md"
                      title="View"
                    >
                      <Eye size={16} className="text-indigo-600" />
                    </button>
                    <button
                      onClick={() => renameFile(file.id, file.name)}
                      className="p-2 bg-white rounded-lg hover:bg-gray-100 transition shadow-md"
                      title="Rename"
                    >
                      <Edit2 size={16} className="text-emerald-600" />
                    </button>
                    <button
                      onClick={() => deleteFile(file.id, file.name)}
                      className="p-2 bg-white rounded-lg hover:bg-gray-100 transition shadow-md"
                      title="Delete"
                    >
                      <Trash2 size={16} className="text-red-600" />
                    </button>
                  </div>
                </div>
                
                <div className="p-4">
                  <p className="font-semibold text-slate-800 truncate text-sm">{file.name}</p>
                  <div className="flex items-center justify-between mt-2 text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <HardDrive size={10} />
                      {formatFileSize(file.size)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar size={10} />
                      {new Date(file.modifiedTime || file.createdTime).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="divide-y divide-slate-100">
              {filteredFiles.map((file) => (
                <div key={file.id} className="px-4 sm:px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition group">
                  <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                    <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      {getFileIcon(file.mimeType, 18)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-800 truncate text-sm sm:text-base">{file.name}</p>
                      <div className="flex flex-wrap items-center gap-3 mt-1">
                        <span className="text-xs text-slate-400 flex items-center gap-1">
                          <HardDrive size={10} />
                          {formatFileSize(file.size)}
                        </span>
                        <span className="text-xs text-slate-400 flex items-center gap-1">
                          <Calendar size={10} />
                          {new Date(file.modifiedTime || file.createdTime).toLocaleDateString()}
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
                          {file.mimeType?.split('/')[1]?.toUpperCase() || 'FILE'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 ml-4">
                    <button 
                      onClick={() => window.open(file.webViewLink, "_blank")}
                      className="p-2 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-indigo-50 transition"
                      title="View"
                    >
                      <Eye size={16} />
                    </button>
                    <button 
                      onClick={() => renameFile(file.id, file.name)}
                      className="p-2 text-slate-400 hover:text-emerald-600 rounded-lg hover:bg-emerald-50 transition"
                      title="Rename"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button 
                      onClick={() => deleteFile(file.id, file.name)}
                      className="p-2 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 text-center">
          <button
            onClick={() => window.open("https://drive.google.com", "_blank")}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-indigo-600 hover:bg-indigo-50 hover:border-indigo-200 transition shadow-sm"
          >
            <ExternalLink size={16} />
            Open Google Drive
          </button>
        </div>
      </div>
    </div>
  );
}