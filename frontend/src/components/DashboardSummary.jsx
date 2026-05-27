import { useEffect, useState } from "react";

import { Badge } from "./ui/badge";
import { Card, CardContent } from "./ui/card";

const cards = [
  { key: "workflow_count", label: "Workflows" },
  { key: "run_count", label: "Runs" },
  { key: "task_count", label: "Tasks" },
  { key: "completed_task_count", label: "Completed" },
  { key: "overdue_task_count", label: "Overdue" },
  { key: "completion_percent", label: "Completion %" },
];

export default function DashboardSummary({ apiBase, token }) {
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const response = await fetch(`${apiBase}/workflows/dashboard/summary`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) {
          throw new Error("Failed to load dashboard summary");
        }
        const payload = await response.json();
        setSummary(payload);
      } catch (requestError) {
        setError(requestError.message);
      }
    };

    load();
  }, [apiBase, token]);

  if (error) {
    return <div className="text-sm text-rose-200">{error}</div>;
  }

  if (!summary) {
    return <div className="text-sm text-slate-300">Loading dashboard...</div>;
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {cards.map((card) => (
        <Card key={card.key} className="border-white/10 bg-slate-950/50">
          <CardContent className="space-y-3 p-4">
            <Badge variant="outline" className="w-fit">
              {card.label}
            </Badge>
            <div className="text-2xl font-semibold text-white">
              {summary[card.key] ?? 0}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
