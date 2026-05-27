import WorkflowList from "../components/WorkflowList";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { useAuth } from "../context/AuthContext";

export function WorkflowsPage() {
  const { apiBase, token } = useAuth();

  return (
    <Card className="border-white/10 bg-slate-950/55">
      <CardHeader>
        <CardTitle className="text-2xl text-white">Workflow builder</CardTitle>
      </CardHeader>
      <CardContent>
        <WorkflowList apiBase={apiBase} token={token} />
      </CardContent>
    </Card>
  );
}
