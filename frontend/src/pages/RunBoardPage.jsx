import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { CheckCircle2, Lock, Play, Sparkles, User, Clock, AlertTriangle } from "lucide-react";

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
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [completingTaskId, setCompletingTaskId] = useState(null);

  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  // SEO & Page Titles
  useEffect(() => {
    document.title = `Run #${runId} Status Board | Flowboard`;
    
    // Manage meta description
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement("meta");
      metaDesc.setAttribute("name", "description");
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute(
      "content",
      `Flowboard run #${runId} interactive kanban board. Unlock stages sequentially to complete high-fidelity business pipelines.`
    );
  }, [runId]);

  const loadData = async () => {
    try {
      const [boardRes, usersRes] = await Promise.all([
        fetch(`${apiBase}/workflows/runs/${runId}`, { headers }),
        fetch(`${apiBase}/organization/users`, { headers }),
      ]);
      
      if (!boardRes.ok) throw new Error("Failed to load workflow run board");
      if (!usersRes.ok) throw new Error("Failed to load user directories");

      setBoard(await boardRes.json());
      setUsers(await usersRes.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [apiBase, runId, token]);

  const completeTask = async (taskId) => {
    setCompletingTaskId(taskId);
    try {
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
      await loadData();
    } catch (err) {
      alert(err.message);
    } finally {
      setCompletingTaskId(null);
    }
  };

  // Find user details by ID
  const getUserDetails = (userId) => {
    if (!userId) return null;
    return users.find((u) => u.id === userId) || null;
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center text-slate-300">
        <div className="flex flex-col items-center gap-3">
          <svg className="animate-spin h-8 w-8 text-sky-400" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span className="text-sm font-semibold">Loading Kanban Run Board...</span>
        </div>
      </div>
    );
  }

  if (!board) {
    return (
      <Card className="border-rose-500/20 bg-rose-500/5 p-6 text-center text-rose-300">
        <div className="flex flex-col items-center gap-2">
          <AlertTriangle className="h-8 w-8 text-rose-400" />
          <h2 className="text-lg font-bold">Run Not Found</h2>
          <p className="text-xs text-slate-400">The requested workflow run board could not be loaded. Verify details.</p>
        </div>
      </Card>
    );
  }

  return (
    <main className="space-y-6 animate-fade-in" id="run-board-main">
      {/* Top Banner Status */}
      <Card className="relative overflow-hidden border border-white/10 bg-slate-950/40 backdrop-blur-md shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-r from-sky-500/5 via-indigo-500/5 to-transparent pointer-events-none" />
        <CardHeader className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-3">
              <Badge 
                variant={board.status === "completed" ? "success" : "outline"}
                className={`px-3 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide border-none ${
                  board.status === "completed" 
                    ? "bg-emerald-500/15 text-emerald-300"
                    : "bg-sky-500/15 text-sky-300 animate-pulse"
                }`}
              >
                {board.status}
              </Badge>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
                {board.workflow_title}
              </h1>
            </div>
            <p className="text-xs text-slate-400 max-w-xl">
              Active Run ID #{board.id} — Sequential stage locks guarantee step-by-step progress. Completing all tasks in a stage unlocks the next step dynamically.
            </p>
          </div>
          
          <div className="flex items-center gap-3 text-xs text-slate-400 border border-white/5 bg-slate-950/60 rounded-2xl px-4 py-3 shrink-0">
            <Clock className="h-4 w-4 text-sky-400" />
            <div>
              <p className="font-semibold text-white">Started</p>
              <p className="mt-0.5 text-[10px]">
                {board.started_at ? new Date(board.started_at).toLocaleString() : "Date unknown"}
              </p>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Grid Columns for Stages */}
      <div 
        id="run-board-kanban-grid"
        className="grid gap-6 xl:grid-cols-[repeat(auto-fit,minmax(280px,1fr))]"
      >
        {board.stages.map((stage) => {
          const statusText = stage.completed ? "Completed" : stage.locked ? "Locked" : "Active";
          
          return (
            <Card 
              key={stage.id} 
              className={`relative flex flex-col border transition-all duration-300 rounded-3xl ${
                stage.completed
                  ? "border-emerald-500/20 bg-slate-950/30"
                  : stage.locked
                    ? "border-white/5 bg-slate-950/15 opacity-60"
                    : "border-sky-500/30 bg-slate-950/50 shadow-2xl shadow-sky-500/5 ring-1 ring-sky-500/10"
              }`}
            >
              {/* Header */}
              <CardHeader className="border-b border-white/5 p-4 flex flex-row items-start justify-between gap-3 shrink-0">
                <div className="space-y-1">
                  <CardTitle className="text-base font-bold text-white tracking-tight">
                    {stage.title}
                  </CardTitle>
                  <span className={`text-[10px] uppercase font-bold tracking-widest ${
                    stage.completed 
                      ? "text-emerald-400" 
                      : stage.locked 
                        ? "text-slate-500" 
                        : "text-sky-300 font-extrabold flex items-center gap-1"
                  }`}>
                    {!stage.completed && !stage.locked && (
                      <span className="h-1.5 w-1.5 rounded-full bg-sky-400 animate-ping" />
                    )}
                    {statusText}
                  </span>
                </div>

                {stage.completed ? (
                  <div className="rounded-full bg-emerald-500/10 p-1.5 text-emerald-400 shrink-0">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                ) : stage.locked ? (
                  <div className="rounded-full bg-white/5 p-1.5 text-slate-500 shrink-0">
                    <Lock className="h-4 w-4" />
                  </div>
                ) : (
                  <div className="rounded-full bg-sky-500/15 p-1.5 text-sky-400 shrink-0 animate-pulse">
                    <Play className="h-4 w-4 fill-sky-400" />
                  </div>
                )}
              </CardHeader>

              {/* Tasks List */}
              <CardContent className="p-4 flex-1 space-y-3 overflow-y-auto">
                {stage.tasks.length === 0 ? (
                  <p className="text-xs text-slate-500 italic text-center py-4">No tasks in this stage</p>
                ) : (
                  stage.tasks.map((task) => {
                    const assignee = getUserDetails(task.assigned_to);
                    
                    return (
                      <div
                        key={task.id}
                        className={`rounded-2xl border p-3.5 space-y-3 transition-all duration-300 ${
                          task.status === "completed"
                            ? "border-emerald-500/10 bg-emerald-500/5"
                            : stage.locked
                              ? "border-white/5 bg-white/5"
                              : "border-white/10 bg-slate-900/60 hover:bg-slate-900/90 hover:border-sky-500/20"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-1">
                            <h3 className={`text-xs font-bold tracking-tight text-white ${
                              task.status === "completed" ? "line-through text-slate-400" : ""
                            }`}>
                              {task.title}
                            </h3>
                            <p className="text-[10px] text-slate-400 leading-normal line-clamp-2">
                              {task.description || "No description provided."}
                            </p>
                          </div>
                          <Badge
                            variant={task.status === "completed" ? "success" : "outline"}
                            className="text-[9px] px-1.5 py-0.5 rounded-full shrink-0"
                          >
                            {task.status}
                          </Badge>
                        </div>

                        {/* Assignee Details */}
                        {assignee && (
                          <div className="flex items-center gap-2 text-[10px] text-slate-300 border-t border-white/5 pt-2">
                            <div className="rounded-full bg-sky-500/10 p-1 text-sky-400">
                              <User className="h-3 w-3" />
                            </div>
                            <span className="font-semibold text-slate-200">
                              {assignee.username}
                            </span>
                            <span className="text-slate-500">
                              ({assignee.job_title})
                            </span>
                          </div>
                        )}

                        {/* Task Action Bar */}
                        <div className="flex items-center justify-between gap-3 pt-1">
                          <span className={`text-[9px] uppercase tracking-wide font-bold ${
                            task.priority === "high" ? "text-rose-400" : "text-slate-400"
                          }`}>
                            Priority: {task.priority || "normal"}
                          </span>
                          
                          <Button
                            type="button"
                            size="sm"
                            variant={task.status === "completed" ? "secondary" : "default"}
                            className={`h-8 rounded-xl text-[10px] font-bold px-3 transition-all duration-200 ${
                              task.status === "completed"
                                ? "bg-white/5 text-slate-400"
                                : stage.locked
                                  ? "bg-slate-900 border border-white/5 text-slate-500 cursor-not-allowed"
                                  : "bg-sky-500 hover:bg-sky-400 text-slate-950 shadow-md shadow-sky-500/10"
                            }`}
                            disabled={task.status === "completed" || stage.locked || completingTaskId === task.task_id}
                            onClick={() => completeTask(task.task_id)}
                          >
                            {completingTaskId === task.task_id ? (
                              <span className="flex items-center gap-1">
                                <svg className="animate-spin h-3.5 w-3.5 text-slate-950" viewBox="0 0 24 24" fill="none">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                              </span>
                            ) : task.status === "completed" ? (
                              "Done"
                            ) : stage.locked ? (
                              "Locked"
                            ) : (
                              "Complete"
                            )}
                          </Button>
                        </div>
                      </div>
                    );
                  })
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </main>
  );
}
