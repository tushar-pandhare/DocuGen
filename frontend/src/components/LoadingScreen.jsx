import { FileText, Sparkles } from "lucide-react";

export default function LoadingScreen({ message = "Preparing your workspace" }) {
  return (
    <main className="loading-screen" role="status" aria-live="polite">
      <div className="loading-content">
        <div className="loading-brand-mark" aria-hidden="true">
          <div className="loading-brand-icon">
            <FileText size={30} strokeWidth={1.8} />
          </div>
          <span className="loading-brand-sparkle">
            <Sparkles size={15} strokeWidth={2.2} />
          </span>
        </div>

        <div className="loading-brand-name">Docu<span>Gen</span></div>
        <p className="loading-message">{message}</p>
        <div className="loading-indicator" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
      </div>
      <span className="loading-screen-label">Loading</span>
    </main>
  );
}
