import { useEffect, useMemo, useState } from "react";
import WorkflowList from "./components/WorkflowList";
import DashboardSummary from "./components/DashboardSummary";

const runtimeConfig = window.__FLOWBOARD_CONFIG__ || {};

const API_BASE =
  runtimeConfig.apiBase ||
  import.meta.env.VITE_API_URL ||
  `${window.location.protocol}//${window.location.hostname}:8000`;

const emptyForm = {
  username: "",
  email: "",
  password: "",
};

function App() {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState(emptyForm);
  const [token, setToken] = useState(
    () => localStorage.getItem("flowboard_token") || "",
  );
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(Boolean(token));
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const isRegisterMode = mode === "register";

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

  const subtitle = useMemo(() => {
    if (user) {
      return "Your workspace is connected and authenticated.";
    }

    return isRegisterMode
      ? "Create your account and start the stack."
      : "Sign in to connect the React frontend to FastAPI.";
  }, [isRegisterMode, user]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const resetFeedback = () => {
    setError("");
    setMessage("");
  };

  const submitForm = async (event) => {
    event.preventDefault();
    resetFeedback();
    setSubmitting(true);

    try {
      const endpoint = isRegisterMode ? "/auth/register" : "/auth/login";
      const body = isRegisterMode
        ? {
            username: form.username.trim(),
            email: form.email.trim(),
            password: form.password,
          }
        : {
            username: form.username.trim(),
            password: form.password,
          };

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
      setForm(emptyForm);
      setMessage(
        isRegisterMode ? "Account created successfully." : "Welcome back.",
      );
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSubmitting(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("flowboard_token");
    setToken("");
    setUser(null);
    setForm(emptyForm);
    setMode("login");
    setMessage("Signed out.");
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center px-6 text-slate-100">
        <div className="rounded-3xl border border-white/10 bg-white/8 px-6 py-5 shadow-2xl backdrop-blur-xl">
          Loading session...
        </div>
      </main>
    );
  }

  if (user) {
    return (
      <main className="min-h-screen px-6 py-10 text-slate-100 md:px-10">
        <section className="mx-auto grid min-h-[calc(100vh-5rem)] w-full max-w-6xl gap-8 md:grid-cols-[1.05fr_0.95fr]">
          <div className="grid gap-6 rounded-4xl border border-white/10 bg-white/8 p-6 shadow-[0_30px_120px_rgba(15,23,42,0.55)] backdrop-blur-2xl md:p-10">
            <div className="space-y-6">
              <span className="inline-flex rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-emerald-200">
                Authenticated
              </span>
              <div className="space-y-3">
                <h1 className="text-4xl font-semibold tracking-tight text-white md:text-5xl">
                  Welcome, {user.username}
                </h1>
                <p className="max-w-xl text-sm leading-6 text-slate-300 md:text-base">
                  You are signed into the Flowboard starter. The frontend is
                  talking to the FastAPI backend, and your token is stored
                  locally for the session.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                    User ID
                  </p>
                  <p className="mt-2 text-lg font-medium text-white">
                    {user.id}
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                    Email
                  </p>
                  <p className="mt-2 text-lg font-medium text-white">
                    {user.email}
                  </p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-2xl border border-white/10 bg-white/8 p-4 backdrop-blur-xl">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                    Frontend
                  </p>
                  <p className="mt-2 text-sm font-medium text-white">
                    React + Vite + Tailwind
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/8 p-4 backdrop-blur-xl">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                    Backend
                  </p>
                  <p className="mt-2 text-sm font-medium text-white">
                    FastAPI + JWT + SQLAlchemy
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/8 p-4 backdrop-blur-xl">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                    Database
                  </p>
                  <p className="mt-2 text-sm font-medium text-white">
                    SQLite local, PostgreSQL deploy
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <div className="rounded-4xl border border-white/10 bg-white/8 p-4 shadow-[0_30px_120px_rgba(15,23,42,0.55)] backdrop-blur-2xl sm:p-6">
              <div className="rounded-3xl border border-white/10 bg-slate-950/45 p-6 sm:p-8">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-semibold text-white">
                      Dashboard
                    </h2>
                    <p className="mt-1 text-sm text-slate-400">
                      Track workflow volume, completion, and overdue work.
                    </p>
                  </div>
                </div>

                <div className="mt-6">
                  <DashboardSummary apiBase={API_BASE} token={token} />
                </div>

                <div className="mt-6">
                  <WorkflowList apiBase={API_BASE} token={token} />
                </div>
              </div>
            </div>

            <div className="rounded-[1.75rem] border border-sky-400/15 bg-slate-950/50 p-6">
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-sky-200/80">
                Session
              </p>
              <div className="mt-3 space-y-3 text-sm text-slate-300">
                <p>Backend: {API_BASE}</p>
                <p>Token: active</p>
                <p>Database: SQLite locally, PostgreSQL in deployment.</p>
              </div>

              <button
                type="button"
                onClick={logout}
                className="mt-6 inline-flex items-center justify-center rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-100"
              >
                Log out
              </button>
            </div>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-6 py-10 text-slate-100 md:px-10">
      <section className="mx-auto grid min-h-[calc(100vh-5rem)] w-full max-w-6xl items-center gap-8 md:grid-cols-[1.05fr_0.95fr]">
        <div className="space-y-6">
          <span className="inline-flex rounded-full border border-sky-400/20 bg-sky-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-sky-100">
            Flowboard
          </span>
          <div className="space-y-4">
            <h1 className="max-w-2xl text-5xl font-semibold tracking-tight text-white md:text-7xl">
              Workflow orchestration for real processes.
            </h1>
            <p className="max-w-xl text-base leading-7 text-slate-300 md:text-lg">
              Build reusable workflows with stages, tasks, runs, and dashboard
              analytics.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/8 p-4 backdrop-blur-xl">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                Workflow
              </p>
              <p className="mt-2 text-sm font-medium text-white">
                Templates and runs
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/8 p-4 backdrop-blur-xl">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                Stages
              </p>
              <p className="mt-2 text-sm font-medium text-white">
                Ordered process steps
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/8 p-4 backdrop-blur-xl">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                Runs
              </p>
              <p className="mt-2 text-sm font-medium text-white">
                Track execution progress
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-4xl border border-white/10 bg-white/8 p-4 shadow-[0_30px_120px_rgba(15,23,42,0.55)] backdrop-blur-2xl sm:p-6">
          <div className="rounded-3xl border border-white/10 bg-slate-950/45 p-6 sm:p-8">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-semibold text-white">
                  {isRegisterMode ? "Create account" : "Welcome back"}
                </h2>
                <p className="mt-1 text-sm text-slate-400">{subtitle}</p>
              </div>

              <div className="rounded-full border border-white/10 bg-white/5 p-1 text-sm">
                <button
                  type="button"
                  onClick={() => setMode("login")}
                  className={`rounded-full px-3 py-1.5 transition ${
                    !isRegisterMode
                      ? "bg-white text-slate-950"
                      : "text-slate-300"
                  }`}
                >
                  Login
                </button>
                <button
                  type="button"
                  onClick={() => setMode("register")}
                  className={`rounded-full px-3 py-1.5 transition ${
                    isRegisterMode
                      ? "bg-white text-slate-950"
                      : "text-slate-300"
                  }`}
                >
                  Register
                </button>
              </div>
            </div>

            <form className="mt-8 space-y-4" onSubmit={submitForm}>
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-300">
                  Username
                </span>
                <input
                  type="text"
                  name="username"
                  value={form.username}
                  onChange={handleChange}
                  autoComplete="username"
                  required
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-sky-400/50"
                  placeholder="jane.doe"
                />
              </label>

              {isRegisterMode ? (
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-300">
                    Email
                  </span>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    autoComplete="email"
                    required
                    className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-sky-400/50"
                    placeholder="jane@example.com"
                  />
                </label>
              ) : null}

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-300">
                  Password
                </span>
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  autoComplete={
                    isRegisterMode ? "new-password" : "current-password"
                  }
                  required
                  minLength="6"
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-sky-400/50"
                  placeholder="••••••••"
                />
              </label>

              {error ? (
                <div className="rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
                  {error}
                </div>
              ) : null}

              {message ? (
                <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-100">
                  {message}
                </div>
              ) : null}

              <button
                type="submit"
                disabled={submitting}
                className="inline-flex w-full items-center justify-center rounded-2xl bg-sky-400 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-300 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting
                  ? "Working..."
                  : isRegisterMode
                    ? "Create account"
                    : "Sign in"}
              </button>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}

export default App;
