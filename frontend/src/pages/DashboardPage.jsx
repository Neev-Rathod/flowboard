import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  BarChart3,
  FolderKanban,
  LayoutGrid,
  Sparkles,
  Terminal,
  Workflow,
} from "lucide-react";

import { ActiveRunsTable } from "../components/ActiveRunsTable";
import DashboardSummary from "../components/DashboardSummary";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { useAuth } from "../context/AuthContext";

export function DashboardPage() {
  const { apiBase, token, user } = useAuth();
  const navigate = useNavigate();
  const [refreshKey, setRefreshKey] = useState(0);
  const [workflows, setWorkflows] = useState([]);
  const [workflowsLoading, setWorkflowsLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(true);

  // SEO & Head Metadata
  useEffect(() => {
    document.title = "Dashboard | Flowboard Org Orchestrator";

    // Manage meta description
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement("meta");
      metaDesc.setAttribute("name", "description");
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute(
      "content",
      "Flowboard dashboard - manage workflows, view active team assignments, and verify progress.",
    );
  }, []);

  const headers = useMemo(
    () => ({
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    }),
    [token],
  );

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [workflowsResponse, summaryResponse] = await Promise.all([
          fetch(`${apiBase}/workflows/`, { headers }),
          fetch(`${apiBase}/workflows/dashboard/summary`, { headers }),
        ]);

        if (!workflowsResponse.ok || !summaryResponse.ok) {
          throw new Error("Failed to load active workflows");
        }

        setWorkflows(await workflowsResponse.json());
        setSummary(await summaryResponse.json());
      } catch (error) {
        console.error(error);
      } finally {
        setWorkflowsLoading(false);
        setSummaryLoading(false);
      }
    };

    loadDashboard();
  }, [apiBase, headers, refreshKey]);

  const statCards = [
    {
      label: "Workflows",
      value: summary?.workflow_count ?? 0,
      note: "Active templates in the workspace",
      icon: Workflow,
    },
    {
      label: "Tasks",
      value: summary?.task_count ?? 0,
      note: "All task nodes across active boards",
      icon: FolderKanban,
    },
    {
      label: "Completed",
      value: summary?.completed_task_count ?? 0,
      note: "Finished items across all stages",
      icon: LayoutGrid,
    },
    {
      label: "Completion",
      value: `${summary?.completion_percent ?? 0}%`,
      note: "Current completion rate",
      icon: BarChart3,
    },
  ];

  const workflowMetrics = useMemo(() => {
    return workflows.slice(0, 6).map((workflow) => {
      const tasks = workflow.stages?.flatMap((s) => s.tasks || []) || [];
      const total = tasks.length;
      const completed = tasks.filter((t) => t.status === "completed" || t.status === "done").length;
      const inProgress = tasks.filter((t) => t.status === "in-progress" || t.status === "pending").length;
      const todo = total - completed - inProgress;

      return {
        id: workflow.id,
        label: workflow.title,
        total,
        completed,
        inProgress,
        todo,
        stagesCount: workflow.stages?.length || 0,
      };
    });
  }, [workflows]);


  return (
    <main
      className="space-y-6 animate-fade-in bg-[#050505]"
      id="dashboard-main-container"
    >
      <Card
        id="welcome-card-banner"
        className="overflow-hidden border-zinc-800 bg-zinc-950/90 shadow-[0_30px_120px_-60px_rgba(0,0,0,0.9)] backdrop-blur-xl"
      >
        <CardHeader className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Badge
                  id="user-role-badge"
                  variant="secondary"
                  className="rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide text-zinc-200"
                >
                  {user?.role || "employee"}
                </Badge>
                <Badge
                  id="user-job-title-badge"
                  variant="outline"
                  className="rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide text-zinc-200"
                >
                  {user?.job_title || "Employee"}
                </Badge>
              </div>
              <CardTitle
                id="welcome-title-heading"
                className="flex items-center gap-3 text-3xl font-semibold tracking-tight text-zinc-50 md:text-5xl"
              >
                <span>Operations command center</span>
                <Sparkles className="h-6 w-6 text-violet-300" />
              </CardTitle>
              <p className="max-w-2xl text-sm leading-relaxed text-zinc-400 md:text-base">
                Track live assignments, review workflow health, and jump
                straight into active boards from a single dark dashboard.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                variant="outline"
                className="rounded-xl border-zinc-800 bg-zinc-950 text-zinc-100 hover:bg-zinc-900"
                onClick={() => navigate("/workflows")}
              >
                View workflows
              </Button>
              <Button
                type="button"
                className="rounded-xl bg-violet-500 text-white hover:bg-violet-400"
                onClick={() => navigate("/workflows")}
              >
                Quick create
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {statCards.map((card) => {
              const Icon = card.icon;
              return (
                <div
                  key={card.label}
                  className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                        {card.label}
                      </p>
                      <div className="mt-2 text-3xl font-semibold text-zinc-50">
                        {summaryLoading ? "—" : card.value}
                      </div>
                    </div>
                    <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-2 text-violet-300">
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-zinc-400">
                    {card.note}
                  </p>
                </div>
              );
            })}
          </div>
        </CardHeader>
      </Card>

      <div className="bg-transparent" id="dashboard-grid-layout">
        <section className="space-y-6 mb-6" id="dashboard-work-section">
          <Card
            id="dashboard-analytics-card"
            className="border-zinc-800 bg-zinc-950/90 shadow-[0_24px_100px_-45px_rgba(0,0,0,0.85)] backdrop-blur-xl"
          >
            <CardHeader className="border-b border-zinc-800 pb-4">
              <CardTitle className="flex items-center gap-2 text-lg font-semibold text-zinc-50">
                <Terminal className="h-5 w-5 text-violet-300" />
                Dashboard metrics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                    <div className="flex-1 space-y-2">
                      <p className="text-xs uppercase tracking-[0.2em] text-zinc-500 font-semibold">
                        Completion rate
                      </p>
                      <p className="text-sm text-zinc-400">
                        Completed tasks versus the total visible work across all your active workflows.
                      </p>
                      <div className="mt-4 flex flex-wrap gap-4 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="h-3 w-3 rounded-full bg-violet-500" />
                          <span className="text-zinc-300">Completed</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="h-3 w-3 rounded-full bg-zinc-800" />
                          <span className="text-zinc-300">Remaining</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="relative flex items-center justify-center h-32 w-32 shrink-0">
                      <svg viewBox="0 0 100 100" className="h-full w-full overflow-visible">
                        <circle
                          cx="50"
                          cy="50"
                          r="40"
                          stroke="#18181b"
                          strokeWidth="8"
                          fill="transparent"
                        />
                        <circle
                          cx="50"
                          cy="50"
                          r="40"
                          stroke="#8b5cf6"
                          strokeWidth="8"
                          fill="transparent"
                          strokeDasharray={2 * Math.PI * 40}
                          strokeDashoffset={2 * Math.PI * 40 * (1 - (summary?.completion_percent ?? 0) / 100)}
                          strokeLinecap="round"
                          transform="rotate(-90 50 50)"
                          className="transition-all duration-500 ease-out"
                        />
                      </svg>
                      <div className="absolute flex flex-col items-center">
                        <span className="text-2xl font-bold text-white tracking-tight leading-none">
                          {summary?.completion_percent ?? 0}%
                        </span>
                        <span className="text-[10px] uppercase tracking-wider text-zinc-500 mt-1">
                          done
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                    Operational focus
                  </p>
                  <div className="mt-4 space-y-3 text-sm text-zinc-300">
                    <div className="flex items-center justify-between gap-3 rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2">
                      <span>Overdue tasks</span>
                      <span className="font-semibold text-rose-300">
                        {summary?.overdue_task_count ?? 0}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-3 rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2">
                      <span>Active workflows</span>
                      <span className="font-semibold text-zinc-50">
                        {summary?.workflow_count ?? 0}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-3 rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2">
                      <span>Total tasks</span>
                      <span className="font-semibold text-zinc-50">
                        {summary?.task_count ?? 0}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 xl:grid-cols-2">
                <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6 xl:col-span-2">
                  <div className="flex items-center justify-between gap-3 mb-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-zinc-500 font-semibold">
                        Workflow Task Progress
                      </p>
                      <p className="mt-1 text-sm text-zinc-400">
                        Detailed health and completion state per active template.
                      </p>
                    </div>
                  </div>

                  {workflowMetrics.length ? (
                    <div className="space-y-4 pt-2">
                      {workflowMetrics.map((wf) => {
                        const total = wf.total || 1;
                        const pctComp = Math.round((wf.completed / total) * 100);
                        const pctProg = Math.round((wf.inProgress / total) * 100);
                        const pctTodo = 100 - pctComp - pctProg;

                        return (
                          <div key={wf.id} className="space-y-2 rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 transition hover:border-zinc-700">
                            <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
                              <span className="font-semibold text-zinc-50">{wf.label}</span>
                              <div className="flex items-center gap-3 text-xs text-zinc-400">
                                <span>{wf.stagesCount} stages</span>
                                <span>•</span>
                                <span>{wf.total} task{wf.total === 1 ? "" : "s"}</span>
                              </div>
                            </div>

                            {wf.total > 0 ? (
                              <div className="space-y-1.5">
                                <div className="h-3 w-full overflow-hidden rounded-full bg-zinc-800 flex">
                                  <div
                                    className="h-full bg-emerald-500 transition-all duration-300"
                                    style={{ width: `${pctComp}%` }}
                                    title={`Completed: ${wf.completed}`}
                                  />
                                  <div
                                    className="h-full bg-violet-500 transition-all duration-300"
                                    style={{ width: `${pctProg}%` }}
                                    title={`In Progress: ${wf.inProgress}`}
                                  />
                                  <div
                                    className="h-full bg-zinc-700 transition-all duration-300"
                                    style={{ width: `${pctTodo}%` }}
                                    title={`Remaining: ${wf.todo}`}
                                  />
                                </div>
                                <div className="flex items-center justify-between text-[11px] text-zinc-500">
                                  <div className="flex gap-3">
                                    <span className="flex items-center gap-1">
                                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                      {wf.completed} Completed ({pctComp}%)
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <span className="h-1.5 w-1.5 rounded-full bg-violet-500" />
                                      {wf.inProgress} In-Progress ({pctProg}%)
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <span className="h-1.5 w-1.5 rounded-full bg-zinc-500" />
                                      {wf.todo} To Do ({pctTodo}%)
                                    </span>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div className="text-xs text-zinc-500 italic">No tasks registered in this workflow.</div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/50 p-8 text-center text-sm text-zinc-400">
                      Create workflows to display active metrics.
                    </div>
                  )}
                </div>
              </div>

              <DashboardSummary
                key={`summary-${refreshKey}`}
                apiBase={apiBase}
                token={token}
              />
            </CardContent>
          </Card>
        </section>

        <section id="dashboard-workflows-section">
          <ActiveRunsTable
            workflows={workflows}
            onOpenWorkflow={(workflowId) =>
              navigate(`/workflows/${workflowId}/board`)
            }
            loading={workflowsLoading}
          />
        </section>
      </div>
    </main>
  );
}
