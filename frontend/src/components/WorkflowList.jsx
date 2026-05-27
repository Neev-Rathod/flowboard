import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { GripVertical, Plus, Play, RefreshCw, Trash2 } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";

function reorder(array, fromIndex, toIndex) {
  const next = [...array];
  const [item] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, item);
  return next;
}

export default function WorkflowList({ apiBase, token }) {
  const [workflows, setWorkflows] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [title, setTitle] = useState("");
  const [stageTitle, setStageTitle] = useState("");
  const [assigneeByWorkflow, setAssigneeByWorkflow] = useState({});
  const navigate = useNavigate();

  const headers = useMemo(
    () => ({
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    }),
    [token],
  );

  const loadWorkflows = async () => {
    try {
      const [workflowsResponse, usersResponse] = await Promise.all([
        fetch(`${apiBase}/workflows/`, { headers }),
        fetch(`${apiBase}/organization/users`, { headers }),
      ]);

      if (!workflowsResponse.ok) throw new Error("Failed to load workflows");
      if (!usersResponse.ok) throw new Error("Failed to load users");

      const workflowsPayload = await workflowsResponse.json();
      const usersPayload = await usersResponse.json();
      setWorkflows(Array.isArray(workflowsPayload) ? workflowsPayload : []);
      setUsers(Array.isArray(usersPayload) ? usersPayload : []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWorkflows();
  }, [apiBase, headers]);

  const createWorkflow = async () => {
    if (!title.trim()) return;
    try {
      const res = await fetch(`${apiBase}/workflows/`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          title: title.trim(),
          description: "",
          category: null,
        }),
      });
      if (!res.ok) throw new Error("Create failed");
      const wf = await res.json();
      setWorkflows((current) => [wf, ...current]);
      setTitle("");
    } catch (error) {
      console.error(error);
    }
  };

  const duplicate = async (id) => {
    try {
      const res = await fetch(`${apiBase}/workflows/${id}/duplicate`, {
        method: "POST",
        headers,
      });
      if (!res.ok) throw new Error("Duplicate failed");
      const wf = await res.json();
      setWorkflows((current) => [wf, ...current]);
    } catch (error) {
      console.error(error);
    }
  };

  const remove = async (id) => {
    try {
      const res = await fetch(`${apiBase}/workflows/${id}`, {
        method: "DELETE",
        headers,
      });
      if (res.status !== 204) throw new Error("Delete failed");
      setWorkflows((current) =>
        current.filter((workflow) => workflow.id !== id),
      );
      if (expandedId === id) setExpandedId(null);
    } catch (error) {
      console.error(error);
    }
  };

  const createStage = async (workflowId) => {
    if (!stageTitle.trim()) return;
    try {
      const res = await fetch(`${apiBase}/workflows/${workflowId}/stages`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          title: stageTitle.trim(),
          position: 0,
          color: null,
          completion_rule: null,
        }),
      });
      if (!res.ok) throw new Error("Stage create failed");
      const createdStage = await res.json();
      setWorkflows((current) =>
        current.map((workflow) =>
          workflow.id === workflowId
            ? {
                ...workflow,
                stages: [...(workflow.stages || []), createdStage],
              }
            : workflow,
        ),
      );
      setStageTitle("");
    } catch (error) {
      console.error(error);
    }
  };

  const reorderStages = async (workflowId, stages) => {
    setWorkflows((current) =>
      current.map((workflow) =>
        workflow.id === workflowId ? { ...workflow, stages } : workflow,
      ),
    );
    await fetch(`${apiBase}/workflows/stages/reorder`, {
      method: "PUT",
      headers,
      body: JSON.stringify({ stage_ids: stages.map((stage) => stage.id) }),
    });
  };

  const onStageDrop = async (workflowId, fromIndex, toIndex) => {
    const workflow = workflows.find((item) => item.id === workflowId);
    if (!workflow?.stages?.length || fromIndex === toIndex) return;
    const nextStages = reorder(workflow.stages, fromIndex, toIndex).map(
      (stage, index) => ({
        ...stage,
        position: index,
      }),
    );
    await reorderStages(workflowId, nextStages);
  };

  const startRun = async (workflowId) => {
    try {
      const response = await fetch(`${apiBase}/workflows/${workflowId}/runs`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          workflow_id: workflowId,
          assigned_to: assigneeByWorkflow[workflowId]
            ? Number(assigneeByWorkflow[workflowId])
            : null,
        }),
      });
      if (!response.ok) throw new Error("Unable to start run");
      const payload = await response.json();
      await loadWorkflows();
      navigate(`/runs/${payload.id}`);
    } catch (error) {
      console.error(error);
    }
  };

  const startRunForAssignee = (workflowId, assignedTo) => {
    setAssigneeByWorkflow((current) => ({
      ...current,
      [workflowId]: assignedTo,
    }));
  };

  if (loading) {
    return <div className="text-sm text-slate-300">Loading workflows...</div>;
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row">
        <Input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="New workflow title"
          className="w-full"
        />
        <Button type="button" onClick={createWorkflow} className="sm:w-auto">
          <Plus className="h-4 w-4" />
          Create
        </Button>
      </div>

      <div className="space-y-3">
        {workflows.length === 0 ? (
          <Card className="border-white/10 bg-white/5">
            <CardContent className="p-4 text-sm text-slate-300">
              No workflows yet.
            </CardContent>
          </Card>
        ) : (
          workflows.map((workflow) => {
            const stages = workflow.stages || [];

            return (
              <Card
                key={workflow.id}
                className="border-white/10 bg-slate-950/50"
              >
                <CardHeader className="flex items-start justify-between gap-4 p-4">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <CardTitle className="text-base">
                        {workflow.title}
                      </CardTitle>
                      <Badge variant="outline">{workflow.visibility}</Badge>
                      {workflow.is_template ? (
                        <Badge variant="secondary">template</Badge>
                      ) : null}
                    </div>
                    <p className="text-sm text-slate-400">
                      {workflow.description || "No description"}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() =>
                        setExpandedId(
                          expandedId === workflow.id ? null : workflow.id,
                        )
                      }
                    >
                      <RefreshCw className="h-4 w-4" />
                      {expandedId === workflow.id ? "Hide" : "Manage"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => duplicate(workflow.id)}
                    >
                      Duplicate
                    </Button>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => remove(workflow.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </Button>
                  </div>
                </CardHeader>

                {expandedId === workflow.id ? (
                  <CardContent className="space-y-4 border-t border-white/10 p-4">
                    <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
                      <Input
                        value={stageTitle}
                        onChange={(event) => setStageTitle(event.target.value)}
                        placeholder="Add stage"
                      />
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => createStage(workflow.id)}
                      >
                        <Plus className="h-4 w-4" />
                        Add stage
                      </Button>
                    </div>

                    <div className="grid gap-3">
                      {stages.length === 0 ? (
                        <div className="text-sm text-slate-400">
                          No stages yet.
                        </div>
                      ) : (
                        stages.map((stage, index) => (
                          <div
                            key={stage.id}
                            draggable
                            onDragStart={(event) =>
                              event.dataTransfer.setData(
                                "text/plain",
                                String(index),
                              )
                            }
                            onDragOver={(event) => event.preventDefault()}
                            onDrop={(event) => {
                              event.preventDefault();
                              const fromIndex = Number(
                                event.dataTransfer.getData("text/plain"),
                              );
                              onStageDrop(workflow.id, fromIndex, index);
                            }}
                            className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3"
                          >
                            <div>
                              <div className="flex items-center gap-2 text-sm font-medium text-white">
                                <GripVertical className="h-4 w-4 text-slate-500" />
                                {stage.title}
                              </div>
                              <div className="text-xs text-slate-400">
                                Position {stage.position ?? index + 1}
                              </div>
                            </div>
                            <Badge variant="outline">Drag</Badge>
                          </div>
                        ))
                      )}
                    </div>

                    <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 lg:flex-row lg:items-center">
                      <select
                        value={assigneeByWorkflow[workflow.id] || ""}
                        onChange={(event) =>
                          startRunForAssignee(workflow.id, event.target.value)
                        }
                        className="h-11 w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 text-sm text-white outline-none lg:max-w-xs"
                      >
                        <option value="">Assign run to...</option>
                        {users.map((candidate) => (
                          <option key={candidate.id} value={candidate.id}>
                            {candidate.username} - {candidate.job_title}
                          </option>
                        ))}
                      </select>
                      <Button
                        type="button"
                        onClick={() => startRun(workflow.id)}
                        className="lg:w-auto"
                      >
                        <Play className="h-4 w-4" />
                        Start run
                      </Button>
                    </div>
                  </CardContent>
                ) : null}
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
