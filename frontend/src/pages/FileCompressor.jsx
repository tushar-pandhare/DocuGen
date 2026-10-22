import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from '../services/api';
import { pollJob } from '../services/jobService';
import {
  Upload, FileText, Settings, Loader2, CloudUpload, Trash2, ArrowLeft, Sparkles, CheckCircle, Check
} from "lucide-react";

export default function FileCompressor() {
  const navigate = useNavigate();
  const [files, setFiles] = useState([]);
  const [compressedFiles, setCompressedFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [jobProgress, setJobProgress] = useState(0);
  const [jobState, setJobState] = useState("");
  const [quality, setQuality] = useState(70);
  const [showSettings, setShowSettings] = useState(false);
  const [uploadToDrive, setUploadToDrive] = useState(false);

  const handleSelect = (e) => {
    const selected = Array.from(e.target.files);
    setFiles(prev => [...prev, ...selected]);
  };

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const clearAll = () => {
    setFiles([]);
    setCompressedFiles([]);
  };

  const formatSize = (bytes) => {
    if (!bytes) return "0 Bytes";
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return parseFloat((bytes / Math.pow(1024, i)).toFixed(2)) + " " + sizes[i];
  };

  const totalSize = files.reduce((sum, f) => sum + f.size, 0);
  const estimatedCompressedSize = totalSize * (quality / 100);

  const handleCompress = async () => {
    if (!files.length) return;
    setLoading(true);
    setJobProgress(0);
    setJobState("queuing");
    const formData = new FormData();
    files.forEach(f => formData.append("files", f));
    formData.append("quality", quality);
    formData.append("uploadToDrive", uploadToDrive);
    try {
      const enqueueRes = await api.post("/compress", formData, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      const { jobId, queue } = enqueueRes.data;
      const result = await pollJob(jobId, queue, {
        onProgress: p => setJobProgress(p),
        onStateChange: s => setJobState(s)
      });
      setCompressedFiles(result.files);
      if (uploadToDrive) {
        alert(`${result.files.length} files uploaded to Google Drive!`);
      } else {
        // trigger download of each file
        result.files.forEach(f => {
          const a = document.createElement("a");
          a.href = f.download;
          a.download = f.name;
          a.click();
        });
        alert("Files compressed and downloaded successfully!");
      }
    } catch (err) {
      alert(err.message || "Compression failed");
    } finally {
      setLoading(false);
      setJobState("");
    }
  };

  const stats = {
    totalFiles: files.length,
    totalSize: formatSize(totalSize),
    estimatedSize: formatSize(estimatedCompressedSize),
    savings: totalSize > 0 ? Math.round(100 - quality) : 0
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button onClick={() => navigate('/')}
            className="flex items-center gap-2 text-slate-500 hover:text-slate-700 transition group">
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition" /> Back to Dashboard
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-cyan-100 rounded-lg flex items-center justify-center">
              <FileText size={16} className="text-cyan-600" />
            </div>
            <span className="text-sm font-medium text-slate-600">File Compressor</span>
          </div>
        </div>
        {/* Hero */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-500 px-5 py-2 rounded-full mb-5 shadow-sm">
            <Sparkles size={14} className="text-white" />
            <span className="text-xs font-medium text-white">Smart Compression</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-800 mb-3">
            File <span className="bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">Compressor</span>
          </h1>
          <p className="text-slate-500 max-w-2xl mx-auto">Reduce file size while maintaining quality with intelligent compression</p>
        </div>
        {/* Upload Section */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
          <div className="bg-gradient-to-r from-cyan-600 to-blue-600 px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <Upload size={20} className="text-white" />
              </div>
              <div>
                <h2 className="text-white font-semibold">Upload Files</h2>
                <p className="text-cyan-100 text-xs">Select images or PDFs to compress</p>
              </div>
            </div>
          </div>
          <div className="p-6">
            <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center hover:border-cyan-400 transition-all cursor-pointer bg-slate-50 hover:bg-cyan-50/30"
              onClick={() => document.getElementById('compress-upload')?.click()}>
              <input type="file" multiple onChange={handleSelect} className="hidden" id="compress-upload" />
              <div className="w-20 h-20 mx-auto bg-cyan-100 rounded-2xl flex items-center justify-center mb-4">
                <Upload size={32} className="text-cyan-600" />
              </div>
              <p className="text-cyan-600 font-semibold">Click to select files</p>
              <p className="text-xs text-slate-400 mt-2">PNG, JPG, PDF up to 20MB</p>
            </div>
            {files.length > 0 && (
              <div className="mt-4 p-3 bg-cyan-50 rounded-xl flex items-center gap-3 border border-cyan-100">
                <FileText size={20} className="text-cyan-600" />
                <span className="text-sm text-slate-700 truncate flex-1 font-medium">{files.map(f => f.name).join(', ')}</span>
                <span className="text-xs text-cyan-600 bg-cyan-100 px-2 py-1 rounded-full">{(totalSize/1024/1024).toFixed(2)} MB</span>
              </div>
            )}
            {/* Settings */}
            <button onClick={() => setShowSettings(!showSettings)}
              className="mt-4 w-full flex items-center justify-center gap-2 text-sm text-slate-500 hover:text-slate-700 py-2 rounded-lg hover:bg-slate-50 transition">
              <Settings size={14} /> {showSettings ? "Hide Settings" : "Show Settings"}
            </button>
            {showSettings && (
              <div className="mt-2 space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-slate-600">Quality (%)</label>
                  <input type="range" min="10" max="100" value={quality} onChange={e => setQuality(parseInt(e.target.value))}
                    className="w-48" />
                  <span className="text-sm text-slate-600">{quality}</span>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" checked={uploadToDrive} onChange={e => setUploadToDrive(e.target.checked)} id="upload-drive" />
                  <label htmlFor="upload-drive" className="text-sm text-slate-600">Upload compressed files to Google Drive</label>
                </div>
              </div>
            )}
            <button onClick={handleCompress} disabled={!files.length || loading}
              className="w-full mt-6 bg-gradient-to-r from-cyan-600 to-blue-600 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 hover:shadow-lg hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  {jobState === "active" ? `Compressing… ${jobProgress}%` : "Queuing job…"}
                </>
              ) : (
                <>
                  <Sparkles size={18} /> Compress Files
                </>
              )}
            </button>
            {loading && (
              <div className="mt-3">
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div className="h-2 bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-500"
                    style={{ width: `${jobProgress}%` }} />
                </div>
                <p className="text-xs text-slate-400 mt-1 text-center capitalize">{jobState} — {jobProgress}%</p>
              </div>
            )}
          </div>
        </div>
        {/* Stats */}
        <div className="mt-8 grid grid-cols-2 gap-4">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
            <p className="text-sm font-medium text-slate-600">Total Files</p>
            <p className="text-xl font-bold text-cyan-600">{stats.totalFiles}</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
            <p className="text-sm font-medium text-slate-600">Total Size</p>
            <p className="text-xl font-bold text-cyan-600">{stats.totalSize}</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
            <p className="text-sm font-medium text-slate-600">Est. Compressed Size</p>
            <p className="text-xl font-bold text-cyan-600">{stats.estimatedSize}</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
            <p className="text-sm font-medium text-slate-600">Potential Savings</p>
            <p className="text-xl font-bold text-cyan-600">{stats.savings}%</p>
          </div>
        </div>
      </div>
    </div>
  );
}
