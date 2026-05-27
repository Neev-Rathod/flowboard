import { useState } from "react";
import { Plus } from "lucide-react";

import { Button } from "./ui/button";
import { Checkbox } from "./ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Select } from "./ui/select";
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

const blankTask = (users = []) => ({
  id: makeId(),
  title: "New task",
  description: "",
  priority: "normal",
  assigned_to: users[0]?.id ?? "",
  due_date: "",
});

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
  return blankTask(users);
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

function TaskEditorDialog({ open, task, stageTitle, users, onClose, onSave }) {
  const [draft, setDraft] = useState(() => task ?? blankTask(users));

  const updateField = (field, value) => {
    setDraft((current) => ({ ...current, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg rounded-2xl border-zinc-200 bg-white p-0 shadow-2xl">
        <div className="border-b border-zinc-200 px-6 py-5">
          <DialogHeader className="text-left">
            <DialogTitle className="text-xl font-semibold text-zinc-950">
              {task ? "Edit task" : "Add task"}
            </DialogTitle>
            <DialogDescription className="text-zinc-500">
              {stageTitle
                ? `Add details for ${stageTitle}.`
                : "Define the task details for this stage."}
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="space-y-4 p-6">
          <div className="space-y-2">
            <label className="text-xs font-medium uppercase tracking-wide text-zinc-500">
              Task title
            </label>
            <Input
              value={draft.title}
              onChange={(event) => updateField("title", event.target.value)}
              placeholder="New task"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium uppercase tracking-wide text-zinc-500">
              Description
            </label>
            <Input
              value={draft.description}
              onChange={(event) =>
                updateField("description", event.target.value)
              }
              placeholder="What needs to happen?"
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                Assignee
              </label>
              <Select
                value={draft.assigned_to || ""}
                onChange={(event) =>
                  updateField(
                    "assigned_to",
                    event.target.value ? Number(event.target.value) : "",
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
                value={draft.priority}
                onChange={(event) =>
                  updateField("priority", event.target.value)
                }
              >
                <option value="low">Low</option>
                <option value="normal">Normal</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </Select>
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                Due date
              </label>
              <Input
                type="date"
                value={draft.due_date}
                onChange={(event) =>
                  updateField("due_date", event.target.value)
                }
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-zinc-200 px-6 pb-6 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => onClose(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={() => {
              onSave?.(draft);
              onClose(false);
            }}
          >
            Save task
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function WorkflowModalEditor({
  workflow,
  users,
  onOpenChange,
  onSave,
  saving,
}) {
  const [draft, setDraft] = useState(() => workflowToDraft(workflow, users));
  const [taskEditor, setTaskEditor] = useState({
    open: false,
    stageId: null,
    taskId: null,
  });

  const updateWorkflowField = (field, value) => {
    setDraft((current) => ({ ...current, [field]: value }));
  };

  const addStage = () => {
    setDraft((current) => ({
      ...current,
      stages: [...current.stages, createStage(users, current.stages.length)],
    }));
  };

  const addTask = (stageId, taskDraft) => {
    setDraft((current) => ({
      ...current,
      stages: current.stages.map((stage) => {
        if (String(stage.id) !== String(stageId)) return stage;

        const nextTask = taskDraft?.id
          ? taskDraft
          : { ...blankTask(users), ...taskDraft };

        const existingTaskIndex = stage.tasks.findIndex(
          (task) => String(task.id) === String(nextTask.id),
        );

        if (existingTaskIndex >= 0) {
          const nextTasks = [...stage.tasks];
          nextTasks[existingTaskIndex] = nextTask;
          return { ...stage, tasks: nextTasks };
        }

        return {
          ...stage,
          tasks: [...stage.tasks, { ...nextTask, id: nextTask.id || makeId() }],
        };
      }),
    }));
  };

  const openTaskEditor = (stageId, taskId = null) => {
    setTaskEditor({ open: true, stageId, taskId });
  };

  const activeStage = draft.stages.find(
    (stage) => String(stage.id) === String(taskEditor.stageId),
  );
  const activeTask = findSelection(draft, taskEditor.taskId)?.item ?? null;

  const submit = async (event) => {
    event.preventDefault();
    await onSave?.(draft);
  };

  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent className="h-[92vh] max-w-[98vw] overflow-hidden rounded-2xl border-zinc-200 bg-white p-0 shadow-2xl">
        <form onSubmit={submit} className="flex h-full flex-col">
          <div className="flex items-center justify-between gap-3 border-b border-zinc-200 px-4 py-3">
            <DialogHeader className="text-left">
              <DialogTitle className="text-lg font-semibold text-zinc-950">
                {workflow ? "Workflow canvas" : "Create workflow canvas"}
              </DialogTitle>
              <DialogDescription className="text-zinc-500">
                Drag nodes like a board, then use the node controls to add or
                edit tasks.
              </DialogDescription>
            </DialogHeader>

            <div className="flex items-center gap-2">
              <Button type="button" variant="outline" onClick={addStage}>
                <Plus className="h-4 w-4" />
                Add stage
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? "Saving..." : workflow ? "Save" : "Create"}
              </Button>
            </div>
          </div>

          <div className="relative flex-1 p-4">
            <WorkflowCanvas
              workflow={draft}
              onAddTask={openTaskEditor}
              onNodeSelect={(node) => {
                if (node.data?.kind === "task") {
                  openTaskEditor(node.data.stageId, node.data.taskId);
                }
              }}
            />

            <div className="pointer-events-none absolute left-8 top-8 rounded-full border border-zinc-200 bg-white/90 px-3 py-1 text-xs text-zinc-500 shadow-sm backdrop-blur">
              Canvas mode
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-zinc-200 px-4 py-3">
            <div className="flex items-center gap-2 text-sm text-zinc-500">
              <Checkbox
                checked={draft.is_template}
                onCheckedChange={(checked) =>
                  updateWorkflowField("is_template", Boolean(checked))
                }
              />
              <span>Save as reusable template</span>
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange?.(false)}
            >
              Cancel
            </Button>
          </div>
        </form>

        <TaskEditorDialog
          key={`${taskEditor.stageId ?? "none"}-${taskEditor.taskId ?? "new"}-${taskEditor.open ? "open" : "closed"}`}
          open={taskEditor.open}
          task={activeTask}
          stageTitle={activeStage?.title}
          users={users}
          onClose={(nextOpen) =>
            setTaskEditor((current) => ({ ...current, open: nextOpen }))
          }
          onSave={(taskDraft) => {
            if (!taskEditor.stageId) return;

            const nextTask = {
              ...taskDraft,
              id: taskDraft.id || makeId(),
            };

            addTask(taskEditor.stageId, nextTask);
          }}
        />
      </DialogContent>
    </Dialog>
  );
}

export function WorkflowModal({
  open,
  workflow,
  users,
  onOpenChange,
  onSave,
  saving = false,
}) {
  return open ? (
    <WorkflowModalEditor
      key={`${workflow?.id ?? "new"}-${open ? "open" : "closed"}`}
      workflow={workflow}
      users={users}
      onOpenChange={onOpenChange}
      onSave={onSave}
      saving={saving}
    />
  ) : null;
}
