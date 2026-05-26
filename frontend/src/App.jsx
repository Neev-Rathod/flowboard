import { useEffect, useMemo, useState } from "react";

const API_BASE =
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
      setLoading(false);
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
        <section className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-5xl items-center justify-center">
          <div className="grid w-full gap-6 rounded-[2rem] border border-white/10 bg-white/8 p-6 shadow-[0_30px_120px_rgba(15,23,42,0.55)] backdrop-blur-2xl md:grid-cols-[1.2fr_0.8fr] md:p-10">
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
            </div>

            <div className="flex flex-col justify-between rounded-[1.75rem] border border-sky-400/15 bg-slate-950/50 p-6">
              <div>
                <p className="text-sm font-medium uppercase tracking-[0.2em] text-sky-200/80">
                  Session Status
                </p>
                <div className="mt-3 space-y-3 text-sm text-slate-300">
                  <p>Backend: {API_BASE}</p>
                  <p>Token: active</p>
                  <p>Database: SQLite locally, PostgreSQL in deployment.</p>
                </div>
              </div>

              <button
                type="button"
                onClick={logout}
                className="mt-8 inline-flex items-center justify-center rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-100"
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
      <section className="mx-auto grid min-h-[calc(100vh-5rem)] w-full max-w-6xl items-center gap-8 md:grid-cols-[1fr_0.95fr]">
        <div className="space-y-6">
          <span className="inline-flex rounded-full border border-sky-400/20 bg-sky-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-sky-100">
            Flowboard Auth
          </span>
          <div className="space-y-4">
            <h1 className="max-w-2xl text-5xl font-semibold tracking-tight text-white md:text-7xl">
              A clean login starter for React and FastAPI.
            </h1>
            <p className="max-w-xl text-base leading-7 text-slate-300 md:text-lg">
              Tailwind powers the UI, FastAPI handles registration and JWT
              login, and SQLite keeps local development simple while PostgreSQL
              is ready for deployment.
            </p>
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

        <div className="rounded-[2rem] border border-white/10 bg-white/8 p-4 shadow-[0_30px_120px_rgba(15,23,42,0.55)] backdrop-blur-2xl sm:p-6">
          <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/45 p-6 sm:p-8">
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
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none ring-0 transition placeholder:text-slate-500 focus:border-sky-400/50 focus:outline-none"
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

            <p className="mt-6 text-center text-xs leading-5 text-slate-400">
              API endpoint: {API_BASE}. If you deploy somewhere else, set{" "}
              <span className="font-medium text-slate-200">VITE_API_URL</span>{" "}
              to match the backend URL.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}

export default App;
