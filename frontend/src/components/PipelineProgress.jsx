// frontend/src/components/PipelineProgress.jsx
// Modal overlay showing per-step progress while the pipeline is running.
// Receives an array of step-status objects and renders a table with
// an animated indigo-to-violet progress bar per row.

import { X, CheckCircle2, XCircle, Clock, Loader2 } from "lucide-react";

/** Map BullMQ state → human-readable label + colour */
const STATE_META = {
  waiting:   { label: "Queued",     color: "#94A3B8", icon: Clock },
  active:    { label: "Running",    color: "#4F46E5", icon: Loader2, spin: true },
  completed: { label: "Completed",  color: "#059669", icon: CheckCircle2 },
  failed:    { label: "Error",      color: "#E11D48", icon: XCircle },
  delayed:   { label: "Queued",     color: "#94A3B8", icon: Clock },
  unknown:   { label: "Queued",     color: "#94A3B8", icon: Clock },
};

/** Friendly labels for step types */
const TYPE_LABEL = {
  ocr:        "OCR — Text Extraction",
  pdfToImage: "PDF → Image Conversion",
  compress:   "File Compression",
  invoice:    "Invoice Generation",
};

/**
 * PipelineProgress
 *
 * Props:
 *   steps      {Array<{type, state, progress, error}>}  - live step status
 *   onClose    {fn}   - called when the user closes the modal
 *   pipelineId {string}
 */
export default function PipelineProgress({ steps, onClose, pipelineId }) {
  const allDone = steps.every((s) => s.state === "completed" || s.state === "failed");
  const anyFailed = steps.some((s) => s.state === "failed");

  return (
    /* Backdrop */
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(15,23,42,0.55)",
        backdropFilter: "blur(6px)",
        WebkitBackdropFilter: "blur(6px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        padding: 16,
      }}
      onClick={(e) => e.target === e.currentTarget && allDone && onClose()}
    >
      {/* Card */}
      <div
        style={{
          background: "white",
          borderRadius: 20,
          width: "100%",
          maxWidth: 560,
          boxShadow: "0 24px 64px rgba(0,0,0,0.2)",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          style={{
            background: "linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)",
            padding: "20px 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "white" }}>
              Pipeline Progress
            </div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.7)", marginTop: 2 }}>
              ID: {pipelineId}
            </div>
          </div>
          {allDone && (
            <button
              onClick={onClose}
              aria-label="Close progress modal"
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                border: "none",
                background: "rgba(255,255,255,0.15)",
                color: "white",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Summary banner */}
        {allDone && (
          <div
            style={{
              background: anyFailed ? "#FFF1F2" : "#ECFDF5",
              borderBottom: `1px solid ${anyFailed ? "#FFE4E6" : "#D1FAE5"}`,
              padding: "12px 24px",
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            {anyFailed ? (
              <XCircle size={18} color="#E11D48" />
            ) : (
              <CheckCircle2 size={18} color="#059669" />
            )}
            <span style={{ fontSize: 13, fontWeight: 600, color: anyFailed ? "#9F1239" : "#065F46" }}>
              {anyFailed ? "One or more steps failed" : "All steps completed successfully!"}
            </span>
          </div>
        )}

        {/* Steps table */}
        <div style={{ padding: "16px 24px 24px" }}>
          <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: "0 8px" }}>
            <thead>
              <tr>
                <th style={{ textAlign: "left", fontSize: 11, fontWeight: 600, color: "#94A3B8", paddingBottom: 4, paddingLeft: 4 }}>#</th>
                <th style={{ textAlign: "left", fontSize: 11, fontWeight: 600, color: "#94A3B8", paddingBottom: 4 }}>Step</th>
                <th style={{ textAlign: "left", fontSize: 11, fontWeight: 600, color: "#94A3B8", paddingBottom: 4 }}>Status</th>
                <th style={{ textAlign: "left", fontSize: 11, fontWeight: 600, color: "#94A3B8", paddingBottom: 4 }}>Progress</th>
              </tr>
            </thead>
            <tbody>
              {steps.map((step, i) => {
                const meta = STATE_META[step.state] || STATE_META.waiting;
                const StateIcon = meta.icon;
                const pct = Math.min(100, Math.max(0, step.progress ?? 0));

                return (
                  <tr key={`${step.type}-${i}`}>
                    {/* Index */}
                    <td style={{ paddingLeft: 4, paddingRight: 8, width: 28 }}>
                      <div
                        style={{
                          width: 22,
                          height: 22,
                          borderRadius: "50%",
                          background: "linear-gradient(135deg,#4F46E5,#7C3AED)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 10,
                          fontWeight: 700,
                          color: "white",
                        }}
                      >
                        {i + 1}
                      </div>
                    </td>

                    {/* Step name */}
                    <td style={{ paddingRight: 12 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "#0F172A" }}>
                        {TYPE_LABEL[step.type] || step.type}
                      </div>
                      {step.error && (
                        <div style={{ fontSize: 10, color: "#E11D48", marginTop: 2 }}>{step.error}</div>
                      )}
                    </td>

                    {/* Status chip */}
                    <td style={{ paddingRight: 12, width: 100 }}>
                      <div
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 5,
                          padding: "3px 9px",
                          borderRadius: 20,
                          background: `${meta.color}18`,
                        }}
                      >
                        <StateIcon
                          size={12}
                          color={meta.color}
                          style={meta.spin ? { animation: "spin 1s linear infinite" } : {}}
                        />
                        <span style={{ fontSize: 11, fontWeight: 600, color: meta.color }}>
                          {meta.label}
                        </span>
                      </div>
                    </td>

                    {/* Progress bar */}
                    <td>
                      <div
                        style={{
                          height: 6,
                          borderRadius: 99,
                          background: "#F1F5F9",
                          overflow: "hidden",
                          width: "100%",
                          minWidth: 80,
                        }}
                      >
                        <div
                          style={{
                            height: "100%",
                            width: `${pct}%`,
                            background:
                              step.state === "failed"
                                ? "#E11D48"
                                : "linear-gradient(90deg, #4F46E5, #7C3AED)",
                            borderRadius: 99,
                            transition: "width 0.4s ease",
                          }}
                        />
                      </div>
                      <div style={{ fontSize: 10, color: "#94A3B8", marginTop: 3 }}>{pct}%</div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Spinner animation */}
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );
}
