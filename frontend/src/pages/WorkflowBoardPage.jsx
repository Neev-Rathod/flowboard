import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Layers3, Sparkles, Workflow } from "lucide-react";

import { WorkflowCanvas } from "../components/WorkflowCanvas";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { useAuth } from "../context/AuthContext";

export function WorkflowBoardPage() {
  const { apiBase, token } = useAuth();
  const { workflowId } = useParams();
  const navigate = useNavigate();
  const [workflow, setWorkflow] = useState(null);
  const [users, setUsers] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [loading, setLoading] = useState(true);

  const headers = useMemo(
    () => ({
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    }),
    [token],
  );

  useEffect(() => {
    document.title = `Workflow Canvas #${workflowId} | Flowboard`;

    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement("meta");
      metaDesc.setAttribute("name", "description");
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute(
      "content",
      `Flowboard workflow canvas #${workflowId}. Inspect the live workflow layout, review stage progress, and add or edit tasks on the canvas.`,
    );
  }, [workflowId]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [workflowResponse, usersResponse] = await Promise.all([
          fetch(`${apiBase}/workflows/${workflowId}`, { headers }),
          fetch(`${apiBase}/organization/users`, { headers }),
        ]);

        if (!workflowResponse.ok) {
          throw new Error("Failed to load workflow");
        }

        if (!usersResponse.ok) {
          throw new Error("Failed to load organization users");
        }

        setWorkflow(await workflowResponse.json());
        setUsers(await usersResponse.json());
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [apiBase, headers, workflowId]);

  const totalStages = workflow?.stages?.length || 0;
  const totalTasks =
    workflow?.stages?.reduce(
      (count, stage) => count + (stage.tasks?.length || 0),
      0,
    ) || 0;
  const completedTasks =
    workflow?.stages?.reduce(
      (count, stage) =>
        count +
        (stage.tasks?.filter((task) => task.status === "completed").length ||
          0),
      0,
    ) || 0;

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-950 text-zinc-400">
        <div className="flex items-center gap-3 rounded-2xl border border-zinc-800 bg-zinc-900 px-6 py-4 text-sm font-medium">
          <Workflow className="h-5 w-5 animate-pulse text-violet-300" />
          Loading workflow canvas...
        </div>
      </div>
    );
  }

  if (!workflow) {
    return (
      <Card className="border-rose-900/40 bg-rose-950/50 text-rose-200">
        <CardHeader>
          <CardTitle className="text-rose-100">Workflow not found</CardTitle>
          <CardDescription className="text-rose-200/70">
            The requested workflow could not be loaded.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/workflows")}
          >
            <ArrowLeft className="h-4 w-4" />
            Back to workflows
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <main
      className="space-y-6 animate-fade-in bg-[#050505]"
      id="workflow-board-main"
    >
      <Card className="overflow-hidden border-zinc-800 bg-zinc-950/90 shadow-[0_30px_120px_-60px_rgba(0,0,0,0.9)] backdrop-blur-xl">
        <CardHeader className="space-y-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <Badge
                  variant="secondary"
                  className="rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide text-zinc-200"
                >
                  Workflow canvas
                </Badge>
                <Badge
                  variant="outline"
                  className="rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide text-zinc-200"
                >
                  {workflow.category || "General"}
                </Badge>
              </div>
              <CardTitle className="flex items-center gap-3 text-3xl font-semibold tracking-tight text-zinc-50 md:text-5xl">
                {workflow.title}
                <Sparkles className="h-6 w-6 text-violet-300" />
              </CardTitle>
              <CardDescription className="max-w-3xl text-sm leading-relaxed text-zinc-400 md:text-base">
                This workflow opens directly on the canvas. Use the nodes to
                inspect stages and tasks, and keep the active layout visible
                without switching into a separate run board.
              </CardDescription>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                variant="outline"
                className="rounded-xl border-zinc-800 bg-zinc-950 text-zinc-100 hover:bg-zinc-900"
                onClick={() => navigate("/workflows")}
              >
                <ArrowLeft className="h-4 w-4" />
                Back to workflows
              </Button>
              <Button
                type="button"
                className="rounded-xl bg-violet-500 text-white hover:bg-violet-400"
                onClick={() => navigate("/workflows")}
              >
                Open editor
              </Button>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-4">
            {[
              ["Stages", totalStages],
              ["Tasks", totalTasks],
              ["Completed", completedTasks],
              [
                "Progress",
                `${totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0}%`,
              ],
            ].map(([label, value]) => (
              <div
                key={label}
                className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4"
              >
                <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                  {label}
                </p>
                <p className="mt-2 text-3xl font-semibold text-zinc-50">
                  {value}
                </p>
              </div>
            ))}
          </div>
        </CardHeader>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <Card className="border-zinc-800 bg-zinc-950/90 shadow-[0_24px_100px_-45px_rgba(0,0,0,0.85)] backdrop-blur-xl">
          <CardHeader className="border-b border-zinc-800 pb-4">
            <CardTitle className="flex items-center gap-2 text-lg font-semibold text-zinc-50">
              <Layers3 className="h-5 w-5 text-violet-300" />
              Canvas preview
            </CardTitle>
            <CardDescription className="text-zinc-400">
              Click a node to inspect the stage or task details.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <WorkflowCanvas
              workflow={workflow}
              users={users}
              selectedNodeId={selectedNode?.id}
              onNodeSelect={(node) => setSelectedNode(node)}
            />
          </CardContent>
        </Card>

        <Card className="border-zinc-800 bg-zinc-950/90 shadow-[0_24px_100px_-45px_rgba(0,0,0,0.85)] backdrop-blur-xl">
          <CardHeader className="border-b border-zinc-800 pb-4">
            <CardTitle className="text-lg font-semibold text-zinc-50">
              {selectedNode ? "Selected node" : "Workflow overview"}
            </CardTitle>
            <CardDescription className="text-zinc-400">
              {selectedNode
                ? "Node metadata from the canvas"
                : "Summary for the current workflow"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            {selectedNode ? (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge
                    variant="outline"
                    className="rounded-full px-2.5 py-0.5 text-[10px] uppercase tracking-wide text-zinc-200"
                  >
                    {selectedNode.data?.label || "node"}
                  </Badge>
                  {selectedNode.data?.status ? (
                    <Badge
                      variant="secondary"
                      className="rounded-full px-2.5 py-0.5 text-[10px] uppercase tracking-wide text-zinc-200"
                    >
                      {selectedNode.data.status}
                    </Badge>
                  ) : null}
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-zinc-50">
                    {selectedNode.data?.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                    {selectedNode.data?.details ||
                      selectedNode.data?.description}
                  </p>
                </div>
                {selectedNode.data?.progress ? (
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
                    {selectedNode.data.progress}
                  </p>
                ) : null}

                <div className="grid gap-2 text-sm text-zinc-400">
                  <div className="flex items-center justify-between gap-3 rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2">
                    <span>Type</span>
                    <span className="font-medium text-zinc-100">
                      {selectedNode.data?.kind || "node"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-3 rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2">
                    <span>Stage</span>
                    <span className="font-medium text-zinc-100">
                      {selectedNode.data?.stageTitle || "—"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-3 rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2">
                    <span>Assignee</span>
                    <span className="font-medium text-zinc-100">
                      {selectedNode.data?.assigneeName ||
                        selectedNode.data?.meta ||
                        "—"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-3 rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2">
                    <span>Due date</span>
                    <span className="font-medium text-zinc-100">
                      {selectedNode.data?.dueDate || "—"}
                    </span>
                  </div>
                  {selectedNode.data?.note ? (
                    <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-3 text-xs leading-relaxed text-zinc-300">
                      <span className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500">
                        Note
                      </span>
                      {selectedNode.data.note}
                    </div>
                  ) : null}
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                    Overview
                  </p>
                  <div className="mt-4 space-y-3 text-sm text-zinc-300">
                    <div className="flex items-center justify-between gap-3">
                      <span>Stages</span>
                      <span className="font-semibold text-zinc-50">
                        {totalStages}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span>Tasks</span>
                      <span className="font-semibold text-zinc-50">
                        {totalTasks}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span>Completed</span>
                      <span className="font-semibold text-zinc-50">
                        {completedTasks}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="rounded-2xl border border-dashed border-zinc-800 bg-zinc-950 p-4 text-sm text-zinc-400">
                  Select a stage or task node to inspect it here.
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
