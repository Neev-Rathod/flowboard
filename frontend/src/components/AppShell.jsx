import { NavLink, Outlet } from "react-router-dom";
import { LayoutDashboard, Users, Workflow } from "lucide-react";

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
    <div className="min-h-screen text-slate-100">
      <div className="mx-auto grid min-h-screen max-w-400 gap-6 p-4 md:grid-cols-[280px_1fr] md:p-6">
        <aside className="flex flex-col rounded-4xl border border-white/10 bg-slate-950/55 p-4 shadow-[0_30px_120px_rgba(15,23,42,0.4)] backdrop-blur-2xl">
          <div className="space-y-4 p-2">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-sky-200/70">
                Flowboard
              </p>
              <h1 className="mt-2 text-2xl font-semibold text-white">
                Company Flow
              </h1>
            </div>
            <Badge variant="success" className="w-fit">
              {user?.role || "employee"}
            </Badge>
          </div>

          <Separator className="my-4 bg-white/10" />

          <nav className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    [
                      "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm transition",
                      isActive
                        ? "bg-sky-400 text-slate-950"
                        : "text-slate-300 hover:bg-white/5 hover:text-white",
                    ].join(" ")
                  }
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </NavLink>
              );
            })}
          </nav>

          <div className="mt-auto space-y-4 p-2">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                Current User
              </p>
              <p className="mt-2 font-medium text-white">{user?.username}</p>
              <p className="mt-1 text-sm text-slate-400">{user?.job_title}</p>
            </div>
            <Button variant="outline" className="w-full" onClick={logout}>
              Sign out
            </Button>
          </div>
        </aside>

        <main className="flex min-h-screen flex-col gap-6">
          <header className="rounded-4xl border border-white/10 bg-slate-950/55 px-6 py-4 shadow-[0_30px_120px_rgba(15,23,42,0.28)] backdrop-blur-2xl">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-slate-400">
                  API
                </p>
                <p className="mt-1 text-sm text-slate-300">{apiBase}</p>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-300">
                <Badge variant="outline">{user?.email}</Badge>
                <Badge variant="secondary">{user?.job_title}</Badge>
              </div>
            </div>
          </header>

          <div className="min-h-0 flex-1 overflow-hidden rounded-4xl border border-white/10 bg-white/6 p-4 shadow-[0_30px_120px_rgba(15,23,42,0.2)] backdrop-blur-xl md:p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
