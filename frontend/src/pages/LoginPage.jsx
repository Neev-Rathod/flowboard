import { useEffect, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { Key, LogIn, Sparkles } from "lucide-react";

import { useAuth } from "../context/AuthContext";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Checkbox } from "../components/ui/checkbox";
import { Input } from "../components/ui/input";

const emptyForm = {
  username: "",
  email: "",
  password: "",
};

const DEMO_PERSONAS = [
  {
    label: "Platform Admin",
    username: "admin1",
    role: "Admin",
    desc: "Builds & manages workflow runs",
  },
  {
    label: "Engineering Mgr",
    username: "engmgr1",
    role: "Manager",
    desc: "Assigns workflow runs to developers",
  },
  {
    label: "Frontend Dev",
    username: "frontenddev1",
    role: "Developer",
    desc: "Creates frontend code assignments",
  },
  {
    label: "QA Lead",
    username: "qalead1",
    role: "QA",
    desc: "Tests user flows & runs regression checks",
  },
  {
    label: "DevOps Engineer",
    username: "devops1",
    role: "DevOps",
    desc: "CI/CD releases and smoke testing",
  },
];

export function LoginPage() {
  const {
    isAuthenticated,
    loading,
    login,
    error,
    setError,
    message,
    setMessage,
  } = useAuth();
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [remember, setRemember] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const isRegisterMode = mode === "register";
  const from = location.state?.from?.pathname || "/dashboard";

  // SEO Optimization & Browser Page Head updates
  useEffect(() => {
    document.title = "Welcome to Shadcn Space | Flowboard";

    // Manage meta description
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement("meta");
      metaDesc.setAttribute("name", "description");
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute(
      "content",
      "Sign in to Flowboard to run hierarchical workflow handoffs, track team assignments, and coordinate cross-functional releases.",
    );
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const submitForm = async (event) => {
    if (event) event.preventDefault();
    setError("");
    setMessage("");
    setSubmitting(true);

    try {
      await login({
        endpoint: isRegisterMode ? "/auth/register" : "/auth/login",
        body: isRegisterMode
          ? {
              username: form.username.trim(),
              email: form.email.trim(),
              password: form.password,
            }
          : {
              username: form.email.trim() || form.username.trim(),
              password: form.password,
            },
      });
      setForm(emptyForm);
      setMessage(
        isRegisterMode ? "Account created successfully." : "Welcome back.",
      );
      navigate(from, { replace: true });
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickLogin = async (username) => {
    setError("");
    setMessage("");
    setSubmitting(true);
    try {
      await login({
        endpoint: "/auth/login",
        body: {
          username: username,
          password: "password123", // Default seed password
        },
      });
      setForm(emptyForm);
      setMessage(`Welcome back, ${username}!`);
      navigate(from, { replace: true });
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white text-zinc-950">
        <div className="flex items-center gap-3 rounded-2xl border border-zinc-200 bg-white px-8 py-5 text-sm font-medium shadow-sm">
          <LoaderSpinner className="h-5 w-5 animate-spin text-zinc-900" />
          <span>Loading secure session...</span>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <main className="min-h-screen bg-white px-6 py-10 text-zinc-950 md:px-10">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(24,24,27,0.06),_transparent_45%)] pointer-events-none" />

      <section className="relative z-10 mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-5xl flex-col items-center justify-center gap-6">
        <Card className="w-full max-w-md border-zinc-200 bg-white shadow-[0_24px_80px_-40px_rgba(0,0,0,0.35)]">
          <CardHeader className="space-y-4 text-center">
            <Badge
              variant="secondary"
              className="mx-auto w-fit rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.3em] text-zinc-700"
            >
              Flowboard workspace
            </Badge>
            <div className="space-y-2">
              <CardTitle className="text-3xl font-semibold tracking-tight text-zinc-950">
                Welcome to FlowBoard
              </CardTitle>
              <CardDescription className="text-sm text-zinc-500">
                Login to your account now
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-5 pt-0">
            {error ? (
              <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {error}
              </div>
            ) : null}

            {message ? (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                {message}
              </div>
            ) : null}

            <form className="space-y-4" onSubmit={submitForm}>
              {isRegisterMode ? (
                <div className="space-y-2">
                  <label
                    className="text-xs font-medium uppercase tracking-wide text-zinc-500"
                    htmlFor="login-username"
                  >
                    Username
                  </label>
                  <Input
                    id="login-username"
                    type="text"
                    name="username"
                    value={form.username}
                    onChange={handleChange}
                    autoComplete="username"
                    required
                    placeholder="jane.doe"
                  />
                </div>
              ) : null}

              <div className="space-y-2">
                <label
                  className="text-xs font-medium uppercase tracking-wide text-zinc-500"
                  htmlFor="login-email"
                >
                  Email
                </label>
                <Input
                  id="login-email"
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  autoComplete="email"
                  required
                  placeholder="example@shadcnspace.com"
                />
              </div>

              <div className="space-y-2">
                <label
                  className="text-xs font-medium uppercase tracking-wide text-zinc-500"
                  htmlFor="login-password"
                >
                  Password
                </label>
                <Input
                  id="login-password"
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  autoComplete={
                    isRegisterMode ? "new-password" : "current-password"
                  }
                  required
                  minLength={6}
                  placeholder="Enter your password"
                />
              </div>

              <div className="flex items-center justify-between gap-3 text-sm">
                <label className="flex items-center gap-2 text-zinc-600">
                  <Checkbox checked={remember} onCheckedChange={setRemember} />
                  Remember this device
                </label>
                <button
                  type="button"
                  className="text-zinc-600 transition-colors hover:text-zinc-950"
                >
                  Forgot password?
                </button>
              </div>

              <Button
                type="submit"
                id="submit-auth-button"
                className="h-11 w-full rounded-xl bg-zinc-900 text-white hover:bg-zinc-900/90"
                disabled={submitting}
              >
                {submitting ? (
                  <LoaderSpinner className="h-5 w-5 animate-spin text-white" />
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <Key className="h-4 w-4" />
                    {isRegisterMode ? "Create account" : "Sign in"}
                  </span>
                )}
              </Button>

              <p className="text-center text-sm text-zinc-500">
                {isRegisterMode
                  ? "Already have an account?"
                  : "Don’t have an account?"}{" "}
                <button
                  type="button"
                  className="font-medium text-zinc-900 hover:underline"
                  onClick={() => setMode(isRegisterMode ? "login" : "register")}
                >
                  {isRegisterMode ? "Sign in" : "Create an account"}
                </button>
              </p>
            </form>
          </CardContent>
        </Card>

        <Card className="w-full max-w-md border-zinc-200 bg-zinc-50 shadow-sm">
          <CardHeader className="space-y-1">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-zinc-500" />
              <CardTitle className="text-base font-semibold text-zinc-950">
                Demo quick login
              </CardTitle>
            </div>
            <CardDescription className="text-sm text-zinc-500">
              Switch personas without leaving the clean Shadcn layout.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            {DEMO_PERSONAS.map((persona) => (
              <button
                key={persona.username}
                type="button"
                id={`quick-login-${persona.username}`}
                disabled={submitting}
                onClick={() => handleQuickLogin(persona.username)}
                className="rounded-xl border border-zinc-200 bg-white p-3 text-left transition-colors hover:bg-zinc-100"
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 rounded-lg border border-zinc-200 bg-zinc-50 p-2 text-zinc-900">
                    <LogIn className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="truncate text-sm font-semibold text-zinc-950">
                        {persona.label}
                      </span>
                      <Badge
                        variant="outline"
                        className="rounded-full px-2 py-0.5 text-[9px] uppercase tracking-wide text-zinc-700"
                      >
                        {persona.role}
                      </Badge>
                    </div>
                    <p className="text-xs leading-relaxed text-zinc-500">
                      {persona.desc}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </CardContent>
        </Card>
      </section>
    </main>
  );
}

function LoaderSpinner({ className, ...props }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}
