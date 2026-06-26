import { useState } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";
import { User, Mail, Lock, Eye, EyeOff, FileText, ArrowRight, Check } from "lucide-react";

const STEPS = [
  { num: 1, label: "Account details" },
  { num: 2, label: "Secure password" },
  { num: 3, label: "Start using DocuGen" },
];

const PASSWORD_RULES = [
  { label: "At least 8 characters", test: (p) => p.length >= 8 },
  { label: "Uppercase letter", test: (p) => /[A-Z]/.test(p) },
  { label: "Number", test: (p) => /\d/.test(p) },
  { label: "Special character", test: (p) => /[@$!%*?&]/.test(p) },
];

export default function SignupPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    else if (formData.name.length < 3) newErrors.name = "At least 3 characters";

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) newErrors.email = "Email is required";
    else if (!emailRegex.test(formData.email)) newErrors.email = "Invalid email format";

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;
    if (!formData.password) newErrors.password = "Password is required";
    else if (!passwordRegex.test(formData.password)) newErrors.password = "Password does not meet requirements";

    if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await api.post("/auth/signup", {
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });
      navigate("/login");
    } catch (err) {
      alert(err.response?.data?.message || "Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = (hasError) => ({
    width: "100%",
    background: "rgba(255,255,255,0.04)",
    border: hasError ? "1px solid #EF4444" : "1px solid rgba(255,255,255,0.1)",
    borderRadius: "12px",
    padding: "14px 14px 14px 44px",
    color: "#F0F4FF",
    fontSize: "14px",
    outline: "none",
  });

  return (
    <div className="min-h-screen flex" style={{ fontFamily: "'Inter', sans-serif", background: "#0F1117" }}>

      {/* ── Left panel ── */}
      <div
        className="hidden lg:flex flex-col justify-between w-[52%] p-12"
        style={{
          background: "linear-gradient(145deg, #0D1B2A 0%, #0E1F38 60%, #0A1628 100%)",
          borderRight: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div
            className="flex items-center justify-center w-10 h-10 rounded-xl"
            style={{ background: "linear-gradient(135deg, #6366F1, #8B5CF6)" }}
          >
            <FileText size={20} color="white" />
          </div>
          <span className="text-white font-semibold text-lg tracking-tight">DocuGen</span>
        </div>

        {/* Center */}
        <div>
          <div
            className="inline-block text-xs font-semibold uppercase tracking-widest px-3 py-1 rounded-full mb-6"
            style={{ background: "rgba(99,102,241,0.15)", color: "#A5B4FC", border: "1px solid rgba(99,102,241,0.3)" }}
          >
            Free to get started
          </div>

          <h1
            className="font-bold leading-tight mb-4"
            style={{ fontSize: "2.6rem", color: "#F0F4FF", letterSpacing: "-0.02em" }}
          >
            One workspace for
            <br />
            <span style={{ color: "#818CF8" }}>all your documents.</span>
          </h1>

          <p className="text-base leading-relaxed mb-10" style={{ color: "#8B9CB6", maxWidth: "400px" }}>
            Join thousands of teams who generate, extract, and manage documents with DocuGen.
          </p>

          {/* Step visual */}
          <div className="space-y-4">
            {STEPS.map((s, i) => (
              <div key={s.num} className="flex items-center gap-4">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                  style={{
                    background: "linear-gradient(135deg, #6366F1, #8B5CF6)",
                    color: "white",
                  }}
                >
                  {s.num}
                </div>
                <span className="text-sm" style={{ color: "#8B9CB6" }}>{s.label}</span>
                {i < STEPS.length - 1 && (
                  <div
                    className="absolute ml-4 mt-8 w-px h-4"
                    style={{ background: "rgba(99,102,241,0.3)" }}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { value: "50K+", label: "Documents processed" },
            { value: "99.9%", label: "Uptime" },
            { value: "256-bit", label: "Encryption" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl p-4"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
            >
              <div className="text-lg font-bold mb-0.5" style={{ color: "#818CF8" }}>{stat.value}</div>
              <div className="text-xs" style={{ color: "#4B6080" }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right panel — form ── */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 overflow-y-auto">
        <div className="w-full max-w-md py-6">

          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #6366F1, #8B5CF6)" }}
            >
              <FileText size={16} color="white" />
            </div>
            <span className="font-semibold text-white">DocuGen</span>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-1" style={{ color: "#F0F4FF", letterSpacing: "-0.01em" }}>
              Create your account
            </h2>
            <p className="text-sm" style={{ color: "#5A7090" }}>
              Free forever. No credit card required.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "#5A7090" }}>
                Full Name
              </label>
              <div className="relative">
                <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: "#3B5070" }} />
                <input
                  type="text"
                  placeholder="Tushar Pandhare"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  style={inputStyle(errors.name)}
                  onFocus={(e) => { if (!errors.name) e.target.style.borderColor = "#6366F1"; }}
                  onBlur={(e) => { if (!errors.name) e.target.style.borderColor = "rgba(255,255,255,0.1)"; }}
                />
              </div>
              {errors.name && <p className="text-xs mt-1.5" style={{ color: "#EF4444" }}>{errors.name}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "#5A7090" }}>
                Work Email
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: "#3B5070" }} />
                <input
                  type="email"
                  placeholder="you@company.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  style={inputStyle(errors.email)}
                  onFocus={(e) => { if (!errors.email) e.target.style.borderColor = "#6366F1"; }}
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
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: "#3B5070" }} />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  onFocus={() => setPasswordFocused(true)}
                  onBlur={() => setPasswordFocused(false)}
                  style={{ ...inputStyle(errors.password), paddingRight: "44px" }}
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

              {/* Password strength checklist */}
              {(passwordFocused || formData.password) && (
                <div
                  className="mt-3 p-3 rounded-xl grid grid-cols-2 gap-2"
                  style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
                >
                  {PASSWORD_RULES.map((rule) => {
                    const passed = rule.test(formData.password);
                    return (
                      <div key={rule.label} className="flex items-center gap-2">
                        <div
                          className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0"
                          style={{
                            background: passed ? "rgba(34,197,94,0.2)" : "rgba(255,255,255,0.05)",
                            border: passed ? "1px solid rgba(34,197,94,0.4)" : "1px solid rgba(255,255,255,0.1)",
                          }}
                        >
                          {passed && <Check size={10} color="#22C55E" />}
                        </div>
                        <span className="text-xs" style={{ color: passed ? "#4ADE80" : "#3B5070" }}>
                          {rule.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "#5A7090" }}>
                Confirm Password
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: "#3B5070" }} />
                <input
                  type={showConfirm ? "text" : "password"}
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  style={{ ...inputStyle(errors.confirmPassword), paddingRight: "44px" }}
                  onFocus={(e) => { if (!errors.confirmPassword) e.target.style.borderColor = "#6366F1"; }}
                  onBlur={(e) => { if (!errors.confirmPassword) e.target.style.borderColor = "rgba(255,255,255,0.1)"; }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-4 top-1/2 -translate-y-1/2"
                  style={{ color: "#3B5070", background: "none", border: "none", cursor: "pointer" }}
                >
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-xs mt-1.5" style={{ color: "#EF4444" }}>{errors.confirmPassword}</p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 font-semibold text-sm"
              style={{
                background: loading ? "rgba(99,102,241,0.5)" : "linear-gradient(135deg, #6366F1, #8B5CF6)",
                color: "white",
                padding: "14px",
                borderRadius: "12px",
                border: "none",
                cursor: loading ? "not-allowed" : "pointer",
                marginTop: "8px",
                boxShadow: loading ? "none" : "0 4px 24px rgba(99,102,241,0.35)",
              }}
            >
              {loading ? (
                <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
              ) : (
                <>
                  Create account
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.07)" }} />
            <span className="text-xs" style={{ color: "#3B5070" }}>Already have an account?</span>
            <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.07)" }} />
          </div>

          <button
            type="button"
            onClick={() => navigate("/login")}
            className="w-full text-sm font-semibold"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "#A5B4FC",
              padding: "13px",
              borderRadius: "12px",
              cursor: "pointer",
            }}
          >
            Sign in instead →
          </button>

          <p className="text-center text-xs mt-6" style={{ color: "#2D4060" }}>
            By creating an account you agree to our Terms of Service.
          </p>
        </div>
      </div>
    </div>
  );
}