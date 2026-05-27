import { NavLink, Outlet } from "react-router-dom";
import { LayoutDashboard, Users, Workflow, LogOut, Cpu } from "lucide-react";

import { useAuth } from "../context/AuthContext";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Separator } from "./ui/separator";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/workflows", label: "Workflows", icon: Workflow },
  { to: "/organization", label: "Organization", icon: Users },
];

export function AppShell() {
  const { user, apiBase, logout } = useAuth();

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-950">
      <div className="absolute inset-x-0 top-0 h-64 bg-[radial-gradient(circle_at_top,_rgba(24,24,27,0.05),_transparent_60%)] pointer-events-none" />

      <div className="mx-auto grid min-h-screen max-w-7xl gap-6 p-4 md:grid-cols-[260px_1fr] md:p-6 relative z-10">
        <aside className="sticky top-6 flex h-[calc(100vh-3rem)] flex-col rounded-3xl border border-zinc-200 bg-white p-4 shadow-sm">
          <div className="space-y-4 p-2">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-zinc-900 p-2 text-white shadow-sm">
                <Cpu className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-zinc-500">
                  Flowboard
                </p>
                <h1 className="mt-1 text-lg font-semibold tracking-tight text-zinc-950">
                  Company Flow
                </h1>
              </div>
            </div>
          </div>

          <Separator className="my-4 bg-zinc-200" />

          <nav className="flex-1 space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    [
                      "flex items-center gap-3 rounded-xl px-4 py-3 text-xs font-semibold uppercase tracking-wide transition-colors",
                      isActive
                        ? "bg-zinc-900 text-zinc-50 shadow-sm"
                        : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950",
                    ].join(" ")
                  }
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>

          <div className="mt-auto space-y-4 p-1">
            <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 shadow-sm">
              <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-zinc-500">
                Current Identity
              </p>
              <div className="mt-2 space-y-1">
                <p className="truncate text-sm font-semibold tracking-tight text-zinc-950">
                  {user?.username}
                </p>
                <p className="truncate text-xs text-zinc-500">
                  {user?.job_title}
                </p>
              </div>
              <div className="mt-3 flex items-center gap-1.5">
                <Badge className="rounded-md border border-zinc-200 bg-white px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider text-zinc-700">
                  {user?.role || "employee"}
                </Badge>
              </div>
            </div>

            <Button
              variant="outline"
              className="h-10 w-full rounded-xl border-zinc-200 text-zinc-700 hover:bg-zinc-100 hover:text-zinc-950"
              onClick={logout}
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </aside>

        <div className="flex min-h-0 flex-col gap-6">
          <header className="rounded-3xl border border-zinc-200 bg-white px-6 py-4 shadow-sm">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="space-y-1">
                <span className="text-[9px] font-extrabold uppercase tracking-[0.28em] text-zinc-500">
                  SYSTEM CORE API
                </span>
                <p className="rounded-lg border border-zinc-200 bg-zinc-50 px-2.5 py-1 font-mono text-xs text-zinc-600">
                  {apiBase}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge
                  variant="outline"
                  className="rounded-full px-3 py-1 text-xs text-zinc-700"
                >
                  {user?.email}
                </Badge>
                <Badge
                  variant="secondary"
                  className="rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider text-zinc-900"
                >
                  {user?.job_title}
                </Badge>
              </div>
            </div>
          </header>

          <div className="min-h-0 flex-1 overflow-hidden rounded-3xl border border-zinc-200 bg-white p-4 shadow-sm md:p-6">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}
