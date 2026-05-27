import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { CheckCircle2, Lock, Play } from "lucide-react";

import { useAuth } from "../context/AuthContext";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";

export function RunBoardPage() {
  const { apiBase, token } = useAuth();
  const { runId } = useParams();
  const [board, setBoard] = useState(null);
  const [loading, setLoading] = useState(true);

  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  const loadBoard = async () => {
    const response = await fetch(`${apiBase}/workflows/runs/${runId}`, {
      headers,
    });
    if (!response.ok) {
      throw new Error("Failed to load workflow run");
    }
    setBoard(await response.json());
    setLoading(false);
  };

  useEffect(() => {
    loadBoard().catch(() => setLoading(false));
  }, [apiBase, runId, token]);

  const completeTask = async (taskId) => {
    const response = await fetch(
      `${apiBase}/workflows/runs/${runId}/tasks/${taskId}/complete`,
      {
        method: "POST",
        headers,
      },
    );
    if (!response.ok) {
      const payload = await response.json();
      throw new Error(payload.detail || "Unable to complete task");
    }
    await loadBoard();
  };

  if (loading) {
    return <div className="text-sm text-slate-300">Loading run board...</div>;
  }

  if (!board) {
    return <div className="text-sm text-rose-200">Run not found.</div>;
  }

  return (
    <div className="space-y-6">
      <Card className="border-white/10 bg-slate-950/55">
        <CardHeader>
          <div className="flex flex-wrap items-center gap-3">
            <Badge variant="outline">{board.status}</Badge>
            <CardTitle className="text-2xl text-white">
              {board.workflow_title}
            </CardTitle>
          </div>
          <p className="text-sm text-slate-400">
            Run #{board.id} - stage progression unlocks the next step only after
            the prior stage is completed.
          </p>
        </CardHeader>
      </Card>

      <div className="grid gap-4 xl:grid-cols-[repeat(auto-fit,minmax(260px,1fr))]">
        {board.stages.map((stage) => (
          <Card key={stage.id} className="border-white/10 bg-slate-950/55">
            <CardHeader>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <CardTitle className="text-lg text-white">
                    {stage.title}
                  </CardTitle>
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                    {stage.completed
                      ? "Completed"
                      : stage.locked
                        ? "Locked"
                        : "Active"}
                  </p>
                </div>
                {stage.completed ? (
                  <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                ) : stage.locked ? (
                  <Lock className="h-5 w-5 text-slate-500" />
                ) : (
                  <Play className="h-5 w-5 text-sky-300" />
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {stage.tasks.map((task) => (
                <div
                  key={task.id}
                  className="rounded-2xl border border-white/10 bg-white/5 p-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-sm font-medium text-white">
                        {task.title}
                      </div>
                      <div className="mt-1 text-xs text-slate-400">
                        {task.description || "No description"}
                      </div>
                    </div>
                    <Badge
                      variant={
                        task.status === "completed" ? "success" : "outline"
                      }
                    >
                      {task.status}
                    </Badge>
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-3">
                    <div className="text-xs text-slate-400">
                      Priority: {task.priority || "normal"}
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      variant={
                        task.status === "completed" ? "secondary" : "default"
                      }
                      disabled={task.status === "completed" || stage.locked}
                      onClick={() => completeTask(task.task_id)}
                    >
                      {task.status === "completed"
                        ? "Done"
                        : stage.locked
                          ? "Locked"
                          : "Complete"}
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
