import { useEffect, useState } from "react";
import { CheckCircle2, ChevronRight, Inbox, Loader2 } from "lucide-react";

import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";

export function MyTaskBoard({ apiBase, token, onTaskCompleted }) {
  const [tasks, setTasks] = useState([]);
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
    // Option A: If loadTasks is already an async function fetching data
    const fetchInitialData = async () => {
      await loadTasks();
    };

    fetchInitialData();
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
      if (onTaskCompleted) {
        onTaskCompleted();
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setCompletingTaskId(null);
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
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-zinc-950">
          <Inbox className="h-5 w-5 text-zinc-500" />
          My Active Work Board
        </h2>
        <Badge
          variant="outline"
          className="rounded-full border-zinc-200 bg-zinc-50 text-zinc-700"
        >
          {tasks.length} active {tasks.length === 1 ? "task" : "tasks"}
        </Badge>
      </div>

      {tasks.length === 0 ? (
        <Card className="border-zinc-200 bg-zinc-50 shadow-sm">
          <CardContent className="flex flex-col items-center justify-center p-8 text-center space-y-3">
            <div className="rounded-full bg-emerald-50 p-3 text-emerald-600">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-950">
                All caught up!
              </p>
              <p className="mt-1 max-w-xs text-xs text-zinc-500">
                No active tasks are assigned to you in the current stage of any
                running workflows.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {tasks.map((task) => (
            <Card
              key={`${task.workflow_id}-${task.task_id}`}
              className="group border-zinc-200 bg-white shadow-sm transition-all duration-300 hover:border-zinc-300 hover:shadow-md"
            >
              <CardContent className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-semibold uppercase tracking-wide text-zinc-700">
                      {task.workflow_title}
                    </span>
                    <ChevronRight className="h-3 w-3 text-zinc-400" />
                    <span className="text-xs font-medium text-zinc-500">
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
                  <h3 className="text-sm font-semibold tracking-tight text-zinc-950 transition-colors group-hover:text-zinc-700">
                    {task.title}
                  </h3>
                  {task.description && (
                    <p className="max-w-xl text-xs leading-relaxed text-zinc-500">
                      {task.description}
                    </p>
                  )}
                  {task.notes ? (
                    <p className="max-w-xl rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs leading-relaxed text-zinc-600">
                      <span className="font-semibold uppercase tracking-wide text-zinc-400">
                        Note
                      </span>{" "}
                      {task.notes}
                    </p>
                  ) : null}
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
                    className="max-w-xl w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs text-zinc-900 outline-none transition focus:border-zinc-400 focus:bg-white"
                  />
                </div>

                <div className="flex items-center gap-3 self-end md:self-center">
                  <Button
                    type="button"
                    size="sm"
                    variant="default"
                    className="h-9 rounded-xl px-4 font-semibold transition-all duration-200"
                    disabled={completingTaskId === task.task_id}
                    onClick={() =>
                      handleComplete(task.workflow_id, task.task_id)
                    }
                  >
                    {completingTaskId === task.task_id ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                    ) : (
                      <CheckCircle2 className="mr-1.5 h-4 w-4" />
                    )}
                    Complete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
