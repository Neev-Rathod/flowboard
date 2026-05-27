import { useEffect, useState } from "react";

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
        <div
          key={card.key}
          className="rounded-2xl border border-white/10 bg-slate-950/50 p-4"
        >
          <div className="text-xs uppercase tracking-[0.2em] text-slate-500">
            {card.label}
          </div>
          <div className="mt-2 text-2xl font-semibold text-white">
            {summary[card.key] ?? 0}
          </div>
        </div>
      ))}
    </div>
  );
}
