import { useEffect, useState } from "react";

import { Badge } from "./ui/badge";
import { Card, CardContent } from "./ui/card";

const cards = [
  { key: "workflow_count", label: "Workflows" },
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
    return <div className="text-sm text-rose-300">{error}</div>;
  }

  if (!summary) {
    return <div className="text-sm text-zinc-400">Loading dashboard...</div>;
  }

  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
      {cards.map((card, index) => {
        const value = summary[card.key] ?? 0;
        const isPercent = card.key === "completion_percent";

        return (
          <Card
            key={card.key}
            className={[
              "border-zinc-800 bg-zinc-950 shadow-sm",
              index === 0 ? "md:col-span-2 xl:col-span-1" : "",
            ].join(" ")}
          >
            <CardContent className="space-y-3 p-4">
              <Badge
                variant="outline"
                className="w-fit rounded-full px-2.5 py-0.5 text-[10px] uppercase tracking-wide text-zinc-300"
              >
                {card.label}
              </Badge>
              <div className="text-3xl font-semibold text-zinc-50">
                {value}
                {isPercent ? "%" : ""}
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-zinc-900">
                <div
                  className="h-full rounded-full bg-violet-500"
                  style={{
                    width: `${Math.min(100, Number(value) || 0)}%`,
                  }}
                />
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
