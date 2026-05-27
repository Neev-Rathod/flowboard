import { useEffect, useState } from "react";
import { OrganizationTree } from "../components/OrganizationTree";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Input } from "../components/ui/input";
import { useAuth } from "../context/AuthContext";
import { UserPlus, Network, Info } from "lucide-react";

const emptyForm = {
  username: "",
  email: "",
  password: "",
  role: "employee",
  job_title: "Employee",
  manager_id: "",
};

export function OrganizationPage() {
  const { apiBase, token, user } = useAuth();
  const [tree, setTree] = useState([]);
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // SEO & Head Metadata
  useEffect(() => {
    document.title = "Organization Hierarchy | Flowboard Org Orchestrator";
    
    // Manage meta description
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement("meta");
      metaDesc.setAttribute("name", "description");
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute(
      "content",
      "Manage employee reporting lines, define roles, and view organizational structure in Flowboard."
    );
  }, []);

  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  const loadOrganization = async () => {
    const [treeResponse, usersResponse] = await Promise.all([
      fetch(`${apiBase}/organization/tree`, { headers }),
      fetch(`${apiBase}/organization/users`, { headers }),
    ]);

    if (!treeResponse.ok || !usersResponse.ok) {
      throw new Error("Failed to load organization data");
    }

    setTree(await treeResponse.json());
    setUsers(await usersResponse.json());
  };

  useEffect(() => {
    loadOrganization().catch((requestError) => setError(requestError.message));
  }, [apiBase, token]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const createUser = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");

    try {
      const response = await fetch(`${apiBase}/organization/users`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          username: form.username.trim(),
          email: form.email.trim(),
          password: form.password,
          role: form.role,
          job_title: form.job_title,
          manager_id: form.manager_id ? Number(form.manager_id) : null,
        }),
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.detail || "Unable to create user");
      }

      setMessage(`${payload.username} added to the organization tree.`);
      setForm(emptyForm);
      await loadOrganization();
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  return (
    <main className="space-y-6 animate-fade-in" id="org-page-main">
      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        
        {/* Left Side: Org Tree */}
        <section id="org-tree-section">
          <Card className="border-white/10 bg-slate-950/40 backdrop-blur-md shadow-xl h-full">
            <CardHeader className="border-b border-white/5 pb-4">
              <div className="flex items-center gap-2">
                <Badge className="bg-sky-400/10 text-sky-300 border border-sky-400/20 px-2 py-0.5 rounded-full text-xs font-semibold uppercase">
                  Reporting tree
                </Badge>
              </div>
              <CardTitle className="text-2xl font-bold text-white flex items-center gap-2 mt-2">
                <Network className="h-6 w-6 text-sky-400" />
                Reporting Hierarchy
              </CardTitle>
              <CardDescription className="text-slate-400 text-xs">
                Visualize the complete reporting line of Northstar Systems. Managers can create people and place them under the right supervisor.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <OrganizationTree tree={tree} />
            </CardContent>
          </Card>
        </section>

        {/* Right Side: Add User & Information */}
        <section className="space-y-6" id="org-form-section">
          
          {/* Add User Card */}
          <Card className="border-white/10 bg-slate-950/50 backdrop-blur-md shadow-lg">
            <CardHeader className="border-b border-white/5 pb-4">
              <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-indigo-400" />
                Add Organization User
              </CardTitle>
              <CardDescription className="text-xs text-slate-400">
                Register a new administrator, manager, HR associate, developer, or QA specialist.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <form className="space-y-4" onSubmit={createUser}>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide" htmlFor="org-username">
                      Username
                    </label>
                    <Input
                      id="org-username"
                      name="username"
                      value={form.username}
                      onChange={handleChange}
                      required
                      placeholder="sara.khan"
                      className="bg-slate-950/70 border-white/10 h-10 text-sm focus:border-sky-400/50"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide" htmlFor="org-email">
                      Email Address
                    </label>
                    <Input
                      id="org-email"
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={handleChange}
                      required
                      placeholder="sara@company.com"
                      className="bg-slate-950/70 border-white/10 h-10 text-sm focus:border-sky-400/50"
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide" htmlFor="org-job-title">
                      Job Title
                    </label>
                    <Input
                      id="org-job-title"
                      name="job_title"
                      value={form.job_title}
                      onChange={handleChange}
                      required
                      placeholder="Senior Developer"
                      className="bg-slate-950/70 border-white/10 h-10 text-sm focus:border-sky-400/50"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide" htmlFor="org-password">
                      Password
                    </label>
                    <Input
                      id="org-password"
                      name="password"
                      type="password"
                      value={form.password}
                      onChange={handleChange}
                      required
                      placeholder="Temp password"
                      className="bg-slate-950/70 border-white/10 h-10 text-sm focus:border-sky-400/50"
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide" htmlFor="org-role">
                      System Role
                    </label>
                    <Input
                      id="org-role"
                      name="role"
                      value={form.role}
                      onChange={handleChange}
                      required
                      placeholder="employee, admin, manager, QA"
                      className="bg-slate-950/70 border-white/10 h-10 text-sm focus:border-sky-400/50"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide" htmlFor="org-manager">
                      Reporting Manager
                    </label>
                    <select
                      id="org-manager"
                      name="manager_id"
                      value={form.manager_id}
                      onChange={handleChange}
                      className="h-10 w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 text-xs text-white outline-none focus:border-sky-400/50 transition duration-200"
                    >
                      <option value="">No manager (Top level)</option>
                      {users.map((candidate) => (
                        <option key={candidate.id} value={candidate.id}>
                          {candidate.username} ({candidate.job_title})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {error && (
                  <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-xs text-rose-300 font-medium">
                    {error}
                  </div>
                )}
                {message && (
                  <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-xs text-emerald-300 font-medium">
                    {message}
                  </div>
                )}

                <Button 
                  type="submit" 
                  id="org-add-user-submit"
                  className="w-full bg-sky-500 hover:bg-sky-400 text-slate-950 font-semibold shadow-lg shadow-sky-500/15"
                >
                  Create User Record
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Info Card */}
          <Card className="border-white/10 bg-slate-950/30 backdrop-blur-md shadow-sm">
            <CardHeader className="flex flex-row items-center gap-3 space-y-0 p-4">
              <Info className="h-5 w-5 text-indigo-400 shrink-0" />
              <div>
                <CardTitle className="text-sm font-bold text-white">
                  Hierarchy Hand-Off Rules
                </CardTitle>
                <CardDescription className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Only Admins and Managers hold privileges to delegate workflow runs. Managers are restricted to starting runs for employees nested under their own tree.
                </CardDescription>
              </div>
            </CardHeader>
          </Card>
        </section>

      </div>
    </main>
  );
}
