import { useMemo, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { ShieldCheck, Users, Workflow } from "lucide-react";

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
import { Input } from "../components/ui/input";

const emptyForm = {
  username: "",
  email: "",
  password: "",
};

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
  const navigate = useNavigate();
  const location = useLocation();

  const isRegisterMode = mode === "register";
  const from = location.state?.from?.pathname || "/dashboard";

  const subtitle = useMemo(() => {
    return isRegisterMode
      ? "Create your access account to enter the workflow platform."
      : "Sign in to manage the hierarchy, dashboards, and assignments.";
  }, [isRegisterMode]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const submitForm = async (event) => {
    event.preventDefault();
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
              username: form.username.trim(),
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

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-slate-100">
        <div className="rounded-3xl border border-white/10 bg-slate-950/60 px-6 py-4 text-sm backdrop-blur-xl">
          Loading session...
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <main className="min-h-screen px-6 py-10 text-slate-100 md:px-10">
      <section className="mx-auto grid min-h-[calc(100vh-5rem)] w-full max-w-6xl items-center gap-8 md:grid-cols-[1.05fr_0.95fr]">
        <div className="space-y-6">
          <Badge className="bg-sky-400/15 text-sky-100 border-sky-400/20">
            Flowboard for teams
          </Badge>
          <div className="space-y-4">
            <h1 className="max-w-2xl text-5xl font-semibold tracking-tight text-white md:text-7xl">
              Workflow orchestration built for real org hierarchies.
            </h1>
            <p className="max-w-xl text-base leading-7 text-slate-300 md:text-lg">
              Admins, managers, HR, and specialists can work from one routed
              workspace with staged assignments and reporting lines.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <Card className="border-white/10 bg-white/8">
              <CardContent className="p-4">
                <ShieldCheck className="h-5 w-5 text-sky-200" />
                <p className="mt-3 text-sm font-medium text-white">
                  Role-aware access
                </p>
              </CardContent>
            </Card>
            <Card className="border-white/10 bg-white/8">
              <CardContent className="p-4">
                <Users className="h-5 w-5 text-sky-200" />
                <p className="mt-3 text-sm font-medium text-white">
                  Hierarchy tree
                </p>
              </CardContent>
            </Card>
            <Card className="border-white/10 bg-white/8">
              <CardContent className="p-4">
                <Workflow className="h-5 w-5 text-sky-200" />
                <p className="mt-3 text-sm font-medium text-white">
                  Workflow runs
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        <Card className="border-white/10 bg-slate-950/45">
          <CardHeader className="flex items-start justify-between gap-4">
            <div>
              <CardTitle className="text-2xl text-white">
                {isRegisterMode ? "Create account" : "Welcome back"}
              </CardTitle>
              <CardDescription className="mt-1 text-slate-400">
                {subtitle}
              </CardDescription>
            </div>
            <div className="rounded-full border border-white/10 bg-white/5 p-1 text-sm">
              <Button
                type="button"
                variant={!isRegisterMode ? "default" : "ghost"}
                size="sm"
                onClick={() => setMode("login")}
              >
                Login
              </Button>
              <Button
                type="button"
                variant={isRegisterMode ? "default" : "ghost"}
                size="sm"
                onClick={() => setMode("register")}
              >
                Register
              </Button>
            </div>
          </CardHeader>

          <CardContent>
            <form className="space-y-4" onSubmit={submitForm}>
              <label className="block space-y-2">
                <span className="text-sm font-medium text-slate-300">
                  Username
                </span>
                <Input
                  type="text"
                  name="username"
                  value={form.username}
                  onChange={handleChange}
                  autoComplete="username"
                  required
                  placeholder="jane.doe"
                />
              </label>

              {isRegisterMode ? (
                <label className="block space-y-2">
                  <span className="text-sm font-medium text-slate-300">
                    Email
                  </span>
                  <Input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    autoComplete="email"
                    required
                    placeholder="jane@example.com"
                  />
                </label>
              ) : null}

              <label className="block space-y-2">
                <span className="text-sm font-medium text-slate-300">
                  Password
                </span>
                <Input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  autoComplete={
                    isRegisterMode ? "new-password" : "current-password"
                  }
                  required
                  minLength="6"
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

              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting
                  ? "Working..."
                  : isRegisterMode
                    ? "Create account"
                    : "Sign in"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
