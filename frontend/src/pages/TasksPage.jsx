import { useEffect } from "react";

import { MyTaskBoard } from "../components/MyTaskBoard";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { useAuth } from "../context/AuthContext";

export function TasksPage() {
  const { apiBase, token } = useAuth();

  useEffect(() => {
    document.title = "Tasks | Flowboard";
  }, []);

  return (
    <main className="space-y-6">
      <Card className="border-zinc-200 bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold text-zinc-950">
            My Tasks
          </CardTitle>
          <CardDescription className="text-zinc-500">
            Complete the tasks assigned to you. The next stage unlocks only
            after the current stage is finished.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <MyTaskBoard apiBase={apiBase} token={token} />
        </CardContent>
      </Card>
    </main>
  );
}
