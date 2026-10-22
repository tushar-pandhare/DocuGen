// frontend/src/pages/PipelineBuilder.jsx
// Drag-and-drop pipeline builder page.
// Users pick processors from the left palette, drag them into a sequenced
// list, upload a file, then click "Run Pipeline" to submit the job chain.

import { useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, ScanLine, FileImage, Archive, Receipt,
  Upload, Trash2, Play, Plus, GripVertical, Sparkles,
  ChevronRight, X, FileText, File,
} from "lucide-react";

import api from "../services/api";
import { runPipeline } from "../services/jobService";
import StepCard from "../components/StepCard";
import PipelineProgress from "../components/PipelineProgress";

// ── Available processors palette ────────────────────────────────────────────
const PROCESSORS = [
  {
    type: "ocr",
    label: "OCR",
    desc: "Extract text from images & PDFs",
    icon: ScanLine,
    bg: "#EEF2FF",
    iconColor: "#4F46E5",
    border: "#C7D2FE",
  },
  {
    type: "pdfToImage",
    label: "PDF → Image",
    desc: "Convert PDF pages to JPEG/PNG",
    icon: FileImage,
    bg: "#F0FDFA",
    iconColor: "#0D9488",
    border: "#99F6E4",
  },
  {
    type: "compress",
    label: "Compress",
    desc: "Shrink file size without quality loss",
    icon: Archive,
    bg: "#FFF1F2",
    iconColor: "#E11D48",
    border: "#FECDD3",
  },
  {
    type: "invoice",
    label: "Invoice",
    desc: "Generate a professional invoice PDF",
    icon: Receipt,
    bg: "#FFFBEB",
    iconColor: "#D97706",
    border: "#FDE68A",
  },
];

// ── Drag-and-drop helpers ────────────────────────────────────────────────────
// We use native HTML5 drag events (no extra library needed).

export default function PipelineBuilder() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  // ── Pipeline state ─────────────────────────────────────────────────────────
  const [pipelineSteps, setPipelineSteps] = useState([]); // array of step type strings
  const [file, setFile] = useState(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false); // drop-zone highlight
  const [draggingPaletteType, setDraggingPaletteType] = useState(null); // type being dragged from palette
  const [draggingStepIndex, setDraggingStepIndex] = useState(null); // index being reordered
  const [dropTargetIndex, setDropTargetIndex] = useState(null); // highlight target slot
  const fileInputRef = useRef(null);

  // ── Progress modal ──────────────────────────────────────────────────────────
  const [showProgress, setShowProgress] = useState(false);
  const [progressSteps, setProgressSteps] = useState([]);
  const [pipelineId, setPipelineId] = useState(null);
  const [running, setRunning] = useState(false);
  const [toast, setToast] = useState(null); // { type: "success"|"error", message }

  // ── Toast helper ────────────────────────────────────────────────────────────
  const showToast = useCallback((type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  }, []);

  // ── File handling ───────────────────────────────────────────────────────────
  const handleFileSelect = (e) => {
    const f = e.target.files[0];
    if (f) setFile(f);
  };

  const handleFileDrop = (e) => {
    e.preventDefault();
    setIsDraggingOver(false);
    const f = e.dataTransfer.files[0];
    if (f) setFile(f);
  };

  const handleFileDragOver = (e) => {
    e.preventDefault();
    // Only highlight if dragging a file (not a palette card)
    if (!draggingPaletteType) setIsDraggingOver(true);
  };

  // ── Palette drag ─────────────────────────────────────────────────────────────
  const onPaletteDragStart = (e, type) => {
    setDraggingPaletteType(type);
    e.dataTransfer.setData("text/plain", type);
    e.dataTransfer.effectAllowed = "copy";
  };

  const onPaletteDragEnd = () => {
    setDraggingPaletteType(null);
    setDropTargetIndex(null);
  };

  // ── Pipeline list drag events ────────────────────────────────────────────────
  const onListDragStart = (e, index) => {
    setDraggingStepIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const onListDragOver = (e, index) => {
    e.preventDefault();
    setDropTargetIndex(index);
  };

  const onListDrop = (e, dropIndex) => {
    e.preventDefault();
    setDropTargetIndex(null);

    // Case 1: Dropping a new processor from the palette
    if (draggingPaletteType) {
      const newSteps = [...pipelineSteps];
      newSteps.splice(dropIndex, 0, draggingPaletteType);
      setPipelineSteps(newSteps);
      setDraggingPaletteType(null);
      return;
    }

    // Case 2: Reordering existing steps
    if (draggingStepIndex !== null && draggingStepIndex !== dropIndex) {
      const newSteps = [...pipelineSteps];
      const [moved] = newSteps.splice(draggingStepIndex, 1);
      newSteps.splice(dropIndex, 0, moved);
      setPipelineSteps(newSteps);
      setDraggingStepIndex(null);
    }
  };

  /** Drop on the empty end of the pipeline list */
  const onListEndDrop = (e) => {
    e.preventDefault();
    setDropTargetIndex(null);
    if (draggingPaletteType) {
      setPipelineSteps((prev) => [...prev, draggingPaletteType]);
      setDraggingPaletteType(null);
    } else if (draggingStepIndex !== null) {
      const newSteps = [...pipelineSteps];
      const [moved] = newSteps.splice(draggingStepIndex, 1);
      newSteps.push(moved);
      setPipelineSteps(newSteps);
      setDraggingStepIndex(null);
    }
  };

  /** Add step by clicking a palette card (mobile-friendly fallback) */
  const addStep = (type) => {
    setPipelineSteps((prev) => [...prev, type]);
  };

  /** Remove step by index */
  const removeStep = (index) => {
    setPipelineSteps((prev) => prev.filter((_, i) => i !== index));
  };

  /** Clear all steps */
  const clearPipeline = () => setPipelineSteps([]);

  // ── Run Pipeline ─────────────────────────────────────────────────────────────
  const handleRunPipeline = async () => {
    if (!token) {
      navigate("/login");
      return;
    }
    if (pipelineSteps.length === 0) {
      showToast("error", "Add at least one step to the pipeline.");
      return;
    }
    if (!file) {
      showToast("error", "Please upload a file to process.");
      return;
    }

    try {
      setRunning(true);

      // 1. Build multipart form and POST to /api/pipeline/run
      const formData = new FormData();
      formData.append("file", file);
      formData.append("steps", JSON.stringify(pipelineSteps.map((t) => ({ type: t }))));

      const { data } = await api.post("/pipeline/run", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const { pipelineId: pid, steps: jobSteps } = data;
      setPipelineId(pid);

      // 2. Initialise progress state and open modal
      const initSteps = jobSteps.map((s) => ({
        type: s.type,
        jobId: s.jobId,
        queue: s.queue,
        state: "waiting",
        progress: 0,
        result: null,
        error: null,
      }));
      setProgressSteps(initSteps);
      setShowProgress(true);

      // 3. Start polling (non-blocking — modal is already visible)
      await runPipeline(pid, jobSteps, {
        onStepUpdate: (updatedSteps) => setProgressSteps([...updatedSteps]),
        interval: 2000,
      });

      showToast("success", "Pipeline completed successfully!");
    } catch (err) {
      console.error("Pipeline error:", err);
      showToast("error", err.message || "Pipeline failed");
    } finally {
      setRunning(false);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 50%, #EEF2FF 100%)",
        fontFamily:
          "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      }}
    >
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "24px 20px" }}>

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
          <button
            onClick={() => navigate("/")}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              background: "none", border: "none", cursor: "pointer",
              color: "#64748B", fontSize: 14, fontWeight: 500,
              transition: "color 0.15s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#0F172A")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#64748B")}
          >
            <ArrowLeft size={16} /> Back to Dashboard
          </button>

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div
              style={{
                width: 34, height: 34, borderRadius: 10,
                background: "linear-gradient(135deg,#4F46E5,#7C3AED)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              <GripVertical size={16} color="white" />
            </div>
            <span style={{ fontSize: 14, fontWeight: 600, color: "#0F172A" }}>Pipeline Builder</span>
          </div>
        </div>

        {/* ── Hero ───────────────────────────────────────────────────────── */}
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div
            style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              background: "linear-gradient(90deg,#4F46E5,#7C3AED)",
              borderRadius: 20, padding: "5px 14px", marginBottom: 14,
            }}
          >
            <Sparkles size={12} color="white" />
            <span style={{ fontSize: 11, fontWeight: 600, color: "white" }}>
              Multi-Step Document Processing
            </span>
          </div>
          <h1
            style={{
              fontSize: "clamp(26px,5vw,38px)", fontWeight: 800,
              color: "#0F172A", margin: "0 0 10px", letterSpacing: "-0.02em",
            }}
          >
            Build Your{" "}
            <span
              style={{
                background: "linear-gradient(90deg,#4F46E5,#7C3AED)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              }}
            >
              Processing Pipeline
            </span>
          </h1>
          <p style={{ fontSize: 15, color: "#64748B", maxWidth: 480, margin: "0 auto" }}>
            Drag processors from the palette, arrange them in order, upload a file,
            and run them sequentially with one click.
          </p>
        </div>

        {/* ── Three-column layout ─────────────────────────────────────────── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "220px 1fr 240px",
            gap: 20,
            alignItems: "start",
          }}
        >

          {/* ── LEFT: Processor Palette ──────────────────────────────────── */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 12 }}>
              Processors
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {PROCESSORS.map((p) => {
                const Icon = p.icon;
                return (
                  <div
                    key={p.type}
                    id={`palette-${p.type}`}
                    draggable
                    onDragStart={(e) => onPaletteDragStart(e, p.type)}
                    onDragEnd={onPaletteDragEnd}
                    onClick={() => addStep(p.type)}
                    style={{
                      display: "flex", alignItems: "center", gap: 10,
                      background: "rgba(255,255,255,0.7)",
                      backdropFilter: "blur(10px)",
                      WebkitBackdropFilter: "blur(10px)",
                      border: `1px solid ${p.border}`,
                      borderRadius: 12, padding: "10px 12px",
                      cursor: "grab", userSelect: "none",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                      transition: "transform 0.15s, box-shadow 0.15s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-2px)";
                      e.currentTarget.style.boxShadow = "0 6px 18px rgba(0,0,0,0.1)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "none";
                      e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.05)";
                    }}
                  >
                    <div
                      style={{
                        width: 34, height: 34, borderRadius: 9,
                        background: p.bg, display: "flex",
                        alignItems: "center", justifyContent: "center", flexShrink: 0,
                      }}
                    >
                      <Icon size={16} color={p.iconColor} />
                    </div>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: "#0F172A" }}>{p.label}</div>
                      <div style={{ fontSize: 10, color: "#94A3B8", marginTop: 1, lineHeight: 1.3 }}>{p.desc}</div>
                    </div>
                    <div style={{ marginLeft: "auto", color: "#CBD5E1" }}>
                      <Plus size={14} />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Tip */}
            <div
              style={{
                marginTop: 16, background: "#EEF2FF", borderRadius: 10,
                padding: "10px 12px", fontSize: 11, color: "#4338CA", lineHeight: 1.5,
              }}
            >
              💡 <strong>Tip:</strong> Drag cards to the pipeline or click{" "}
              <strong>+</strong> to append them.
            </div>
          </div>

          {/* ── CENTRE: Pipeline Canvas ──────────────────────────────────── */}
          <div>
            <div
              style={{
                display: "flex", alignItems: "center",
                justifyContent: "space-between", marginBottom: 12,
              }}
            >
              <div style={{ fontSize: 11, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.07em" }}>
                Pipeline — {pipelineSteps.length} step{pipelineSteps.length !== 1 ? "s" : ""}
              </div>
              {pipelineSteps.length > 0 && (
                <button
                  onClick={clearPipeline}
                  style={{
                    background: "none", border: "none", cursor: "pointer",
                    color: "#94A3B8", fontSize: 12, display: "flex", alignItems: "center", gap: 4,
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "#E11D48")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "#94A3B8")}
                >
                  <Trash2 size={12} /> Clear all
                </button>
              )}
            </div>

            {/* Drop zone container */}
            <div
              onDragOver={(e) => { e.preventDefault(); setDropTargetIndex(pipelineSteps.length); }}
              onDrop={onListEndDrop}
              onDragLeave={() => setDropTargetIndex(null)}
              style={{
                minHeight: 300,
                background: "rgba(255,255,255,0.5)",
                backdropFilter: "blur(8px)",
                WebkitBackdropFilter: "blur(8px)",
                borderRadius: 18,
                border: `2px dashed ${pipelineSteps.length === 0 ? "#C7D2FE" : "transparent"}`,
                padding: 16,
                display: "flex",
                flexDirection: "column",
                gap: 8,
                transition: "border-color 0.2s",
              }}
            >
              {pipelineSteps.length === 0 ? (
                /* Empty state */
                <div
                  style={{
                    flex: 1, display: "flex", flexDirection: "column",
                    alignItems: "center", justifyContent: "center",
                    textAlign: "center", padding: "40px 20px",
                  }}
                >
                  <div
                    style={{
                      width: 64, height: 64, borderRadius: 18,
                      background: "#EEF2FF", display: "flex",
                      alignItems: "center", justifyContent: "center", marginBottom: 16,
                    }}
                  >
                    <GripVertical size={28} color="#A5B4FC" />
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: "#0F172A", marginBottom: 6 }}>
                    Drop processors here
                  </div>
                  <div style={{ fontSize: 13, color: "#94A3B8" }}>
                    Drag from the palette on the left to build your pipeline
                  </div>
                </div>
              ) : (
                pipelineSteps.map((type, index) => (
                  <div key={`step-${index}`}>
                    {/* Drop indicator line above */}
                    {dropTargetIndex === index && draggingPaletteType && (
                      <div style={{ height: 3, borderRadius: 2, background: "#4F46E5", marginBottom: 6, transition: "all 0.15s" }} />
                    )}

                    <div
                      draggable
                      onDragStart={(e) => onListDragStart(e, index)}
                      onDragEnd={() => { setDraggingStepIndex(null); setDropTargetIndex(null); }}
                      onDragOver={(e) => onListDragOver(e, index)}
                      onDrop={(e) => onListDrop(e, index)}
                    >
                      <StepCard
                        step={type}
                        index={index}
                        onRemove={removeStep}
                        isDragging={draggingStepIndex === index}
                      />
                    </div>

                    {/* Arrow connector */}
                    {index < pipelineSteps.length - 1 && (
                      <div style={{ display: "flex", justifyContent: "center", margin: "2px 0" }}>
                        <ChevronRight size={16} color="#C7D2FE" style={{ transform: "rotate(90deg)" }} />
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Run button */}
            <button
              id="run-pipeline-btn"
              onClick={handleRunPipeline}
              disabled={running || pipelineSteps.length === 0 || !file}
              style={{
                marginTop: 16, width: "100%",
                background:
                  running || pipelineSteps.length === 0 || !file
                    ? "#E2E8F0"
                    : "linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)",
                color:
                  running || pipelineSteps.length === 0 || !file ? "#94A3B8" : "white",
                border: "none", borderRadius: 14, padding: "14px 24px",
                fontSize: 15, fontWeight: 700, cursor:
                  running || pipelineSteps.length === 0 || !file ? "not-allowed" : "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                boxShadow:
                  running || pipelineSteps.length === 0 || !file
                    ? "none"
                    : "0 4px 16px rgba(79,70,229,0.35)",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                if (!running && pipelineSteps.length > 0 && file) {
                  e.currentTarget.style.transform = "translateY(-1px)";
                  e.currentTarget.style.boxShadow = "0 8px 24px rgba(79,70,229,0.45)";
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "none";
                e.currentTarget.style.boxShadow = running || pipelineSteps.length === 0 || !file
                  ? "none"
                  : "0 4px 16px rgba(79,70,229,0.35)";
              }}
            >
              {running ? (
                <>
                  <div
                    style={{
                      width: 18, height: 18, borderRadius: "50%",
                      border: "2.5px solid rgba(255,255,255,0.4)",
                      borderTopColor: "white",
                      animation: "spin 0.7s linear infinite",
                    }}
                  />
                  Running Pipeline…
                </>
              ) : (
                <>
                  <Play size={18} fill="currentColor" /> Run Pipeline
                </>
              )}
            </button>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

            {/* Validation hints */}
            {pipelineSteps.length === 0 && (
              <div style={{ textAlign: "center", fontSize: 12, color: "#94A3B8", marginTop: 8 }}>
                Add at least one step to enable Run
              </div>
            )}
            {pipelineSteps.length > 0 && !file && (
              <div style={{ textAlign: "center", fontSize: 12, color: "#94A3B8", marginTop: 8 }}>
                Upload a file on the right to enable Run
              </div>
            )}
          </div>

          {/* ── RIGHT: File Upload ───────────────────────────────────────── */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 12 }}>
              Source File
            </div>

            {/* Drop zone */}
            <div
              onDragOver={handleFileDragOver}
              onDragLeave={() => setIsDraggingOver(false)}
              onDrop={handleFileDrop}
              onClick={() => fileInputRef.current?.click()}
              style={{
                border: `2px dashed ${isDraggingOver ? "#4F46E5" : file ? "#A5B4FC" : "#CBD5E1"}`,
                borderRadius: 16,
                background: isDraggingOver
                  ? "rgba(79,70,229,0.05)"
                  : file
                  ? "rgba(238,242,255,0.6)"
                  : "rgba(255,255,255,0.6)",
                backdropFilter: "blur(8px)",
                WebkitBackdropFilter: "blur(8px)",
                padding: "24px 16px",
                textAlign: "center",
                cursor: "pointer",
                transition: "all 0.2s",
                minHeight: 180,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
              }}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,application/pdf"
                onChange={handleFileSelect}
                style={{ display: "none" }}
                id="pipeline-file-input"
              />

              {file ? (
                <>
                  <div
                    style={{
                      width: 52, height: 52, borderRadius: 14,
                      background: "#EEF2FF", display: "flex",
                      alignItems: "center", justifyContent: "center",
                    }}
                  >
                    {file.type.startsWith("image/") ? (
                      <FileImage size={24} color="#4F46E5" />
                    ) : (
                      <FileText size={24} color="#4F46E5" />
                    )}
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#0F172A", wordBreak: "break-all" }}>
                    {file.name}
                  </div>
                  <div style={{ fontSize: 11, color: "#94A3B8" }}>
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); setFile(null); }}
                    style={{
                      background: "#FFF1F2", border: "none", borderRadius: 8,
                      padding: "5px 12px", cursor: "pointer",
                      fontSize: 12, color: "#E11D48", fontWeight: 600,
                      display: "flex", alignItems: "center", gap: 5,
                    }}
                  >
                    <Trash2 size={12} /> Remove
                  </button>
                </>
              ) : (
                <>
                  <div
                    style={{
                      width: 52, height: 52, borderRadius: 14,
                      background: "#F1F5F9", display: "flex",
                      alignItems: "center", justifyContent: "center",
                    }}
                  >
                    <Upload size={24} color="#94A3B8" />
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#4F46E5" }}>
                    Click or drag to upload
                  </div>
                  <div style={{ fontSize: 11, color: "#94A3B8" }}>
                    PNG, JPG, PDF up to 50 MB
                  </div>
                </>
              )}
            </div>

            {/* How it works */}
            <div
              style={{
                marginTop: 16, background: "rgba(255,255,255,0.7)",
                backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)",
                borderRadius: 14, padding: "14px 16px",
                border: "1px solid rgba(255,255,255,0.9)",
              }}
            >
              <div style={{ fontSize: 12, fontWeight: 700, color: "#0F172A", marginBottom: 10 }}>
                How it works
              </div>
              {[
                { n: 1, text: "Choose processors from the palette" },
                { n: 2, text: "Drag to set the order" },
                { n: 3, text: "Upload your source file" },
                { n: 4, text: 'Click "Run Pipeline"' },
              ].map(({ n, text }) => (
                <div key={n} style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 8 }}>
                  <div
                    style={{
                      width: 20, height: 20, borderRadius: "50%",
                      background: "linear-gradient(135deg,#4F46E5,#7C3AED)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 10, fontWeight: 700, color: "white", flexShrink: 0,
                    }}
                  >
                    {n}
                  </div>
                  <span style={{ fontSize: 12, color: "#64748B", lineHeight: 1.5 }}>{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Progress Modal ──────────────────────────────────────────────────── */}
      {showProgress && (
        <PipelineProgress
          steps={progressSteps}
          pipelineId={pipelineId}
          onClose={() => {
            setShowProgress(false);
            setProgressSteps([]);
            setPipelineId(null);
          }}
        />
      )}

      {/* ── Toast ──────────────────────────────────────────────────────────── */}
      {toast && (
        <div
          style={{
            position: "fixed", bottom: 24, right: 24, zIndex: 10000,
            background: toast.type === "success" ? "#ECFDF5" : "#FFF1F2",
            border: `1px solid ${toast.type === "success" ? "#A7F3D0" : "#FECDD3"}`,
            borderRadius: 12, padding: "12px 18px",
            display: "flex", alignItems: "center", gap: 10,
            boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
            animation: "slideUp 0.3s ease",
          }}
        >
          <span style={{ fontSize: 13, fontWeight: 600, color: toast.type === "success" ? "#065F46" : "#9F1239" }}>
            {toast.message}
          </span>
          <button
            onClick={() => setToast(null)}
            style={{ background: "none", border: "none", cursor: "pointer", color: "#94A3B8", padding: 0 }}
          >
            <X size={14} />
          </button>
        </div>
      )}
      <style>{`
        @keyframes slideUp {
          from { transform: translateY(16px); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
      `}</style>
    </div>
  );
}
