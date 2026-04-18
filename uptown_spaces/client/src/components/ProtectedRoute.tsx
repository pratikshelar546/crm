import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { token, isReady } = useAuth();
  const location = useLocation();

  if (!isReady) {
    return (
      <p className="text-sm text-slate-500" role="status">
        Loading…
      </p>
    );
  }

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return children;
}
