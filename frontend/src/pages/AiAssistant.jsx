// frontend/src/pages/AiAssistant.jsx
import { useState, useRef, useEffect } from "react";
import api from "../services/api";
import SidebarLayout from "./SidebarLayout";
import {
  Upload, Send, Trash2, FileText, Bot, User,
  Loader2, AlertCircle, CheckCircle2, X, ChevronDown,
} from "lucide-react";

// ─── Small Components ─────────────────────────────────────────────────────────
function StatusBadge({ session }) {
  if (!session?.hasDocument) {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-500">
        <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
        No document loaded
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
      <CheckCircle2 size={12} />
      {session.filename}
    </span>
  );
}

function ChatBubble({ msg }) {
  const isUser = msg.role === "user";
  return (
    <div className={`flex gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
      <div
        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
          isUser
            ? "bg-indigo-600 text-white"
            : "bg-gradient-to-br from-purple-500 to-indigo-600 text-white"
        }`}
      >
        {isUser ? <User size={15} /> : <Bot size={15} />}
      </div>
      <div
        className={`max-w-[78%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap shadow-sm ${
          isUser
            ? "bg-indigo-600 text-white rounded-tr-sm"
            : "bg-white text-slate-800 rounded-tl-sm border border-slate-100"
        }`}
      >
        {msg.content}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function AiAssistant() {
  const [session, setSession] = useState(null);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hello! I'm your AI document assistant 🤖\n\nUpload a PDF, DOCX, or TXT file above, then ask me anything about its contents. I'll answer based only on what's in your document.",
    },
  ]);
  const [question, setQuestion] = useState("");
  const [uploading, setUploading] = useState(false);
  const [asking, setAsking] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [dragOver, setDragOver] = useState(false);

  const fileInputRef = useRef(null);
  const chatEndRef = useRef(null);
  const textareaRef = useRef(null);

  const token = localStorage.getItem("token");

  // Fetch existing session on mount
  useEffect(() => {
    fetchStatus();
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function fetchStatus() {
    try {
      const res = await api.get("/ai/status", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSession(res.data);
    } catch {
      setSession({ hasDocument: false });
    }
  }

  async function handleFileUpload(file) {
    if (!file) return;

    const allowed = ["application/pdf", "text/plain",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
    if (!allowed.includes(file.type)) {
      setUploadError("Only PDF, TXT, and DOCX files are supported.");
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      setUploadError("File must be under 20MB.");
      return;
    }

    setUploadError("");
    setUploading(true);

    const formData = new FormData();
    formData.append("document", file);

    try {
      const res = await api.post("/ai/upload", formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      await fetchStatus();

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `✅ Document loaded: **${res.data.filename}**\n\n${res.data.chunks} sections indexed from ${(res.data.charCount / 1000).toFixed(1)}k characters.\n\nWhat would you like to know about this document?`,
        },
      ]);
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to process document.";
      setUploadError(msg);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleAsk() {
    const q = question.trim();
    if (!q || asking) return;

    if (!session?.hasDocument) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "⚠️ Please upload a document first before asking questions.",
        },
      ]);
      return;
    }

    setMessages((prev) => [...prev, { role: "user", content: q }]);
    setQuestion("");
    setAsking(true);

    try {
      const res = await api.post(
        "/ai/ask",
        { question: q },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: res.data.answer },
      ]);
    } catch (err) {
      const msg =
        err.response?.data?.message || "Something went wrong. Please try again.";
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: `❌ ${msg}` },
      ]);
    } finally {
      setAsking(false);
      setTimeout(() => textareaRef.current?.focus(), 100);
    }
  }

  async function handleClear() {
    try {
      await api.delete("/ai/clear", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSession({ hasDocument: false });
      setMessages([
        {
          role: "assistant",
          content:
            "Session cleared. Upload a new document to get started again.",
        },
      ]);
    } catch {
      // ignore
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleAsk();
    }
  }

  function handleDrop(e) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileUpload(file);
  }

  return (
    <SidebarLayout>
      <div className="flex flex-col h-full max-h-screen bg-slate-50">
        {/* ── Header ── */}
        <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between flex-shrink-0">
          <div>
            <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <Bot className="text-indigo-600" size={22} />
              AI Document Assistant
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Upload a document and ask questions — powered by Gemini 1.5 Flash
            </p>
          </div>
          <StatusBadge session={session} />
        </div>

        {/* ── Upload Zone ── */}
        <div className="px-6 pt-4 pb-2 flex-shrink-0">
          <div
            className={`relative border-2 border-dashed rounded-xl p-5 transition-all cursor-pointer ${
              dragOver
                ? "border-indigo-400 bg-indigo-50"
                : "border-slate-200 bg-white hover:border-indigo-300 hover:bg-indigo-50/30"
            }`}
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.txt,.docx"
              className="hidden"
              onChange={(e) => handleFileUpload(e.target.files[0])}
            />

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center flex-shrink-0">
                {uploading ? (
                  <Loader2 className="text-indigo-500 animate-spin" size={22} />
                ) : (
                  <Upload className="text-indigo-500" size={22} />
                )}
              </div>
              <div className="flex-1 min-w-0">
                {uploading ? (
                  <p className="font-medium text-indigo-600">Processing document…</p>
                ) : session?.hasDocument ? (
                  <>
                    <p className="font-medium text-slate-700 truncate">
                      {session.filename}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {session.chunks} sections · Click to replace
                    </p>
                  </>
                ) : (
                  <>
                    <p className="font-medium text-slate-700">
                      Drop your document here or{" "}
                      <span className="text-indigo-600">browse</span>
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      PDF, DOCX, or TXT · Max 20MB
                    </p>
                  </>
                )}
              </div>

              {session?.hasDocument && !uploading && (
                <button
                  onClick={(e) => { e.stopPropagation(); handleClear(); }}
                  className="flex-shrink-0 p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                  title="Clear document"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>

            {uploadError && (
              <div className="mt-3 flex items-center gap-2 text-red-600 text-sm bg-red-50 px-3 py-2 rounded-lg">
                <AlertCircle size={14} />
                {uploadError}
                <button
                  className="ml-auto"
                  onClick={(e) => { e.stopPropagation(); setUploadError(""); }}
                >
                  <X size={14} />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ── Chat Messages ── */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 min-h-0">
          {messages.map((msg, i) => (
            <ChatBubble key={i} msg={msg} />
          ))}

          {asking && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
                <Bot size={15} className="text-white" />
              </div>
              <div className="bg-white border border-slate-100 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
                <div className="flex gap-1 items-center h-5">
                  <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* ── Input Bar ── */}
        <div className="bg-white border-t border-slate-200 px-6 py-4 flex-shrink-0">
          <div className="flex gap-3 items-end">
            <div className="flex-1 relative">
              <textarea
                ref={textareaRef}
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={
                  session?.hasDocument
                    ? "Ask anything about your document… (Enter to send)"
                    : "Upload a document above to start chatting…"
                }
                disabled={!session?.hasDocument || asking}
                rows={1}
                className="w-full resize-none px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent text-sm text-slate-800 placeholder-slate-400 disabled:bg-slate-50 disabled:text-slate-400 transition-all"
                style={{ maxHeight: "120px", overflowY: "auto" }}
                onInput={(e) => {
                  e.target.style.height = "auto";
                  e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
                }}
              />
            </div>
            <button
              onClick={handleAsk}
              disabled={!question.trim() || !session?.hasDocument || asking}
              className="w-11 h-11 rounded-xl bg-indigo-600 text-white flex items-center justify-center hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400 transition-all flex-shrink-0 shadow-sm"
              title="Send (Enter)"
            >
              {asking ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Send size={18} />
              )}
            </button>
          </div>
          <p className="text-xs text-slate-400 mt-2 text-center">
            Answers are based only on your uploaded document · Powered by Gemini 1.5 Flash (free)
          </p>
        </div>
      </div>
    </SidebarLayout>
  );
}
