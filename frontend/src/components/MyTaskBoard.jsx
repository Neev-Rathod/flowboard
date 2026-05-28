import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  ChevronRight,
  GripVertical,
  Inbox,
  Loader2,
} from "lucide-react";

import { getTaskLane, getTaskLaneLabel } from "../lib/taskStatus";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import {
  Kanban,
  KanbanBoard,
  KanbanColumn,
  KanbanColumnContent,
  KanbanColumnHandle,
  KanbanItem,
  KanbanItemHandle,
  KanbanOverlay,
} from "./reui/kanban";

export function MyTaskBoard({ apiBase, token, onTaskCompleted }) {
  const [tasks, setTasks] = useState([]);
  const [columns, setColumns] = useState({
    backlog: [],
    in_progress: [],
    todo: [],
    completed: [],
  });
  const [loading, setLoading] = useState(true);
  const [completingTaskId, setCompletingTaskId] = useState(null);
  const [completionNotes, setCompletionNotes] = useState({});
  const [error, setError] = useState("");

  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  const loadTasks = async () => {
    try {
      const response = await fetch(`${apiBase}/workflows/tasks/assigned`, {
        headers,
      });

      if (!response.ok) {
        throw new Error("Failed to load assigned tasks");
      }

      const data = await response.json();
      setTasks(data);
      setColumns({
        backlog: data.filter((task) => getTaskLane(task) === "backlog"),
        in_progress: data.filter((task) => getTaskLane(task) === "in_progress"),
        todo: data.filter((task) => getTaskLane(task) === "todo"),
        completed: data.filter((task) => getTaskLane(task) === "completed"),
      });
      setCompletionNotes((current) => {
        const next = { ...current };
        data.forEach((task) => {
          next[task.task_id] = task.notes || next[task.task_id] || "";
        });
        return next;
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, [apiBase, token]);

  const handleComplete = async (workflowId, taskId) => {
    setCompletingTaskId(taskId);

    try {
      const response = await fetch(
        `${apiBase}/workflows/${workflowId}/tasks/${taskId}/complete`,
        {
          method: "POST",
          headers,
          body: JSON.stringify({ notes: completionNotes[taskId] || null }),
        },
      );

      if (!response.ok) {
        const payload = await response.json();
        throw new Error(payload.detail || "Unable to complete task");
      }

      await loadTasks();
      onTaskCompleted?.();
      return true;
    } catch (err) {
      alert(err.message);
      return false;
    } finally {
      setCompletingTaskId(null);
    }
  };

  const groupedColumns = useMemo(
    () => ({
      backlog: columns.backlog,
      in_progress: columns.in_progress,
      todo: columns.todo,
      completed: columns.completed,
    }),
    [columns],
  );

  const handleItemMove = async ({ itemValue, fromColumn, toColumn }) => {
    if (fromColumn === toColumn) return;

    const movedTask = Object.values(columns)
      .flat()
      .find((task) => String(task.task_id) === String(itemValue));

    if (!movedTask) return;

    if (toColumn === "completed" && movedTask.status !== "completed") {
      const completed = await handleComplete(
        movedTask.workflow_id,
        movedTask.task_id,
      );

      if (!completed) {
        await loadTasks();
      }
    }
  };

  if (loading) {
    return (
      <div className="flex h-48 items-center justify-center text-zinc-500">
        <Loader2 className="mr-2 h-6 w-6 animate-spin text-zinc-900" />
        <span className="text-sm font-medium">Loading your task board...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-rose-900/50 bg-rose-950/60 p-4 text-sm text-rose-200">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-zinc-50">
          <Inbox className="h-5 w-5 text-zinc-400" />
          My Work Board
        </h2>
        <Badge
          variant="outline"
          className="rounded-full border-zinc-700 bg-zinc-900 text-zinc-200"
        >
          {tasks.length} assigned {tasks.length === 1 ? "task" : "tasks"}
        </Badge>
      </div>

      {tasks.length === 0 ? (
        <Card className="border-zinc-800 bg-zinc-950 shadow-sm">
          <CardContent className="flex flex-col items-center justify-center space-y-3 p-8 text-center">
            <div className="rounded-full bg-emerald-950/60 p-3 text-emerald-300">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-50">
                All caught up!
              </p>
              <p className="mt-1 max-w-xs text-xs text-zinc-400">
                No active tasks are assigned to you in the current stage of any
                running workflows.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Kanban
          value={groupedColumns}
          onValueChange={setColumns}
          onItemMove={handleItemMove}
          getItemValue={(item) => String(item.task_id)}
          className="space-y-4"
        >
          <KanbanBoard className="grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
            {[
              {
                id: "backlog",
                title: "Backlog",
                description: "Overdue work that has passed its assigned time.",
              },
              {
                id: "in_progress",
                title: "In Progress",
                description: "Work currently being handled.",
              },
              {
                id: "todo",
                title: "To Do",
                description: "Queued work that is ready to start.",
              },
              {
                id: "completed",
                title: "Completed",
                description: "Finished work with attached notes.",
              },
            ].map((column) => (
              <KanbanColumn key={column.id} value={column.id}>
                <KanbanColumnHandle>
                  <div>
                    <h3 className="text-sm font-semibold tracking-tight text-zinc-50">
                      {column.title}
                    </h3>
                    <p className="text-xs text-zinc-400">
                      {column.description}
                    </p>
                  </div>
                  <Badge
                    variant="outline"
                    className="rounded-full border-zinc-700 bg-zinc-900 text-zinc-200"
                  >
                    {groupedColumns[column.id]?.length || 0}
                  </Badge>
                </KanbanColumnHandle>

                <KanbanColumnContent value={column.id}>
                  {(groupedColumns[column.id] || []).map((task) => {
                    const lane = getTaskLane(task);
                    const canDrag =
                      task.status !== "completed" && lane !== "backlog";

                    return (
                      <KanbanItem
                        key={`${task.workflow_id}-${task.task_id}`}
                        value={String(task.task_id)}
                        disabled={!canDrag}
                      >
                        <div className="space-y-3">
                          <div className="flex items-start justify-between gap-3">
                            <div className="space-y-1">
                              {canDrag ? (
                                <KanbanItemHandle>
                                  <div className="flex items-center gap-2 text-[10px] uppercase tracking-wide text-zinc-500">
                                    <GripVertical className="h-3.5 w-3.5" />
                                    Drag card
                                  </div>
                                </KanbanItemHandle>
                              ) : null}
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="text-xs font-semibold uppercase tracking-wide text-zinc-200">
                                  {task.workflow_title}
                                </span>
                                <ChevronRight className="h-3 w-3 text-zinc-500" />
                                <span className="text-xs font-medium text-zinc-400">
                                  {task.stage_title}
                                </span>
                                <Badge
                                  variant={
                                    task.priority === "high"
                                      ? "destructive"
                                      : task.priority === "medium"
                                        ? "warning"
                                        : "outline"
                                  }
                                  className="ml-1 px-1.5 py-0.5 text-[10px]"
                                >
                                  {task.priority || "normal"}
                                </Badge>
                              </div>
                            </div>

                            <Badge
                              variant={
                                lane === "completed" ? "success" : "outline"
                              }
                              className="rounded-full px-2 py-0.5 text-[10px] uppercase tracking-wide"
                            >
                              {getTaskLaneLabel(lane)}
                            </Badge>
                          </div>

                          <h3 className="text-sm font-semibold tracking-tight text-zinc-50">
                            {task.title}
                          </h3>

                          {task.description ? (
                            <p className="max-w-xl text-xs leading-relaxed text-zinc-400">
                              {task.description}
                            </p>
                          ) : null}

                          {task.due_date ? (
                            <p className="text-[11px] uppercase tracking-[0.2em] text-zinc-500">
                              Due {new Date(task.due_date).toLocaleDateString()}
                            </p>
                          ) : null}

                          {task.notes ? (
                            <p className="max-w-xl rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs leading-relaxed text-zinc-300">
                              <span className="font-semibold uppercase tracking-wide text-zinc-500">
                                Note
                              </span>{" "}
                              {task.notes}
                            </p>
                          ) : null}

                          {task.status !== "completed" ? (
                            <textarea
                              value={completionNotes[task.task_id] || ""}
                              onChange={(event) =>
                                setCompletionNotes((current) => ({
                                  ...current,
                                  [task.task_id]: event.target.value,
                                }))
                              }
                              placeholder="Add a completion note or relevant update"
                              rows={3}
                              className="w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-zinc-100 outline-none transition placeholder:text-zinc-500 focus:border-violet-500/50 focus:bg-zinc-950"
                            />
                          ) : null}

                          <div className="flex items-center justify-end">
                            <Button
                              type="button"
                              size="sm"
                              variant={
                                lane === "completed" ? "secondary" : "default"
                              }
                              className="h-9 rounded-xl px-4 font-semibold transition-all duration-200"
                              disabled={
                                task.status === "completed" ||
                                completingTaskId === task.task_id
                              }
                              onClick={() =>
                                handleComplete(task.workflow_id, task.task_id)
                              }
                            >
                              {completingTaskId === task.task_id ? (
                                <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                              ) : (
                                <CheckCircle2 className="mr-1.5 h-4 w-4" />
                              )}
                              {task.status === "completed"
                                ? "Done"
                                : "Complete"}
                            </Button>
                          </div>
                        </div>
                      </KanbanItem>
                    );
                  })}
                </KanbanColumnContent>
              </KanbanColumn>
            ))}
          </KanbanBoard>

          <KanbanOverlay>
            <div className="flex h-full items-start justify-center pt-24">
              <div className="rounded-2xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm font-medium text-zinc-200 shadow-xl">
                Moving task...
              </div>
            </div>
          </KanbanOverlay>
        </Kanban>
      )}
    </div>
  );
}
