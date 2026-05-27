import DashboardSummary from "../components/DashboardSummary";
import WorkflowList from "../components/WorkflowList";
import { Badge } from "../components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { useAuth } from "../context/AuthContext";

export function DashboardPage() {
  const { apiBase, token, user } = useAuth();

  return (
    <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
      <div className="space-y-6">
        <Card className="border-white/10 bg-slate-950/55">
          <CardHeader>
            <Badge className="w-fit bg-emerald-400/15 text-emerald-100 border-emerald-400/20">
              {user?.role || "employee"}
            </Badge>
            <CardTitle className="mt-2 text-3xl text-white">
              Good to see you, {user?.username}.
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm leading-6 text-slate-300">
            Manage hierarchy-driven workflows, hand off runs to direct reports,
            and keep HR and engineering work visible in one place.
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-slate-950/55">
          <CardHeader>
            <CardTitle className="text-xl text-white">
              Dashboard analytics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <DashboardSummary apiBase={apiBase} token={token} />
          </CardContent>
        </Card>
      </div>

      <Card className="border-white/10 bg-slate-950/55">
        <CardHeader>
          <CardTitle className="text-xl text-white">Recent workflows</CardTitle>
        </CardHeader>
        <CardContent>
          <WorkflowList apiBase={apiBase} token={token} />
        </CardContent>
      </Card>
    </div>
  );
}
