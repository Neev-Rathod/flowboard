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
    <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
      <Card className="border-white/10 bg-slate-950/55">
        <CardHeader>
          <Badge className="w-fit bg-sky-400/15 text-sky-100 border-sky-400/20">
            Org chart
          </Badge>
          <CardTitle className="text-2xl text-white">
            Reporting hierarchy
          </CardTitle>
          <CardDescription>
            Admins can see the full tree. Managers and HR can create people and
            place them under the right reporting line.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <OrganizationTree tree={tree} />
        </CardContent>
      </Card>

      <div className="space-y-6">
        <Card className="border-white/10 bg-slate-950/55">
          <CardHeader>
            <CardTitle className="text-2xl text-white">Add a user</CardTitle>
            <CardDescription>
              Create admins, HR, managers, and contributors with a reporting
              manager.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={createUser}>
              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  name="username"
                  value={form.username}
                  onChange={handleChange}
                  placeholder="sara.khan"
                />
                <Input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="sara@company.com"
                />
                <Input
                  name="job_title"
                  value={form.job_title}
                  onChange={handleChange}
                  placeholder="Senior Developer"
                />
                <Input
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Temp password"
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                  placeholder="manager"
                />
                <select
                  name="manager_id"
                  value={form.manager_id}
                  onChange={handleChange}
                  className="h-11 w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-2 text-sm text-white outline-none"
                >
                  <option value="">No manager</option>
                  {users.map((candidate) => (
                    <option key={candidate.id} value={candidate.id}>
                      {candidate.username} - {candidate.job_title}
                    </option>
                  ))}
                </select>
              </div>

              {error ? (
                <div className="rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
                  {error}
                </div>
              ) : null}
              {message ? (
                <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-100">
                  {message}
                </div>
              ) : null}

              <Button type="submit" className="w-full">
                Add user
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-slate-950/55">
          <CardHeader>
            <CardTitle className="text-2xl text-white">
              Assignment rule
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-slate-300">
            <p>
              Managers can assign workflow runs only to people below them in the
              hierarchy. Admins can assign to anyone.
            </p>
            <p>
              Current signed-in user:{" "}
              <span className="text-white">{user?.username}</span> ({user?.role}
              )
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
