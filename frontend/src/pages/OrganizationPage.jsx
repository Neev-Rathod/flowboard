import { useEffect, useState } from "react";
import { Network, Plus, Link2 } from "lucide-react";

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
import { useAuth } from "../context/AuthContext";

export function OrganizationPage() {
  const { apiBase, token } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    document.title = "Organization Hierarchy | Flowboard Org Orchestrator";

    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement("meta");
      metaDesc.setAttribute("name", "description");
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute(
      "content",
      "View the reporting hierarchy as a canvas, add new people, and connect them to the right manager.",
    );
  }, []);

  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  const loadOrganization = async () => {
    const response = await fetch(`${apiBase}/organization/users`, { headers });
    if (!response.ok) {
      throw new Error("Failed to load organization data");
    }
    setUsers(await response.json());
  };

  useEffect(() => {
    loadOrganization()
      .catch((requestError) => setError(requestError.message))
      .finally(() => setLoading(false));
  }, [apiBase, token]);

  const createUser = async (payload) => {
    const response = await fetch(`${apiBase}/organization/users`, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });

    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.detail || "Unable to create user");
    }

    return result;
  };

  const updateUser = async (userId, payload) => {
    const response = await fetch(`${apiBase}/organization/users/${userId}`, {
      method: "PATCH",
      headers,
      body: JSON.stringify(payload),
    });

    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.detail || "Unable to update user");
    }

    return result;
  };

  const deleteUser = async (userId) => {
    const response = await fetch(`${apiBase}/organization/users/${userId}`, {
      method: "DELETE",
      headers,
    });

    if (!response.ok && response.status !== 204) {
      const result = await response.json();
      throw new Error(result.detail || "Unable to delete user");
    }

    return null;
  };

  const attachUser = async (userId, managerId) => {
    const response = await fetch(`${apiBase}/organization/users/${userId}`, {
      method: "PATCH",
      headers,
      body: JSON.stringify({
        manager_id: managerId,
        is_attached: true,
      }),
    });

    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.detail || "Unable to attach user");
    }

    return result;
  };

  return (
    <main className="space-y-6 animate-fade-in" id="org-page-main">
      <Card className="border-zinc-200 bg-white shadow-sm">
        <CardHeader className="border-b border-zinc-200 pb-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              variant="secondary"
              className="rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide text-zinc-700"
            >
              Reporting hierarchy
            </Badge>
            <Badge
              variant="outline"
              className="rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide text-zinc-700"
            >
              Canvas mode
            </Badge>
          </div>
          <CardTitle className="mt-3 flex items-center gap-2 text-2xl font-semibold tracking-tight text-zinc-950">
            <Network className="h-6 w-6 text-zinc-500" />
            Reporting Hierarchy
          </CardTitle>
          <CardDescription className="max-w-3xl text-sm text-zinc-600">
            Add people to the canvas, then connect the bottom handle of a
            manager to the top handle of a person to place them in the tree.
          </CardDescription>
        </CardHeader>
      </Card>

      {error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      <section id="org-tree-section" className="min-h-0">
        <Card className="min-h-[760px] border-zinc-200 bg-white shadow-sm">
          <CardContent className="h-full p-0">
            <OrganizationTree
              users={users}
              loading={loading}
              onCreateUser={createUser}
              onUpdateUser={updateUser}
              onDeleteUser={deleteUser}
              onAttachUser={attachUser}
              onRefresh={loadOrganization}
            />
          </CardContent>
        </Card>
      </section>

      <Card className="border-zinc-200 bg-white shadow-sm">
        <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4 text-sm text-zinc-600">
          <div className="flex items-center gap-2">
            <Link2 className="h-4 w-4 text-zinc-500" />
            Drag from a manager’s bottom handle to a person’s top handle to
            attach them.
          </div>
          <div className="flex items-center gap-2">
            <Plus className="h-4 w-4 text-zinc-500" />
            Use Add person inside the canvas to place a new employee.
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
