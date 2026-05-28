import { Navigate, useLocation } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

export function ProtectedRoute({ children }) {
  const { loading, isAuthenticated } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-slate-100">
        <div className="rounded-3xl border border-white/10 bg-slate-950/60 px-6 py-4 text-sm backdrop-blur-xl">
          Loading session...
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace state={{ from: location }} />;
  }

  return children;
}
