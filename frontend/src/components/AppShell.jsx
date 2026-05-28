import { NavLink, Outlet } from "react-router-dom";
import {
  LayoutDashboard,
  ListTodo,
  Users,
  Workflow,
  LogOut,
  Cpu,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Separator } from "./ui/separator";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/tasks", label: "Tasks", icon: ListTodo },
  { to: "/workflows", label: "Workflows", icon: Workflow },
  { to: "/organization", label: "Organization", icon: Users },
];

export function AppShell() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-50">
      <div className="absolute inset-x-0 top-0 h-64 pointer-events-none bg-[radial-gradient(circle_at_top,_rgba(168,85,247,0.16),_transparent_60%)]" />

      <div className="relative z-10 flex min-h-screen flex-col">
        <header className="border-b border-zinc-800 bg-zinc-950/95 backdrop-blur-xl">
          <div className="flex w-full items-center justify-between gap-4 px-4 py-4 md:px-6">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-violet-500 p-2 text-white shadow-[0_8px_30px_-12px_rgba(168,85,247,0.75)]">
                <Cpu className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-zinc-400">
                  Flowboard
                </p>
                <h1 className="mt-1 text-lg font-semibold tracking-tight text-zinc-50">
                  Company Flow
                </h1>
              </div>
            </div>

            <nav className="flex flex-wrap items-center justify-center gap-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                      [
                        "flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wide transition-colors",
                        isActive
                          ? "bg-violet-500 text-white shadow-sm"
                          : "border border-zinc-800 bg-zinc-950 text-zinc-300 hover:bg-zinc-900 hover:text-zinc-50",
                      ].join(" ")
                    }
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </nav>

            <div className="hidden items-center gap-2 md:flex">
              <Badge
                variant="outline"
                className="rounded-full px-3 py-1 text-xs text-zinc-200"
              >
                {user?.email}
              </Badge>
              <Badge
                variant="secondary"
                className="rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider text-zinc-50"
              >
                {user?.job_title}
              </Badge>
              <Button
                variant="outline"
                className="h-10 rounded-full border-zinc-800 text-zinc-100 hover:bg-zinc-900 hover:text-zinc-50"
                onClick={logout}
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </Button>
            </div>
          </div>
        </header>

        <main className="flex-1 px-4 py-4 md:px-6 md:py-6">
          <div className="h-full min-h-[calc(100vh-5rem)] w-full overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-950 p-4 shadow-[0_30px_100px_-40px_rgba(0,0,0,0.8)] md:p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
