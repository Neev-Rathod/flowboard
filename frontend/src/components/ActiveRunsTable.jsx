import { useMemo } from "react";
import { CalendarClock, ArrowRight } from "lucide-react";

import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";

function formatDate(value) {
  if (!value) return "Not started";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not started";
  return date.toLocaleString();
}

export function ActiveRunsTable({ runs, workflows, onOpenRun, loading }) {
  const workflowById = useMemo(
    () => new Map((workflows || []).map((workflow) => [workflow.id, workflow])),
    [workflows],
  );

  if (loading) {
    return (
      <div className="rounded-xl border border-zinc-200 bg-white p-4 text-sm text-zinc-500">
        Loading active runs...
      </div>
    );
  }

  return (
    <Card className="border-zinc-200 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">Active runs</CardTitle>
        <CardDescription>
          Open a running pipeline and jump directly into its board.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {runs.length === 0 ? (
          <div className="rounded-xl border border-dashed border-zinc-200 bg-zinc-50 px-4 py-8 text-center text-sm text-zinc-500">
            No active runs yet. Start one from the workflows page.
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-zinc-200">
            <table className="w-full divide-y divide-zinc-200 text-left text-sm">
              <thead className="bg-zinc-50 text-xs uppercase tracking-wide text-zinc-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Workflow</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Started</th>
                  <th className="px-4 py-3 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 bg-white">
                {runs.map((run) => {
                  const workflow = workflowById.get(run.workflow_id);
                  return (
                    <tr key={run.id} className="hover:bg-zinc-50/80">
                      <td className="px-4 py-3">
                        <div className="font-medium text-zinc-950">
                          {workflow?.title || `Workflow #${run.workflow_id}`}
                        </div>
                        <div className="text-xs text-zinc-500">
                          Run #{run.id}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          variant={
                            run.status === "completed" ? "success" : "secondary"
                          }
                          className="rounded-full px-2.5 py-0.5 uppercase tracking-wide"
                        >
                          {run.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-zinc-600">
                        <div className="flex items-center gap-2">
                          <CalendarClock className="h-4 w-4 text-zinc-400" />
                          {formatDate(run.started_at)}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => onOpenRun?.(run.id)}
                        >
                          Open board
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
