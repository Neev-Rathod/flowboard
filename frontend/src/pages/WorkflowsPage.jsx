import { useEffect, useMemo, useState } from "react";
import {
  Layers3,
  Plus,
  Workflow as WorkflowIcon,
  PencilLine,
} from "lucide-react";

import { WorkflowCanvas } from "../components/WorkflowCanvas";
import { WorkflowModal } from "../components/WorkflowModal";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Separator } from "../components/ui/separator";
import { useAuth } from "../context/AuthContext";

export function WorkflowsPage() {
  const { apiBase, token } = useAuth();
  const [workflows, setWorkflows] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingWorkflow, setEditingWorkflow] = useState(null);
  const [selectedWorkflowId, setSelectedWorkflowId] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);

  const headers = useMemo(
    () => ({
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    }),
    [token],
  );

  const loadData = async () => {
    try {
      const [workflowsResponse, usersResponse] = await Promise.all([
        fetch(`${apiBase}/workflows/`, { headers }),
        fetch(`${apiBase}/organization/users`, { headers }),
      ]);

      if (!workflowsResponse.ok || !usersResponse.ok) {
        throw new Error("Failed to load workflows");
      }

      const workflowsPayload = await workflowsResponse.json();
      const usersPayload = await usersResponse.json();
      setWorkflows(Array.isArray(workflowsPayload) ? workflowsPayload : []);
      setUsers(Array.isArray(usersPayload) ? usersPayload : []);
      setSelectedWorkflowId(
        (current) => current ?? workflowsPayload?.[0]?.id ?? null,
      );
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [apiBase, headers]);

  const activeWorkflow =
    workflows.find((workflow) => workflow.id === selectedWorkflowId) ||
    workflows[0] ||
    null;

  const openCreate = () => {
    setEditingWorkflow(null);
    setModalOpen(true);
  };

  const openEdit = (workflow) => {
    setEditingWorkflow(workflow);
    setSelectedWorkflowId(workflow.id);
    setSelectedNode(null);
    setModalOpen(true);
  };

  const openBoard = (workflowId) => {
    window.location.assign(`/workflows/${workflowId}/board`);
  };

  const removeStages = async (workflow) => {
    for (const stage of workflow.stages || []) {
      await fetch(`${apiBase}/workflows/stages/${stage.id}`, {
        method: "DELETE",
        headers,
      });
    }
  };

  const saveWorkflow = async (draft) => {
    setSaving(true);
    try {
      const payload = {
        title: draft.title.trim(),
        description: draft.description.trim(),
        category: draft.category.trim() || null,
        is_template: Boolean(draft.is_template),
      };

      let workflowId = draft.id;

      if (workflowId) {
        const updateResponse = await fetch(
          `${apiBase}/workflows/${workflowId}`,
          {
            method: "PUT",
            headers,
            body: JSON.stringify(payload),
          },
        );

        if (!updateResponse.ok) {
          throw new Error("Failed to update workflow");
        }

        await removeStages(draft);
      } else {
        const createResponse = await fetch(`${apiBase}/workflows/`, {
          method: "POST",
          headers,
          body: JSON.stringify(payload),
        });

        if (!createResponse.ok) {
          throw new Error("Failed to create workflow");
        }

        const createdWorkflow = await createResponse.json();
        workflowId = createdWorkflow.id;
      }

      for (const [stageIndex, stage] of draft.stages.entries()) {
        const stageResponse = await fetch(
          `${apiBase}/workflows/${workflowId}/stages`,
          {
            method: "POST",
            headers,
            body: JSON.stringify({
              title: stage.title.trim(),
              position: stageIndex,
              color: stage.color || null,
              completion_rule: stage.completion_rule || null,
            }),
          },
        );

        if (!stageResponse.ok) {
          throw new Error("Failed to create workflow stage");
        }

        const createdStage = await stageResponse.json();

        for (const task of stage.tasks || []) {
          const taskResponse = await fetch(
            `${apiBase}/workflows/stages/${createdStage.id}/tasks`,
            {
              method: "POST",
              headers,
              body: JSON.stringify({
                title: task.title.trim(),
                description: task.description.trim() || null,
                priority: task.priority || "normal",
                status: "todo",
                assigned_to: task.assigned_to ? Number(task.assigned_to) : null,
                due_date: task.due_date
                  ? new Date(task.due_date).toISOString()
                  : null,
              }),
            },
          );

          if (!taskResponse.ok) {
            throw new Error("Failed to create workflow task");
          }
        }
      }

      await loadData();
      setSelectedWorkflowId(workflowId);
      setModalOpen(false);
      setEditingWorkflow(null);
    } catch (error) {
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="flex h-full min-h-0 flex-col gap-6 bg-[#050505]">
      <Card className="border-zinc-800 bg-zinc-950/90 shadow-[0_30px_120px_-60px_rgba(0,0,0,0.9)] backdrop-blur-xl">
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            <Badge
              variant="secondary"
              className="w-fit rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide text-zinc-200"
            >
              Workflow templates
            </Badge>
            <CardTitle className="flex items-center gap-2 text-2xl font-semibold text-zinc-50">
              <WorkflowIcon className="h-6 w-6 text-violet-300" />
              Workflow builder
            </CardTitle>
            <CardDescription className="max-w-2xl text-sm text-zinc-400">
              Create reusable templates, shape linear and branched stages, and
              inspect each flow on a live dot-grid canvas.
            </CardDescription>
          </div>

          <Button type="button" onClick={openCreate} className="rounded-xl">
            <Plus className="h-4 w-4" />
            Create workflow
          </Button>
        </CardHeader>
      </Card>

      <div className="grid min-h-0 flex-1 gap-6 xl:grid-cols-[340px_minmax(0,1fr)]">
        <Card className="flex min-h-0 flex-col border-zinc-800 bg-zinc-950/90 shadow-[0_24px_100px_-45px_rgba(0,0,0,0.85)] backdrop-blur-xl">
          <CardHeader className="border-b border-zinc-800">
            <CardTitle className="flex items-center gap-2 text-lg text-zinc-50">
              <Layers3 className="h-5 w-5 text-violet-300" />
              Your workflows
            </CardTitle>
            <CardDescription className="text-zinc-400">
              Select a template to inspect its canvas and edit it.
            </CardDescription>
          </CardHeader>
          <CardContent className="min-h-0 flex-1 space-y-4 overflow-y-auto pt-4">
            {loading ? (
              <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4 text-sm text-zinc-400">
                Loading workflows...
              </div>
            ) : workflows.length === 0 ? (
              <div className="rounded-xl border border-dashed border-zinc-800 bg-zinc-950 p-6 text-center text-sm text-zinc-400">
                No workflows yet. Create the first template to start building
                branches.
              </div>
            ) : (
              workflows.map((workflow) => (
                <div
                  key={workflow.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => {
                    setSelectedWorkflowId(workflow.id);
                    setSelectedNode(null);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      setSelectedWorkflowId(workflow.id);
                      setSelectedNode(null);
                    }
                  }}
                  className={[
                    "w-full rounded-2xl border p-4 text-left transition-all cursor-pointer space-y-3 block",
                    selectedWorkflowId === workflow.id
                      ? "border-violet-500/40 bg-zinc-900 shadow-sm ring-1 ring-violet-500/10"
                      : "border-zinc-800 bg-zinc-950 hover:border-violet-500/30 hover:bg-zinc-900",
                  ].join(" ")}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-sm font-semibold text-zinc-50">
                          {workflow.title}
                        </h3>
                        {workflow.is_template ? (
                          <Badge
                            variant="secondary"
                            className="rounded-full px-2.5 py-0.5 text-[10px] uppercase tracking-wide text-zinc-200"
                          >
                            template
                          </Badge>
                        ) : null}
                      </div>
                      <p className="text-xs leading-relaxed text-zinc-400">
                        {workflow.description || "No description provided."}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={(event) => {
                          event.stopPropagation();
                          openEdit(workflow);
                        }}
                        className="border-zinc-700 bg-zinc-900 text-zinc-100 hover:bg-zinc-800"
                        title="Edit workflow"
                      >
                        <PencilLine className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        onClick={(event) => {
                          event.stopPropagation();
                          openBoard(workflow.id);
                        }}
                        className="bg-violet-600 hover:bg-violet-500 text-white font-medium text-xs px-3 rounded-lg"
                      >
                        Open Board
                      </Button>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-zinc-500 pt-2 border-t border-zinc-800/40">
                    <span>{workflow.stages?.length || 0} stages</span>
                    <span>•</span>
                    <span>
                      {workflow.stages?.reduce(
                        (count, stage) => count + (stage.tasks?.length || 0),
                        0,
                      ) || 0}{" "}
                      tasks
                    </span>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="flex min-h-0 flex-col border-zinc-800 bg-zinc-950/90 shadow-[0_24px_100px_-45px_rgba(0,0,0,0.85)] backdrop-blur-xl">
          <CardHeader className="border-b border-zinc-800">
            <CardTitle className="text-lg text-zinc-50">
              Canvas preview
            </CardTitle>
            <CardDescription className="text-zinc-400">
              Click nodes to inspect task metadata and stage branching.
            </CardDescription>
          </CardHeader>
          <CardContent className="min-h-0 flex-1 space-y-4 pt-4">
            <WorkflowCanvas
              workflow={activeWorkflow}
              users={users}
              selectedNodeId={selectedNode?.id}
              onNodeSelect={(node) => setSelectedNode(node)}
            />

            {selectedNode ? (
              <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge
                    variant="outline"
                    className="rounded-full px-2.5 py-0.5 text-[10px] uppercase tracking-wide"
                  >
                    {selectedNode.data?.label || "node"}
                  </Badge>
                  {selectedNode.data?.status ? (
                    <Badge
                      variant="secondary"
                      className="rounded-full px-2.5 py-0.5 text-[10px] uppercase tracking-wide"
                    >
                      {selectedNode.data.status}
                    </Badge>
                  ) : null}
                  <span className="text-sm font-semibold text-zinc-50">
                    {selectedNode.data?.title}
                  </span>
                </div>
                <p className="mt-2 text-sm text-zinc-400">
                  {selectedNode.data?.details || selectedNode.data?.description}
                </p>
                {selectedNode.data?.progress ? (
                  <p className="mt-2 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
                    {selectedNode.data.progress}
                  </p>
                ) : null}
                <div className="mt-3 grid gap-2 text-sm text-zinc-400 sm:grid-cols-2">
                  <div className="flex items-center justify-between gap-3">
                    <span>Type</span>
                    <span className="font-medium text-zinc-100">
                      {selectedNode.data?.kind || "node"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span>Accent</span>
                    <span className="font-medium text-zinc-100">
                      {selectedNode.data?.accent || "#18181b"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span>Stage</span>
                    <span className="font-medium text-zinc-100">
                      {selectedNode.data?.stageTitle || "—"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span>Assignee</span>
                    <span className="font-medium text-zinc-100">
                      {selectedNode.data?.assigneeName ||
                        selectedNode.data?.meta ||
                        "—"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span>Job title</span>
                    <span className="font-medium text-zinc-100">
                      {selectedNode.data?.assigneeTitle || "—"}
                    </span>
                  </div>
                  {selectedNode.data?.kind === "task" ? (
                    <>
                      <div className="flex items-center justify-between gap-3">
                        <span>Priority</span>
                        <span className="font-medium text-zinc-100">
                          {selectedNode.data?.priority || "normal"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <span>Due date</span>
                        <span className="font-medium text-zinc-100">
                          {selectedNode.data?.dueDate || "—"}
                        </span>
                      </div>
                      {selectedNode.data?.note ? (
                        <div className="sm:col-span-2 rounded-xl border border-zinc-800 bg-zinc-900 p-3 text-xs leading-relaxed text-zinc-300">
                          <span className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500">
                            Note
                          </span>
                          {selectedNode.data.note}
                        </div>
                      ) : null}
                    </>
                  ) : (
                    <div className="flex items-center justify-between gap-3 sm:col-span-2">
                      <span>Tasks</span>
                      <span className="font-medium text-zinc-100">
                        {selectedNode.data?.taskCount ?? 0}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-zinc-800 bg-zinc-950 p-4 text-sm text-zinc-400">
                Select a node to inspect its details here.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <WorkflowModal
        open={modalOpen}
        workflow={editingWorkflow}
        users={users}
        saving={saving}
        onOpenChange={setModalOpen}
        onSave={saveWorkflow}
      />
    </main>
  );
}
