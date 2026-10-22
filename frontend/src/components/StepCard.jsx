// frontend/src/components/StepCard.jsx
// A single card representing one pipeline step in the active pipeline list.
// Displays the processor icon, label, step number, and a remove button.

import { X, ScanLine, FileImage, Archive, Receipt } from "lucide-react";

/** Map step type → display metadata */
const STEP_META = {
  ocr: {
    label: "OCR",
    desc: "Extract text from document",
    icon: ScanLine,
    gradient: "from-indigo-500 to-violet-500",
    bg: "#EEF2FF",
    iconColor: "#4F46E5",
  },
  pdfToImage: {
    label: "PDF → Image",
    desc: "Convert PDF pages to images",
    icon: FileImage,
    gradient: "from-teal-500 to-cyan-500",
    bg: "#F0FDFA",
    iconColor: "#0D9488",
  },
  compress: {
    label: "Compress",
    desc: "Reduce file size",
    icon: Archive,
    gradient: "from-rose-500 to-pink-500",
    bg: "#FFF1F2",
    iconColor: "#E11D48",
  },
  invoice: {
    label: "Invoice",
    desc: "Generate invoice PDF",
    icon: Receipt,
    gradient: "from-amber-500 to-orange-500",
    bg: "#FFFBEB",
    iconColor: "#D97706",
  },
};

/**
 * StepCard — rendered inside the pipeline list.
 *
 * Props:
 *   step    {string}  - step type key (e.g. "ocr")
 *   index   {number}  - 0-based position in the list
 *   onRemove {fn}     - called when the × button is clicked
 *   isDragging {bool} - true while the card is being dragged
 */
export default function StepCard({ step, index, onRemove, isDragging = false }) {
  const meta = STEP_META[step] || {
    label: step,
    desc: "",
    icon: ScanLine,
    gradient: "from-slate-400 to-slate-500",
    bg: "#F8FAFC",
    iconColor: "#64748B",
  };
  const Icon = meta.icon;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 14,
        background: isDragging
          ? "rgba(255,255,255,0.85)"
          : "rgba(255,255,255,0.6)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        border: `1px solid ${isDragging ? "#A5B4FC" : "rgba(255,255,255,0.8)"}`,
        borderRadius: 14,
        padding: "12px 16px",
        boxShadow: isDragging
          ? "0 12px 32px rgba(79,70,229,0.2)"
          : "0 2px 8px rgba(0,0,0,0.06)",
        cursor: "grab",
        transition: "box-shadow 0.2s, border-color 0.2s",
        userSelect: "none",
      }}
    >
      {/* Step number badge */}
      <div
        style={{
          width: 26,
          height: 26,
          borderRadius: "50%",
          background: `linear-gradient(135deg, #4F46E5, #7C3AED)`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          fontSize: 11,
          fontWeight: 700,
          color: "white",
        }}
      >
        {index + 1}
      </div>

      {/* Icon */}
      <div
        style={{
          width: 38,
          height: 38,
          borderRadius: 10,
          background: meta.bg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <Icon size={18} color={meta.iconColor} />
      </div>

      {/* Text */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: "#0F172A" }}>{meta.label}</div>
        <div style={{ fontSize: 11, color: "#94A3B8", marginTop: 2 }}>{meta.desc}</div>
      </div>

      {/* Drag handle hint */}
      <div style={{ color: "#CBD5E1", fontSize: 18, cursor: "grab", lineHeight: 1 }}>⋮⋮</div>

      {/* Remove button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onRemove(index);
        }}
        aria-label={`Remove step ${meta.label}`}
        style={{
          width: 28,
          height: 28,
          borderRadius: 8,
          border: "none",
          background: "transparent",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#94A3B8",
          transition: "background 0.15s, color 0.15s",
          flexShrink: 0,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "#FFF1F2";
          e.currentTarget.style.color = "#E11D48";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "transparent";
          e.currentTarget.style.color = "#94A3B8";
        }}
      >
        <X size={14} />
      </button>
    </div>
  );
}
