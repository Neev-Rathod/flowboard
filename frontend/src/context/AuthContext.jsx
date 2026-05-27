import { createContext, useContext, useEffect, useMemo, useState } from "react";

const runtimeConfig = window.__FLOWBOARD_CONFIG__ || {};

export const API_BASE =
  runtimeConfig.apiBase ||
  import.meta.env.VITE_API_URL ||
  `${window.location.protocol}//${window.location.hostname}:8000`;

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(
    () => localStorage.getItem("flowboard_token") || "",
  );
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(Boolean(token));
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) {
      return;
    }

    const loadSession = async () => {
      try {
        const response = await fetch(`${API_BASE}/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Session expired");
        }

        const payload = await response.json();
        setUser(payload);
      } catch {
        localStorage.removeItem("flowboard_token");
        setToken("");
        setUser(null);
        setMessage("Your session expired. Please sign in again.");
      } finally {
        setLoading(false);
      }
    };

    loadSession();
  }, [token]);

  const login = async ({ endpoint, body }) => {
    setError("");
    setMessage("");

    const response = await fetch(`${API_BASE}${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const payload = await response.json();

    if (!response.ok) {
      throw new Error(payload.detail || "Unable to complete the request");
    }

    localStorage.setItem("flowboard_token", payload.access_token);
    setToken(payload.access_token);
    setUser(payload.user);
    setLoading(false);
    return payload;
  };

  const logout = () => {
    localStorage.removeItem("flowboard_token");
    setToken("");
    setUser(null);
    setMessage("Signed out.");
    setLoading(false);
  };

  const value = useMemo(
    () => ({
      apiBase: API_BASE,
      token,
      user,
      loading,
      message,
      error,
      setMessage,
      setError,
      setUser,
      setToken,
      login,
      logout,
      isAuthenticated: Boolean(user && token),
    }),
    [error, loading, message, token, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
