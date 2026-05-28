import { useEffect } from "react";
import { ArrowRight, BarChart3, Building2, Network, Sparkles, Workflow } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";

const features = [
  {
    icon: Workflow,
    title: "Workflow boards",
    description: "Run work as soon as it is created, with stage-by-stage visibility and progress markers.",
  },
  {
    icon: Network,
    title: "Organization canvas",
    description: "See the reporting hierarchy as a canvas and inspect or edit any employee instantly.",
  },
  {
    icon: BarChart3,
    title: "Task analytics",
    description: "Backlog, in progress, to do, and completed lanes stay visible across the whole workspace.",
  },
];

const stats = [
  ["1 click", "create an organization"],
  ["4 lanes", "workflow task clarity"],
  ["Dark first", "built for focus"],
];

export function LandingPage() {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Flowboard | Org orchestration for teams";

    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement("meta");
      metaDesc.setAttribute("name", "description");
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute(
      "content",
      "Flowboard helps teams create an organization, map reporting lines, and run workflows on a dark canvas-first workspace.",
    );
  }, []);

  return (
    <main className="min-h-screen overflow-hidden bg-[#050505] text-zinc-50">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(168,85,247,0.22),_transparent_32%),radial-gradient(circle_at_bottom_right,_rgba(14,165,233,0.12),_transparent_28%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:64px_64px] opacity-20" />

      <header className="relative z-10 border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 md:px-10">
          <Link to="/" className="flex items-center gap-3">
            <div className="rounded-xl bg-violet-500 p-2 text-white shadow-[0_8px_30px_-12px_rgba(168,85,247,0.75)]">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-zinc-400">
                Flowboard
              </p>
              <p className="text-sm font-semibold text-zinc-50">Org orchestration</p>
            </div>
          </Link>

          <nav className="hidden items-center gap-6 text-sm text-zinc-300 md:flex">
            <a href="#features" className="transition-colors hover:text-zinc-50">Features</a>
            <a href="#pricing" className="transition-colors hover:text-zinc-50">Pricing</a>
            <a href="#why" className="transition-colors hover:text-zinc-50">Why Flowboard</a>
          </nav>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              className="rounded-full border-zinc-800 bg-zinc-950 text-zinc-100 hover:bg-zinc-900"
              onClick={() => navigate("/login")}
            >
              Sign in
            </Button>
            <Button
              type="button"
              className="rounded-full bg-violet-500 text-white hover:bg-violet-400"
              onClick={() => navigate("/login?mode=create-organization")}
            >
              Create organization
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <section className="relative z-10 mx-auto grid min-h-[calc(100vh-5rem)] max-w-7xl gap-12 px-6 py-14 md:px-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:py-20">
        <div className="space-y-8">
          <Badge
            variant="outline"
            className="w-fit rounded-full border-violet-500/30 bg-violet-500/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.3em] text-violet-200"
          >
            Manage work smarter
          </Badge>

          <div className="space-y-4">
            <h1 className="max-w-2xl text-5xl font-semibold tracking-tight text-zinc-50 md:text-7xl">
              Create an organization.
              <span className="block text-violet-300">Run workflows.</span>
            </h1>
            <p className="max-w-2xl text-lg leading-relaxed text-zinc-400 md:text-xl">
              A canvas-first workspace for reporting hierarchies, active workflow boards, and task progress that stays visible from backlog to done.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              type="button"
              className="h-12 rounded-xl bg-violet-500 px-6 font-semibold text-white hover:bg-violet-400"
              onClick={() => navigate("/login?mode=create-organization")}
            >
              Create organization
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="outline"
              className="h-12 rounded-xl border-zinc-800 bg-zinc-950 px-6 font-semibold text-zinc-100 hover:bg-zinc-900"
              onClick={() => navigate("/login")}
            >
              Sign in
            </Button>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {stats.map(([value, label]) => (
              <div key={label} className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4">
                <p className="text-2xl font-semibold text-zinc-50">{value}</p>
                <p className="mt-1 text-sm text-zinc-400">{label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <Card id="features" className="border-zinc-800 bg-zinc-950/85 shadow-[0_30px_120px_-60px_rgba(0,0,0,0.9)] backdrop-blur-xl">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-violet-300" />
                <CardTitle className="text-xl">Built for clarity</CardTitle>
              </div>
              <CardDescription>
                Every surface is dark, high contrast, and focused on the work.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-3">
              {features.map((feature) => {
                const Icon = feature.icon;
                return (
                  <div key={feature.title} className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
                    <div className="mb-3 inline-flex rounded-xl bg-violet-500/10 p-2 text-violet-300">
                      <Icon className="h-5 w-5" />
                    </div>
                    <p className="text-sm font-semibold text-zinc-50">{feature.title}</p>
                    <p className="mt-1 text-sm leading-relaxed text-zinc-400">{feature.description}</p>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2" id="why">
            <Card className="border-zinc-800 bg-zinc-950/85">
              <CardHeader>
                <CardTitle className="text-lg">What you get</CardTitle>
                <CardDescription>
                  A single workspace for the org chart, workflows, and active tasks.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-zinc-300">
                <p>• Create one organization and make the creator the admin.</p>
                <p>• Keep the hierarchy editable on a canvas instead of static tables.</p>
                <p>• Track task notes and stage progress without leaving the board.</p>
              </CardContent>
            </Card>

            <Card className="border-zinc-800 bg-zinc-950/85">
              <CardHeader>
                <CardTitle className="text-lg">Pricing</CardTitle>
                <CardDescription>
                  Start small, scale with your team.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-zinc-300" id="pricing">
                <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
                  <p className="text-xs uppercase tracking-[0.3em] text-violet-200">Starter</p>
                  <p className="mt-2 text-2xl font-semibold text-zinc-50">Free</p>
                  <p className="mt-1 text-zinc-400">For small teams getting started.</p>
                </div>
                <div className="rounded-2xl border border-violet-500/30 bg-violet-500/10 p-4">
                  <p className="text-xs uppercase tracking-[0.3em] text-violet-200">Team</p>
                  <p className="mt-2 text-2xl font-semibold text-zinc-50">Organized</p>
                  <p className="mt-1 text-zinc-400">Everything you need to manage operations in one place.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </main>
  );
}
