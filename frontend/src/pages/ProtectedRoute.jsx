// src/components/ProtectedRoute.jsx
import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import api from "../services/api";

export default function ProtectedRoute({ children }) {
  const [status, setStatus] = useState("checking"); // checking | ok | fail

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { setStatus("fail"); return; }

    api.get("/auth/me")
      .then(() => setStatus("ok"))
      .catch(() => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setStatus("fail");
      });
  }, []);

  if (status === "checking") {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#F8FAFC" }}>
        <div style={{ width: 24, height: 24, borderRadius: "50%", border: "3px solid #4F46E5", borderTopColor: "transparent", animation: "spin 0.7s linear infinite" }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  if (status === "fail") return <Navigate to="/login" replace />;

  return children;
}