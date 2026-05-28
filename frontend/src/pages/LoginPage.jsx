import { useEffect, useMemo, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { ArrowRight, Building2, Key, LogIn, Sparkles } from "lucide-react";

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

const emptyLoginForm = {
  username: "",
  password: "",
};

const emptyOrgForm = {
  organization_name: "",
  admin_username: "",
  admin_email: "",
  password: "",
};

const DEMO_PERSONAS = [
  {
    label: "Platform Admin",
    username: "admin1",
    role: "Admin",
    desc: "Builds and manages the workspace",
  },
  {
    label: "Engineering Mgr",
    username: "engmgr1",
    role: "Manager",
    desc: "Assigns workflows to the team",
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
    desc: "Tests user flows and checks regressions",
  },
  {
    label: "DevOps Engineer",
    username: "devops1",
    role: "DevOps",
    desc: "Handles CI/CD releases and smoke testing",
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
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = useMemo(
    () => new URLSearchParams(location.search),
    [location.search],
  );
  const initialMode =
    searchParams.get("mode") === "create-organization"
      ? "create-organization"
      : "login";
  const [mode, setMode] = useState(initialMode);
  const [loginForm, setLoginForm] = useState(emptyLoginForm);
  const [orgForm, setOrgForm] = useState(emptyOrgForm);
  const [submitting, setSubmitting] = useState(false);
  const [remember, setRemember] = useState(true);

  const isCreateOrgMode = mode === "create-organization";
  const from = location.state?.from?.pathname || "/dashboard";

  useEffect(() => {
    document.title = isCreateOrgMode
      ? "Create Organization | Flowboard"
      : "Sign In | Flowboard";

    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement("meta");
      metaDesc.setAttribute("name", "description");
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute(
      "content",
      isCreateOrgMode
        ? "Create a new Flowboard organization, set the first admin, and start structuring your reporting hierarchy."
        : "Sign in to Flowboard to run hierarchical workflow handoffs, track team assignments, and coordinate cross-functional releases.",
    );
  }, [isCreateOrgMode]);

  const handleLoginChange = (event) => {
    const { name, value } = event.target;
    setLoginForm((current) => ({ ...current, [name]: value }));
  };

  const handleOrgChange = (event) => {
    const { name, value } = event.target;
    setOrgForm((current) => ({ ...current, [name]: value }));
  };

  const submitLogin = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");
    setSubmitting(true);

    try {
      await login({
        endpoint: "/auth/login",
        body: {
          username: loginForm.username.trim(),
          password: loginForm.password,
        },
      });
      setLoginForm(emptyLoginForm);
      setMessage("Welcome back.");
      navigate(from, { replace: true });
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSubmitting(false);
    }
  };

  const submitOrganization = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");
    setSubmitting(true);

    try {
      await login({
        endpoint: "/auth/register-organization",
        body: {
          organization_name: orgForm.organization_name.trim(),
          admin_username: orgForm.admin_username.trim(),
          admin_email: orgForm.admin_email.trim(),
          password: orgForm.password,
        },
      });
      setOrgForm(emptyOrgForm);
      setMessage("Organization created successfully.");
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
          username,
          password: "password123",
        },
      });
      setLoginForm(emptyLoginForm);
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
      <div className="flex min-h-screen items-center justify-center bg-[#050505] text-zinc-50">
        <div className="flex items-center gap-3 rounded-2xl border border-zinc-800 bg-zinc-950 px-8 py-5 text-sm font-medium shadow-2xl">
          <LoaderSpinner className="h-5 w-5 animate-spin text-violet-400" />
          <span>Loading secure session...</span>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#050505] px-6 py-8 text-zinc-50 md:px-10">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(168,85,247,0.18),_transparent_34%),radial-gradient(circle_at_bottom_right,_rgba(14,165,233,0.12),_transparent_28%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:56px_56px] opacity-20" />

      <section className="relative z-10 mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-6xl flex-col justify-center gap-6">
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <Card className="border-zinc-800 bg-zinc-950/80 shadow-[0_30px_120px_-50px_rgba(0,0,0,0.85)] backdrop-blur-xl">
            <CardHeader className="space-y-5">
              <Button
  type="button"
  variant="outline"
  className="h-11 rounded-xl border-zinc-800 bg-zinc-950 px-5 font-semibold text-zinc-100 hover:bg-zinc-900"
  onClick={() => navigate("/")}
>
  Back to landing page
</Button>
              <Badge
                variant="outline"
                className="w-fit rounded-full border-violet-500/30 bg-violet-500/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.3em] text-violet-200"
              >
                Flowboard workspace
              </Badge>
              <div className="space-y-4">
                <CardTitle className="max-w-xl text-4xl font-semibold tracking-tight text-zinc-50 md:text-5xl">
                  Manage work, hierarchy, and execution from one dark control
                  room.
                </CardTitle>
                <CardDescription className="max-w-xl text-base leading-relaxed text-zinc-400">
                  Create an organization, assign the first admin, and start
                  building workflows that run as soon as they are created.
                </CardDescription>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                {[
                  ["Workflow canvas", "Build stage-by-stage boards"],
                  ["Hierarchy canvas", "Map reporting lines visually"],
                  ["Task boards", "Track backlog to completed"],
                ].map(([title, copy]) => (
                  <div
                    key={title}
                    className="rounded-2xl border border-zinc-800 bg-white/5 p-4"
                  >
                    <p className="text-sm font-semibold text-zinc-50">
                      {title}
                    </p>
                    <p className="mt-1 text-sm text-zinc-400">{copy}</p>
                  </div>
                ))}
              </div>
            </CardHeader>
            <CardContent className="space-y-4 pt-0">
              <div className="flex flex-wrap gap-3">
                <Button
                  type="button"
                  className="h-11 rounded-xl bg-violet-500 px-5 font-semibold text-white hover:bg-violet-400"
                  onClick={() => setMode("create-organization")}
                >
                  Create organization
                  <ArrowRight className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="h-11 rounded-xl border-zinc-800 bg-zinc-950 px-5 font-semibold text-zinc-100 hover:bg-zinc-900"
                  onClick={() => navigate("/login")}
                >
                  Sign in
                </Button>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                {[
                  ["99.9%", "workspace uptime"],
                  ["4 lanes", "kanban task flow"],
                  ["1 admin", "creator owns the org"],
                ].map(([value, label]) => (
                  <div
                    key={value}
                    className="rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3"
                  >
                    <p className="text-2xl font-semibold text-zinc-50">
                      {value}
                    </p>
                    <p className="text-sm text-zinc-400">{label}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="border-zinc-800 bg-zinc-950/90 shadow-[0_24px_100px_-45px_rgba(0,0,0,0.9)] backdrop-blur-xl">
              <CardHeader className="space-y-3 border-b border-zinc-800">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-violet-300" />
                  <CardTitle className="text-xl font-semibold text-zinc-50">
                    {isCreateOrgMode ? "Create organization" : "Sign in"}
                  </CardTitle>
                </div>
                <CardDescription className="text-zinc-400">
                  {isCreateOrgMode
                    ? "The person who creates the organization becomes the admin."
                    : "Enter your workspace credentials to continue."}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-5 pt-6">
                {error ? (
                  <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                    {error}
                  </div>
                ) : null}

                {message ? (
                  <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
                    {message}
                  </div>
                ) : null}

                {isCreateOrgMode ? (
                  <form className="space-y-4" onSubmit={submitOrganization}>
                    <div className="space-y-2">
                      <label
                        className="text-xs font-medium uppercase tracking-wide text-zinc-400"
                        htmlFor="org-name"
                      >
                        Organization name
                      </label>
                      <Input
                        id="org-name"
                        name="organization_name"
                        value={orgForm.organization_name}
                        onChange={handleOrgChange}
                        placeholder="Flowboard Labs"
                        autoComplete="organization"
                        required
                      />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <label
                          className="text-xs font-medium uppercase tracking-wide text-zinc-400"
                          htmlFor="org-admin-username"
                        >
                          Admin username
                        </label>
                        <Input
                          id="org-admin-username"
                          name="admin_username"
                          value={orgForm.admin_username}
                          onChange={handleOrgChange}
                          placeholder="admin1"
                          autoComplete="username"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label
                          className="text-xs font-medium uppercase tracking-wide text-zinc-400"
                          htmlFor="org-admin-email"
                        >
                          Admin email
                        </label>
                        <Input
                          id="org-admin-email"
                          name="admin_email"
                          type="email"
                          value={orgForm.admin_email}
                          onChange={handleOrgChange}
                          placeholder="admin@flowboard.dev"
                          autoComplete="email"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label
                        className="text-xs font-medium uppercase tracking-wide text-zinc-400"
                        htmlFor="org-password"
                      >
                        Password
                      </label>
                      <Input
                        id="org-password"
                        name="password"
                        type="password"
                        value={orgForm.password}
                        onChange={handleOrgChange}
                        autoComplete="new-password"
                        minLength={6}
                        required
                      />
                    </div>

                    <Button
                      type="submit"
                      className="h-11 w-full rounded-xl bg-violet-500 text-white hover:bg-violet-400"
                      disabled={submitting}
                    >
                      {submitting ? (
                        <LoaderSpinner className="h-5 w-5 animate-spin" />
                      ) : (
                        <Building2 className="h-4 w-4" />
                      )}
                      {submitting
                        ? "Creating organization..."
                        : "Create organization"}
                    </Button>
                  </form>
                ) : (
                  <form className="space-y-4" onSubmit={submitLogin}>
                    <div className="space-y-2">
                      <label
                        className="text-xs font-medium uppercase tracking-wide text-zinc-400"
                        htmlFor="login-username"
                      >
                        Username
                      </label>
                      <Input
                        id="login-username"
                        name="username"
                        value={loginForm.username}
                        onChange={handleLoginChange}
                        autoComplete="username"
                        required
                        placeholder="admin1"
                      />
                    </div>

                    <div className="space-y-2">
                      <label
                        className="text-xs font-medium uppercase tracking-wide text-zinc-400"
                        htmlFor="login-password"
                      >
                        Password
                      </label>
                      <Input
                        id="login-password"
                        name="password"
                        type="password"
                        value={loginForm.password}
                        onChange={handleLoginChange}
                        autoComplete="current-password"
                        required
                        minLength={6}
                        placeholder="Enter your password"
                      />
                    </div>

                    <div className="flex items-center justify-between gap-3 text-sm">
                      <label className="flex items-center gap-2 text-zinc-300">
                        <Checkbox
                          checked={remember}
                          onCheckedChange={setRemember}
                        />
                        Remember this device
                      </label>
                      <button
                        type="button"
                        className="text-zinc-400 transition-colors hover:text-zinc-100"
                      >
                        Forgot password?
                      </button>
                    </div>

                    <Button
                      type="submit"
                      className="h-11 w-full rounded-xl bg-violet-500 text-white hover:bg-violet-400"
                      disabled={submitting}
                    >
                      {submitting ? (
                        <LoaderSpinner className="h-5 w-5 animate-spin" />
                      ) : (
                        <span className="flex items-center justify-center gap-2">
                          <Key className="h-4 w-4" />
                          Sign in
                        </span>
                      )}
                    </Button>
                  </form>
                )}

                <div className="flex items-center justify-between gap-3 border-t border-zinc-800 pt-4">
                  <p className="text-sm text-zinc-400">
                    {isCreateOrgMode
                      ? "Already created an organization?"
                      : "Need to create a workspace?"}
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-xl border-zinc-800 bg-zinc-950 text-zinc-100 hover:bg-zinc-900"
                    onClick={() =>
                      setMode(isCreateOrgMode ? "login" : "create-organization")
                    }
                  >
                    {isCreateOrgMode
                      ? "Back to sign in"
                      : "Create organization"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="border-zinc-800 bg-zinc-950/90 shadow-[0_24px_100px_-45px_rgba(0,0,0,0.9)] backdrop-blur-xl">
              <CardHeader className="space-y-1">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-violet-300" />
                  <CardTitle className="text-base font-semibold text-zinc-50">
                    Demo quick login
                  </CardTitle>
                </div>
                <CardDescription className="text-sm text-zinc-400">
                  Switch personas without leaving the dark layout.
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
                    className="rounded-xl border border-zinc-800 bg-zinc-950 p-3 text-left transition-colors hover:bg-zinc-900"
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 rounded-lg border border-zinc-800 bg-zinc-900 p-2 text-zinc-100">
                        <LogIn className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="truncate text-sm font-semibold text-zinc-50">
                            {persona.label}
                          </span>
                          <Badge
                            variant="outline"
                            className="rounded-full border-zinc-700 px-2 py-0.5 text-[9px] uppercase tracking-wide text-zinc-200"
                          >
                            {persona.role}
                          </Badge>
                        </div>
                        <p className="text-xs leading-relaxed text-zinc-400">
                          {persona.desc}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
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
