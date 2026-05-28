import { ArrowRight } from "lucide-react";

import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";

export function ActiveRunsTable({ workflows, onOpenWorkflow, loading }) {
  if (loading) {
    return (
      <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4 text-sm text-zinc-400">
        Loading active workflows...
      </div>
    );
  }

  return (
    <Card className="border-zinc-800 bg-zinc-950/90 shadow-[0_24px_100px_-45px_rgba(0,0,0,0.85)] backdrop-blur-xl">
      <CardHeader>
        <CardTitle className="text-lg text-zinc-50">Active workflows</CardTitle>
        <CardDescription>
          Open a workflow and jump directly into its board.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {workflows.length === 0 ? (
          <div className="rounded-xl border border-dashed border-zinc-800 bg-zinc-950 px-4 py-8 text-center text-sm text-zinc-400">
            No active workflows yet.
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950">
            <table className="w-full divide-y divide-zinc-800 text-left text-sm">
              <thead className="bg-zinc-900 text-xs uppercase tracking-wide text-zinc-400">
                <tr>
                  <th className="px-4 py-3 font-medium">Workflow</th>
                  <th className="px-4 py-3 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800 bg-zinc-950">
                {workflows.map((workflow) => (
                  <tr key={workflow.id} className="hover:bg-zinc-900/70">
                    <td className="px-4 py-3">
                      <div className="font-medium text-zinc-50">
                        {workflow.title}
                      </div>
                      <div className="text-xs text-zinc-400">
                        {workflow.stages?.length || 0} stages
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => onOpenWorkflow?.(workflow.id)}
                      >
                        Open board
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
