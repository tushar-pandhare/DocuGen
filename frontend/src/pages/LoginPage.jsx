import { useState } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, FileText, ArrowRight } from "lucide-react";

const FEATURES = [
  { icon: "📄", label: "PDF Generation" },
  { icon: "🔍", label: "Text Extraction" },
  { icon: "🗜️", label: "File Compression" },
  { icon: "🤖", label: "AI Assistant" },
];

export default function LoginPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) newErrors.email = "Email is required";
    else if (!emailRegex.test(formData.email)) newErrors.email = "Invalid email format";
    if (!formData.password) newErrors.password = "Password is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await api.post("/auth/login", formData);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user || null));
      navigate("/");
    } catch (err) {
      alert(err.response?.data?.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ fontFamily: "'Inter', sans-serif", background: "#0F1117" }}>

      {/* ── Left panel ── */}
      <div
        className="hidden lg:flex flex-col justify-between w-[52%] p-12"
        style={{
          background: "linear-gradient(145deg, #0D1B2A 0%, #112240 60%, #0A1628 100%)",
          borderRight: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div
            className="flex items-center justify-center w-10 h-10 rounded-xl"
            style={{ background: "linear-gradient(135deg, #3B82F6, #6366F1)" }}
          >
            <FileText size={20} color="white" />
          </div>
          <span className="text-white font-semibold text-lg tracking-tight">DocuGen</span>
        </div>

        {/* Center content */}
        <div>
          <div
            className="inline-block text-xs font-semibold uppercase tracking-widest px-3 py-1 rounded-full mb-6"
            style={{ background: "rgba(59,130,246,0.15)", color: "#60A5FA", border: "1px solid rgba(59,130,246,0.3)" }}
          >
            Document Intelligence Platform
          </div>

          <h1
            className="font-bold leading-tight mb-4"
            style={{ fontSize: "2.6rem", color: "#F0F4FF", letterSpacing: "-0.02em" }}
          >
            Your documents,
            <br />
            <span style={{ color: "#3B82F6" }}>intelligently</span> handled.
          </h1>

          <p className="text-base leading-relaxed mb-10" style={{ color: "#8B9CB6", maxWidth: "420px" }}>
            Generate, extract, compress and analyse documents with AI — all in one secure workspace.
          </p>

          {/* Feature pills */}
          <div className="flex flex-wrap gap-3">
            {FEATURES.map((f) => (
              <div
                key={f.label}
                className="flex items-center gap-2 px-4 py-2 rounded-full text-sm"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "#CBD5E1",
                }}
              >
                <span>{f.icon}</span>
                <span>{f.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom quote */}
        <div
          className="rounded-2xl p-5"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
        >
          <p className="text-sm italic mb-3" style={{ color: "#8B9CB6" }}>
            "DocuGen cut our invoice processing time by 70%. The AI extraction is remarkably accurate."
          </p>
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
              style={{ background: "linear-gradient(135deg, #3B82F6, #6366F1)", color: "white" }}
            >
              R
            </div>
            <div>
              <div className="text-sm font-medium" style={{ color: "#CBD5E1" }}>Rohan Mehta</div>
              <div className="text-xs" style={{ color: "#4B6080" }}>Operations Lead, FinServe</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Right panel — form ── */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">

          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #3B82F6, #6366F1)" }}
            >
              <FileText size={16} color="white" />
            </div>
            <span className="font-semibold text-white">DocuGen</span>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-1" style={{ color: "#F0F4FF", letterSpacing: "-0.01em" }}>
              Sign in
            </h2>
            <p className="text-sm" style={{ color: "#5A7090" }}>
              Access your document workspace
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "#5A7090" }}>
                Email Address
              </label>
              <div className="relative">
                <Mail
                  size={16}
                  className="absolute left-4 top-1/2 -translate-y-1/2"
                  style={{ color: "#3B5070" }}
                />
                <input
                  type="email"
                  placeholder="you@company.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  style={{
                    width: "100%",
                    background: "rgba(255,255,255,0.04)",
                    border: errors.email ? "1px solid #EF4444" : "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "12px",
                    padding: "14px 14px 14px 44px",
                    color: "#F0F4FF",
                    fontSize: "14px",
                    outline: "none",
                    transition: "border-color 0.2s",
                  }}
                  onFocus={(e) => { if (!errors.email) e.target.style.borderColor = "#3B82F6"; }}
                  onBlur={(e) => { if (!errors.email) e.target.style.borderColor = "rgba(255,255,255,0.1)"; }}
                />
              </div>
              {errors.email && <p className="text-xs mt-1.5" style={{ color: "#EF4444" }}>{errors.email}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "#5A7090" }}>
                Password
              </label>
              <div className="relative">
                <Lock
                  size={16}
                  className="absolute left-4 top-1/2 -translate-y-1/2"
                  style={{ color: "#3B5070" }}
                />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  style={{
                    width: "100%",
                    background: "rgba(255,255,255,0.04)",
                    border: errors.password ? "1px solid #EF4444" : "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "12px",
                    padding: "14px 44px 14px 44px",
                    color: "#F0F4FF",
                    fontSize: "14px",
                    outline: "none",
                    transition: "border-color 0.2s",
                  }}
                  onFocus={(e) => { if (!errors.password) e.target.style.borderColor = "#3B82F6"; }}
                  onBlur={(e) => { if (!errors.password) e.target.style.borderColor = "rgba(255,255,255,0.1)"; }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2"
                  style={{ color: "#3B5070", background: "none", border: "none", cursor: "pointer" }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="text-xs mt-1.5" style={{ color: "#EF4444" }}>{errors.password}</p>}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 font-semibold text-sm transition-all"
              style={{
                background: loading ? "rgba(59,130,246,0.5)" : "linear-gradient(135deg, #3B82F6, #6366F1)",
                color: "white",
                padding: "14px",
                borderRadius: "12px",
                border: "none",
                cursor: loading ? "not-allowed" : "pointer",
                marginTop: "8px",
                boxShadow: loading ? "none" : "0 4px 24px rgba(59,130,246,0.35)",
              }}
            >
              {loading ? (
                <div
                  className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin"
                />
              ) : (
                <>
                  Sign in to workspace
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.07)" }} />
            <span className="text-xs" style={{ color: "#3B5070" }}>New to DocuGen?</span>
            <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.07)" }} />
          </div>

          <button
            type="button"
            onClick={() => navigate("/signup")}
            className="w-full text-sm font-semibold transition-all"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "#60A5FA",
              padding: "13px",
              borderRadius: "12px",
              cursor: "pointer",
            }}
          >
            Create a free account →
          </button>

          <p className="text-center text-xs mt-6" style={{ color: "#2D4060" }}>
            Your documents are encrypted and stored securely.
          </p>
        </div>
      </div>
    </div>
  );
}