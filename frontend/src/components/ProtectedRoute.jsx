import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import api from "../services/api";
import LoadingScreen from "./LoadingScreen";

export default function ProtectedRoute({ children }) {
  const [status, setStatus] = useState(() =>
    localStorage.getItem("token") ? "checking" : "fail"
  ); // checking | ok | fail

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    api.get("/auth/me")
      .then(() => setStatus("ok"))
      .catch(() => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setStatus("fail");
      });
  }, []);

  if (status === "checking") {
    return <LoadingScreen message="Checking your account" />;
  }

  if (status === "fail") return <Navigate to="/login" replace />;

  return children;
}
