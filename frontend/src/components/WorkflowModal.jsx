import { useEffect, useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";

import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Checkbox } from "./ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Select } from "./ui/select";
import { Separator } from "./ui/separator";
import { WorkflowCanvas } from "./WorkflowCanvas";

const stageColors = [
  "#18181b",
  "#2563eb",
  "#0f766e",
  "#7c3aed",
  "#ca8a04",
  "#db2777",
];

const makeId = () => {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const emptyDraft = (users = []) => ({
  title: "New workflow",
  description: "",
  category: "",
  visibility: "private",
  is_template: true,
  stages: [
    {
      id: makeId(),
      title: "Stage 1",
      color: stageColors[0],
      completion_rule: "",
      tasks: [
        {
          id: makeId(),
          title: "Review request",
          description: "",
          priority: "normal",
          assigned_to: users[0]?.id ?? "",
          due_date: "",
        },
      ],
    },
    {
      id: makeId(),
      title: "Stage 2",
      color: stageColors[1],
      completion_rule: "parallel",
      tasks: [
        {
          id: makeId(),
          title: "Branch A task",
          description: "",
          priority: "medium",
          assigned_to: users[0]?.id ?? "",
          due_date: "",
        },
        {
          id: makeId(),
          title: "Branch B task",
          description: "",
          priority: "medium",
          assigned_to: users[0]?.id ?? "",
          due_date: "",
        },
      ],
    },
    {
      id: makeId(),
      title: "Stage 3",
      color: stageColors[2],
      completion_rule: "",
      tasks: [
        {
          id: makeId(),
          title: "Finalize",
          description: "",
          priority: "high",
          assigned_to: users[0]?.id ?? "",
          due_date: "",
        },
      ],
    },
  ],
});

function normalizeDate(value) {
  if (!value) return "";
  if (typeof value === "string") return value.slice(0, 10);
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString().slice(0, 10);
}

function workflowToDraft(workflow, users = []) {
  if (!workflow) {
    return emptyDraft(users);
  }

  return {
    id: workflow.id,
    title: workflow.title || "Untitled workflow",
    description: workflow.description || "",
    category: workflow.category || "",
    visibility: workflow.visibility || "private",
    is_template: workflow.is_template ?? true,
    stages: (workflow.stages || []).map((stage, stageIndex) => ({
      id: stage.id,
      title: stage.title,
      color: stage.color || stageColors[stageIndex % stageColors.length],
      completion_rule: stage.completion_rule || "",
      tasks: (stage.tasks || []).map((task) => ({
        id: task.id,
        title: task.title,
        description: task.description || "",
        priority: task.priority || "normal",
        assigned_to: task.assigned_to ?? "",
        due_date: normalizeDate(task.due_date),
      })),
    })),
  };
}

function createTask(users = []) {
  return {
    id: makeId(),
    title: "New task",
    description: "",
    priority: "normal",
    assigned_to: users[0]?.id ?? "",
    due_date: "",
  };
}

function createStage(users = [], index = 0) {
  return {
    id: makeId(),
    title: `Stage ${index + 1}`,
    color: stageColors[index % stageColors.length],
    completion_rule: index === 1 ? "parallel" : "",
    tasks: [createTask(users)],
  };
}

function findSelection(workflow, selectedNodeId) {
  if (!workflow || !selectedNodeId) return null;

  for (const stage of workflow.stages || []) {
    if (String(stage.id) === String(selectedNodeId)) {
      return { kind: "stage", item: stage };
    }

    for (const task of stage.tasks || []) {
      if (String(task.id) === String(selectedNodeId)) {
        return { kind: "task", item: task, stage };
      }
    }
  }

  return null;
}

export function WorkflowModal({
  open,
  workflow,
  users,
  onOpenChange,
  onSave,
  saving = false,
}) {
  const [draft, setDraft] = useState(() => workflowToDraft(workflow, users));
  const [selectedNodeId, setSelectedNodeId] = useState("");

  useEffect(() => {
    if (open) {
      setDraft(workflowToDraft(workflow, users));
      setSelectedNodeId("");
    }
  }, [open, workflow, users]);

  const selection = useMemo(
    () => findSelection(draft, selectedNodeId),
    [draft, selectedNodeId],
  );

  const updateWorkflowField = (field, value) => {
    setDraft((current) => ({ ...current, [field]: value }));
  };

  const updateStage = (stageId, field, value) => {
    setDraft((current) => ({
      ...current,
      stages: current.stages.map((stage) =>
        String(stage.id) === String(stageId)
          ? { ...stage, [field]: value }
          : stage,
      ),
    }));
  };

  const updateTask = (stageId, taskId, field, value) => {
    setDraft((current) => ({
      ...current,
      stages: current.stages.map((stage) => {
        if (String(stage.id) !== String(stageId)) return stage;
        return {
          ...stage,
          tasks: stage.tasks.map((task) =>
            String(task.id) === String(taskId)
              ? { ...task, [field]: value }
              : task,
          ),
        };
      }),
    }));
  };

  const addStage = () => {
    setDraft((current) => ({
      ...current,
      stages: [...current.stages, createStage(users, current.stages.length)],
    }));
  };

  const addTask = (stageId) => {
    setDraft((current) => ({
      ...current,
      stages: current.stages.map((stage) =>
        String(stage.id) === String(stageId)
          ? { ...stage, tasks: [...stage.tasks, createTask(users)] }
          : stage,
      ),
    }));
  };

  const removeStage = (stageId) => {
    setDraft((current) => ({
      ...current,
      stages: current.stages.filter(
        (stage) => String(stage.id) !== String(stageId),
      ),
    }));
  };

  const removeTask = (stageId, taskId) => {
    setDraft((current) => ({
      ...current,
      stages: current.stages.map((stage) =>
        String(stage.id) === String(stageId)
          ? {
              ...stage,
              tasks: stage.tasks.filter(
                (task) => String(task.id) !== String(taskId),
              ),
            }
          : stage,
      ),
    }));
  };

  const submit = async (event) => {
    event.preventDefault();
    await onSave?.(draft);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] max-w-[96vw] overflow-y-auto rounded-2xl border-zinc-200 bg-white p-0 shadow-2xl lg:max-w-7xl">
        <div className="border-b border-zinc-200 px-6 py-5">
          <DialogHeader className="text-left">
            <DialogTitle className="text-xl font-semibold text-zinc-950">
              {workflow ? "Edit workflow" : "Create workflow"}
            </DialogTitle>
            <DialogDescription className="text-zinc-500">
              Shape the stages, parallel branches, assignees, and deadlines in
              one place.
            </DialogDescription>
          </DialogHeader>
        </div>

        <form onSubmit={submit} className="space-y-6 p-6">
          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-6">
              <Card className="border-zinc-200 shadow-sm">
                <CardHeader className="space-y-1">
                  <CardTitle className="text-base">Workflow details</CardTitle>
                  <CardDescription>
                    Define the template metadata and visibility.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                        Title
                      </label>
                      <Input
                        value={draft.title}
                        onChange={(event) =>
                          updateWorkflowField("title", event.target.value)
                        }
                        required
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                        Description
                      </label>
                      <Input
                        value={draft.description}
                        onChange={(event) =>
                          updateWorkflowField("description", event.target.value)
                        }
                        placeholder="What does this workflow coordinate?"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                        Category
                      </label>
                      <Input
                        value={draft.category}
                        onChange={(event) =>
                          updateWorkflowField("category", event.target.value)
                        }
                        placeholder="Release, onboarding, support..."
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                        Visibility
                      </label>
                      <Select
                        value={draft.visibility}
                        onChange={(event) =>
                          updateWorkflowField("visibility", event.target.value)
                        }
                      >
                        <option value="private">Private</option>
                        <option value="team">Team</option>
                        <option value="public">Public</option>
                      </Select>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2">
                    <Checkbox
                      checked={draft.is_template}
                      onCheckedChange={(checked) =>
                        updateWorkflowField("is_template", Boolean(checked))
                      }
                    />
                    <span className="text-sm text-zinc-700">
                      Save as reusable template
                    </span>
                  </div>
                </CardContent>
              </Card>

              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-semibold text-zinc-950">
                    Stages and task branches
                  </h3>
                  <p className="text-sm text-zinc-500">
                    Create sequential stages and branch parallel work inside
                    each stage.
                  </p>
                </div>
                <Button type="button" variant="outline" onClick={addStage}>
                  <Plus className="h-4 w-4" />
                  Add stage
                </Button>
              </div>

              <div className="space-y-4">
                {draft.stages.map((stage, stageIndex) => (
                  <Card key={stage.id} className="border-zinc-200 shadow-sm">
                    <CardHeader className="space-y-3 border-b border-zinc-200 pb-4">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <CardTitle className="text-base">
                            Stage {stageIndex + 1}
                          </CardTitle>
                          <CardDescription>
                            {stage.tasks.length} task
                            {stage.tasks.length === 1 ? "" : "s"}
                          </CardDescription>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeStage(stage.id)}
                          className="text-zinc-500 hover:bg-red-50 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <label className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                            Stage title
                          </label>
                          <Input
                            value={stage.title}
                            onChange={(event) =>
                              updateStage(stage.id, "title", event.target.value)
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                            Branch mode
                          </label>
                          <Select
                            value={stage.completion_rule || ""}
                            onChange={(event) =>
                              updateStage(
                                stage.id,
                                "completion_rule",
                                event.target.value,
                              )
                            }
                          >
                            <option value="">Sequential</option>
                            <option value="parallel">Parallel</option>
                            <option value="all">All tasks required</option>
                          </Select>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 pt-1">
                        {stageColors.map((color) => (
                          <button
                            key={color}
                            type="button"
                            aria-label={`Use ${color} accent`}
                            onClick={() =>
                              updateStage(stage.id, "color", color)
                            }
                            className={[
                              "h-6 w-6 rounded-full border transition-all",
                              stage.color === color
                                ? "border-zinc-900 ring-2 ring-zinc-900/10"
                                : "border-zinc-200",
                            ].join(" ")}
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4 pt-4">
                      {stage.tasks.map((task, taskIndex) => (
                        <div
                          key={task.id}
                          className="rounded-xl border border-zinc-200 bg-zinc-50 p-4"
                        >
                          <div className="mb-3 flex items-center justify-between gap-3">
                            <Badge
                              variant="outline"
                              className="rounded-full px-2.5 py-0.5 text-[10px] uppercase tracking-[0.2em]"
                            >
                              Task {taskIndex + 1}
                            </Badge>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeTask(stage.id, task.id)}
                              className="text-zinc-500 hover:bg-red-50 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>

                          <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2 md:col-span-2">
                              <label className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                                Task title
                              </label>
                              <Input
                                value={task.title}
                                onChange={(event) =>
                                  updateTask(
                                    stage.id,
                                    task.id,
                                    "title",
                                    event.target.value,
                                  )
                                }
                              />
                            </div>
                            <div className="space-y-2 md:col-span-2">
                              <label className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                                Description
                              </label>
                              <Input
                                value={task.description}
                                onChange={(event) =>
                                  updateTask(
                                    stage.id,
                                    task.id,
                                    "description",
                                    event.target.value,
                                  )
                                }
                                placeholder="What needs to happen?"
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                                Assignee
                              </label>
                              <Select
                                value={task.assigned_to || ""}
                                onChange={(event) =>
                                  updateTask(
                                    stage.id,
                                    task.id,
                                    "assigned_to",
                                    event.target.value
                                      ? Number(event.target.value)
                                      : "",
                                  )
                                }
                              >
                                <option value="">Unassigned</option>
                                {users.map((user) => (
                                  <option key={user.id} value={user.id}>
                                    {user.username} · {user.job_title}
                                  </option>
                                ))}
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <label className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                                Priority
                              </label>
                              <Select
                                value={task.priority}
                                onChange={(event) =>
                                  updateTask(
                                    stage.id,
                                    task.id,
                                    "priority",
                                    event.target.value,
                                  )
                                }
                              >
                                <option value="low">Low</option>
                                <option value="normal">Normal</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                                <option value="urgent">Urgent</option>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <label className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                                Due date
                              </label>
                              <Input
                                type="date"
                                value={task.due_date}
                                onChange={(event) =>
                                  updateTask(
                                    stage.id,
                                    task.id,
                                    "due_date",
                                    event.target.value,
                                  )
                                }
                              />
                            </div>
                          </div>
                        </div>
                      ))}

                      <Button
                        type="button"
                        variant="secondary"
                        className="w-full"
                        onClick={() => addTask(stage.id)}
                      >
                        <Plus className="h-4 w-4" />
                        Add parallel task
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
                      Live canvas
                    </p>
                    <p className="text-sm text-zinc-600">
                      Dot grid preview with branched flow paths.
                    </p>
                  </div>
                  <Badge
                    variant="secondary"
                    className="rounded-full px-2.5 py-0.5 text-[10px] uppercase tracking-wide text-zinc-700"
                  >
                    {draft.stages.length} stages
                  </Badge>
                </div>
                <div className="mt-4">
                  <WorkflowCanvas
                    workflow={draft}
                    selectedNodeId={selectedNodeId}
                    onNodeSelect={(node) => setSelectedNodeId(node.id)}
                  />
                </div>
              </div>

              <Card className="border-zinc-200 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-base">Node details</CardTitle>
                  <CardDescription>
                    Click a canvas node to inspect its metadata.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {selection ? (
                    <>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className="rounded-full px-2.5 py-0.5 uppercase tracking-wide"
                        >
                          {selection.kind}
                        </Badge>
                        <span className="text-sm font-semibold text-zinc-950">
                          {selection.item.title}
                        </span>
                      </div>
                      <p className="text-sm text-zinc-600">
                        {selection.kind === "task"
                          ? selection.item.description || "No description set."
                          : selection.item.completion_rule ||
                            "Sequential stage"}
                      </p>
                      <Separator />
                      <div className="grid gap-3 text-sm text-zinc-600">
                        {selection.kind === "task" ? (
                          <>
                            <div className="flex items-center justify-between gap-3">
                              <span>Priority</span>
                              <span className="font-medium text-zinc-900">
                                {selection.item.priority || "normal"}
                              </span>
                            </div>
                            <div className="flex items-center justify-between gap-3">
                              <span>Assignee</span>
                              <span className="font-medium text-zinc-900">
                                {selection.item.assigned_to || "Unassigned"}
                              </span>
                            </div>
                            <div className="flex items-center justify-between gap-3">
                              <span>Due</span>
                              <span className="font-medium text-zinc-900">
                                {selection.item.due_date || "Not set"}
                              </span>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="flex items-center justify-between gap-3">
                              <span>Color</span>
                              <span className="font-medium text-zinc-900">
                                {selection.item.color || "Default"}
                              </span>
                            </div>
                            <div className="flex items-center justify-between gap-3">
                              <span>Tasks</span>
                              <span className="font-medium text-zinc-900">
                                {selection.item.tasks.length}
                              </span>
                            </div>
                          </>
                        )}
                      </div>
                    </>
                  ) : (
                    <p className="text-sm text-zinc-500">
                      Select a stage or task node to inspect its details here.
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          <Separator />

          <DialogFooter className="px-6 pb-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange?.(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving
                ? "Saving..."
                : workflow
                  ? "Update workflow"
                  : "Create workflow"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
