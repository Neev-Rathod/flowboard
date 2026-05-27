import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, Terminal } from "lucide-react";

import { ActiveRunsTable } from "../components/ActiveRunsTable";
import DashboardSummary from "../components/DashboardSummary";
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
    const loadWorkflows = async () => {
      try {
        const workflowsResponse = await fetch(`${apiBase}/workflows/`, {
          headers,
        });

        if (!workflowsResponse.ok) {
          throw new Error("Failed to load active workflows");
        }

        setWorkflows(await workflowsResponse.json());
      } catch (error) {
        console.error(error);
      } finally {
        setWorkflowsLoading(false);
      }
    };

    loadWorkflows();
  }, [apiBase, headers, refreshKey]);

  return (
    <main className="space-y-6 animate-fade-in" id="dashboard-main-container">
      <Card
        id="welcome-card-banner"
        className="border-zinc-200 bg-white shadow-sm"
      >
        <CardHeader>
          <div className="flex items-center gap-2">
            <Badge
              id="user-role-badge"
              variant="secondary"
              className="rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide text-zinc-700"
            >
              {user?.role || "employee"}
            </Badge>
            <Badge
              id="user-job-title-badge"
              variant="outline"
              className="rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide text-zinc-700"
            >
              {user?.job_title || "Employee"}
            </Badge>
          </div>
          <CardTitle
            id="welcome-title-heading"
            className="mt-3 flex items-center gap-2 text-3xl font-semibold tracking-tight text-zinc-950 md:text-4xl"
          >
            <span>Welcome back, {user?.username}</span>
            <Sparkles className="h-6 w-6 text-zinc-500" />
          </CardTitle>
        </CardHeader>
        <CardContent className="max-w-2xl text-sm leading-relaxed text-zinc-600">
          Track live assignments, monitor completion analytics, and jump
          straight into the active run boards without the workflow builder
          crowding your dashboard.
        </CardContent>
      </Card>

      <div
        className="grid gap-6 xl:grid-cols-[1fr_1fr]"
        id="dashboard-grid-layout"
      >
        <section className="space-y-6" id="dashboard-work-section">
          <Card
            id="dashboard-analytics-card"
            className="border-zinc-200 bg-white shadow-sm"
          >
            <CardHeader className="border-b border-zinc-200 pb-3">
              <CardTitle className="flex items-center gap-2 text-lg font-semibold text-zinc-950">
                <Terminal className="h-5 w-5 text-zinc-500" />
                Dashboard metrics
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
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
