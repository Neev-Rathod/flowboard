import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Background,
  Controls,
  Handle,
  Position,
  ReactFlow,
  useEdgesState,
  useNodesState,
} from "@xyflow/react";
import { Plus, ShieldAlert, Trash2 } from "lucide-react";

import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Card, CardContent } from "./ui/card";

const nodeWidth = 244;
const horizontalGap = 42;
const verticalGap = 170;
const rootGap = 120;
const topPadding = 48;
const sidePadding = 48;
const unattachedGap = 28;

const roleTone = {
  admin: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20",
  manager: "bg-sky-500/10 text-sky-700 border-sky-500/20",
  employee: "bg-zinc-100 text-zinc-700 border-zinc-200",
  hr: "bg-violet-500/10 text-violet-700 border-violet-500/20",
  developer: "bg-cyan-500/10 text-cyan-700 border-cyan-500/20",
  qa: "bg-amber-500/10 text-amber-700 border-amber-500/20",
  support: "bg-rose-500/10 text-rose-700 border-rose-500/20",
  sales: "bg-indigo-500/10 text-indigo-700 border-indigo-500/20",
  finance: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20",
  product: "bg-orange-500/10 text-orange-700 border-orange-500/20",
  devops: "bg-teal-500/10 text-teal-700 border-teal-500/20",
};

function NodeCard({ data, selected }) {
  return (
    <div
      className={[
            "relative w-[244px] overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 shadow-sm transition-all",
        selected
            ? "ring-2 ring-violet-500/20"
            : "",
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-3 border-b border-zinc-200 px-4 py-3">
        <div className="min-w-0 space-y-1">
          <p className="truncate text-sm font-semibold text-zinc-50">
            {data.username}
          </p>
          <p className="truncate text-[11px] text-zinc-400">{data.jobTitle}</p>
        </div>
        <Badge
          variant="outline"
          className={[
            "shrink-0 rounded-full px-2 py-0.5 text-[10px] uppercase tracking-wide",
            roleTone[data.role] || roleTone.employee,
          ].join(" ")}
        >
          {data.role}
        </Badge>
      </div>

      <div className="space-y-2 px-4 py-3">
        <p className="line-clamp-2 text-[11px] leading-relaxed text-zinc-400">
          {data.email}
        </p>
        <p className="text-[11px] text-zinc-400">
          {data.managerName
            ? `Reports to ${data.managerName}`
            : "No manager assigned"}
        </p>
      </div>

      <Handle
        type="target"
        position={Position.Top}
        style={{
          width: 10,
          height: 10,
            background: "#a855f7",
            border: "2px solid #09090b",
        }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        style={{
          width: 10,
          height: 10,
            background: "#a855f7",
            border: "2px solid #09090b",
        }}
      />
    </div>
  );
}

function buildHierarchyLayout(users = []) {
  const attachedUsers = users.filter((user) => user.is_attached);
  const unattachedUsers = users.filter((user) => !user.is_attached);
  const userMap = new Map(attachedUsers.map((user) => [String(user.id), user]));
  const childrenByManager = new Map();

  attachedUsers.forEach((user) => {
    if (user.manager_id && userMap.has(String(user.manager_id))) {
      const key = String(user.manager_id);
      const current = childrenByManager.get(key) || [];
      current.push(user);
      childrenByManager.set(key, current);
    }
  });

  const roots = attachedUsers
    .filter((user) => !user.manager_id || !userMap.has(String(user.manager_id)))
    .sort((left, right) => left.id - right.id);

  const sortedChildren = (managerId) =>
    [...(childrenByManager.get(String(managerId)) || [])].sort(
      (left, right) => left.id - right.id,
    );

  const widths = new Map();
  let maxDepth = 0;

  const measure = (user) => {
    const children = sortedChildren(user.id);
    if (!children.length) {
      widths.set(String(user.id), nodeWidth);
      return nodeWidth;
    }

    const childWidths = children.map((child) => measure(child));
    const totalChildWidth =
      childWidths.reduce((total, width) => total + width, 0) +
      horizontalGap * (childWidths.length - 1);
    const width = Math.max(nodeWidth, totalChildWidth);
    widths.set(String(user.id), width);
    return width;
  };

  roots.forEach((root) => measure(root));

  const nodes = [];
  const edges = [];

  const placeNode = (user, left, depth) => {
    const children = sortedChildren(user.id);
    const subtreeWidth = widths.get(String(user.id)) || nodeWidth;
    const x = left + subtreeWidth / 2 - nodeWidth / 2;
    const y = topPadding + depth * verticalGap;
    maxDepth = Math.max(maxDepth, depth);

    nodes.push({
      id: `user-${user.id}`,
      type: "organizationNode",
      position: { x, y },
      data: {
        kind: "attached",
        userId: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        jobTitle: user.job_title,
        managerId: user.manager_id,
        managerName: user.manager_id
          ? userMap.get(String(user.manager_id))?.username || ""
          : "",
      },
    });

    if (!children.length) {
      return;
    }

    const childWidths = children.map(
      (child) => widths.get(String(child.id)) || nodeWidth,
    );
    const totalChildWidth =
      childWidths.reduce((total, width) => total + width, 0) +
      horizontalGap * (childWidths.length - 1);
    let currentLeft = left + (subtreeWidth - totalChildWidth) / 2;

    children.forEach((child, index) => {
      const childWidth = childWidths[index];
      edges.push({
        id: `edge-${user.id}-${child.id}`,
        source: `user-${user.id}`,
        target: `user-${child.id}`,
        type: "smoothstep",
        style: { stroke: "#cbd5e1", strokeWidth: 2 },
      });
      placeNode(child, currentLeft, depth + 1);
      currentLeft += childWidth + horizontalGap;
    });
  };

  let currentRootLeft = sidePadding;
  roots.forEach((root, index) => {
    const subtreeWidth = widths.get(String(root.id)) || nodeWidth;
    placeNode(root, currentRootLeft, 0);
    currentRootLeft += subtreeWidth + (index < roots.length - 1 ? rootGap : 0);
  });

  const unattachedY = topPadding + (maxDepth + 1) * verticalGap + 92;
  unattachedUsers
    .sort((left, right) => left.id - right.id)
    .forEach((user, index) => {
      nodes.push({
        id: `user-${user.id}`,
        type: "organizationNode",
        position: {
          x: sidePadding + index * (nodeWidth + unattachedGap),
          y: unattachedY,
        },
        data: {
          kind: "pending",
          userId: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          jobTitle: user.job_title,
          managerId: user.manager_id,
          managerName: "",
        },
      });
    });

  return { nodes, edges, unattachedCount: unattachedUsers.length };
}

function CreatePersonDialog({ open, onOpenChange, onCreate, saving }) {
  const initialDraft = {
    username: "",
    email: "",
    password: "",
    role: "employee",
    job_title: "Employee",
  };
  const [draft, setDraft] = useState({
    ...initialDraft,
  });
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    try {
      await onCreate?.({
        username: draft.username.trim(),
        email: draft.email.trim(),
        password: draft.password,
        role: draft.role.trim() || "employee",
        job_title: draft.job_title.trim() || "Employee",
        manager_id: null,
      });
      setDraft({ ...initialDraft });
      setError("");
      onOpenChange(false);
    } catch (submitError) {
      setError(submitError.message || "Unable to create person");
    }
  };

  const handleChange = (field, value) => {
    setDraft((current) => ({ ...current, [field]: value }));
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          setDraft({ ...initialDraft });
          setError("");
        }
        onOpenChange(nextOpen);
      }}
    >
      <DialogContent className="max-w-xl rounded-2xl border-zinc-200 bg-white p-0 shadow-2xl">
        <form onSubmit={handleSubmit} className="flex flex-col">
          <div className="border-b border-zinc-200 px-6 py-5">
            <DialogHeader className="text-left">
              <DialogTitle className="text-xl font-semibold text-zinc-950">
                Add person
              </DialogTitle>
              <DialogDescription className="text-zinc-500">
                New people start as unattached nodes. Connect them to a manager
                on the canvas when they are ready.
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="space-y-4 p-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                  Username
                </label>
                <Input
                  value={draft.username}
                  onChange={(event) =>
                    handleChange("username", event.target.value)
                  }
                  placeholder="sara.khan"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                  Email
                </label>
                <Input
                  type="email"
                  value={draft.email}
                  onChange={(event) =>
                    handleChange("email", event.target.value)
                  }
                  placeholder="sara@company.com"
                  required
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                  Job title
                </label>
                <Input
                  value={draft.job_title}
                  onChange={(event) =>
                    handleChange("job_title", event.target.value)
                  }
                  placeholder="Senior Developer"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                  Role
                </label>
                <Input
                  value={draft.role}
                  onChange={(event) => handleChange("role", event.target.value)}
                  placeholder="employee"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                Password
              </label>
              <Input
                type="password"
                value={draft.password}
                onChange={(event) =>
                  handleChange("password", event.target.value)
                }
                placeholder="Temporary password"
                required
              />
            </div>

            {error ? (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {error}
              </div>
            ) : null}
          </div>

          <div className="flex items-center justify-end gap-2 border-t border-zinc-200 px-6 pb-6 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              <Plus className="h-4 w-4" />
              {saving ? "Saving..." : "Create person"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function EmployeeDetailsPanel({ user, onClose, onSave, onDelete, saving }) {
  const [draft, setDraft] = useState(() => ({
    username: user.username || "",
    email: user.email || "",
    role: user.role || "employee",
    job_title: user.job_title || "Employee",
  }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    await onSave?.({
      username: draft.username.trim(),
      email: draft.email.trim(),
      role: draft.role.trim() || "employee",
      job_title: draft.job_title.trim() || "Employee",
    });
  };

  return (
    <div className="absolute bottom-4 right-4 z-20 w-[360px] rounded-2xl border border-zinc-200 bg-white/95 p-4 shadow-lg backdrop-blur">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-zinc-950">
            {user.username}
          </p>
          <p className="text-xs text-zinc-500">{user.job_title}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>

      <form className="mt-4 space-y-3" onSubmit={handleSubmit}>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label className="text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500">
              Username
            </label>
            <Input
              value={draft.username}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  username: event.target.value,
                }))
              }
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500">
              Email
            </label>
            <Input
              type="email"
              value={draft.email}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  email: event.target.value,
                }))
              }
            />
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label className="text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500">
              Role
            </label>
            <Input
              value={draft.role}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  role: event.target.value,
                }))
              }
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500">
              Job title
            </label>
            <Input
              value={draft.job_title}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  job_title: event.target.value,
                }))
              }
            />
          </div>
        </div>

        <div className="grid gap-2 text-xs text-zinc-600 sm:grid-cols-2">
          <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-3">
            <span className="block text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-400">
              Manager
            </span>
            <span>{user.managerName || "No manager assigned"}</span>
          </div>
          <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-3">
            <span className="block text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-400">
              Company ID
            </span>
            <span>{user.company_id ?? "—"}</span>
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 pt-1">
          <Button
            type="button"
            variant="destructive"
            onClick={() => onDelete?.(user)}
            disabled={saving}
          >
            <Trash2 className="h-4 w-4" />
            Delete employee
          </Button>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save changes"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}

export function OrganizationTree({
  users = [],
  loading = false,
  onCreateUser,
  onUpdateUser,
  onDeleteUser,
  onAttachUser,
  onRefresh,
}) {
  const graph = useMemo(() => buildHierarchyLayout(users), [users]);
  const [nodes, setNodes, onNodesChange] = useNodesState(graph.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(graph.edges);
  const [flowInstance, setFlowInstance] = useState(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [actionError, setActionError] = useState("");
  const [detailSaving, setDetailSaving] = useState(false);

  useEffect(() => {
    setNodes((currentNodes) => {
      const previousPositions = new Map(
        currentNodes.map((node) => [node.id, node.position]),
      );
      return graph.nodes.map((node) => ({
        ...node,
        position: previousPositions.get(node.id) || node.position,
      }));
    });
    setEdges(graph.edges);
  }, [graph.edges, graph.nodes, setEdges, setNodes]);

  useEffect(() => {
    if (!flowInstance || !nodes.length) return;
    const frame = window.requestAnimationFrame(() => {
      flowInstance.fitView({
        padding: 0.2,
        includeHiddenNodes: false,
        duration: 0,
      });
    });

    return () => window.cancelAnimationFrame(frame);
  }, [flowInstance, nodes.length]);

  const selectedNode = useMemo(
    () => nodes.find((node) => node.id === selectedNodeId) || null,
    [nodes, selectedNodeId],
  );

  const selectedUser = useMemo(
    () =>
      users.find(
        (user) => String(user.id) === String(selectedNode?.data?.userId),
      ) || null,
    [selectedNode, users],
  );

  const nodeTypes = useMemo(
    () => ({
      organizationNode: (props) => (
        <NodeCard {...props} selected={props.id === selectedNodeId} />
      ),
    }),
    [selectedNodeId],
  );

  const handleCreateUser = useCallback(
    async (payload) => {
      setSaving(true);
      setActionError("");
      try {
        await onCreateUser?.(payload);
        await onRefresh?.();
      } catch (error) {
        setActionError(error.message || "Unable to create person");
        throw error;
      } finally {
        setSaving(false);
      }
    },
    [onCreateUser, onRefresh],
  );

  const handleConnect = useCallback(
    async (connection) => {
      const sourceNode = nodes.find((node) => node.id === connection.source);
      const targetNode = nodes.find((node) => node.id === connection.target);

      if (!sourceNode || !targetNode) return;
      if (sourceNode.data?.kind !== "attached") return;
      if (sourceNode.id === targetNode.id) return;

      setActionError("");
      try {
        await onAttachUser?.(
          Number(targetNode.data.userId),
          Number(sourceNode.data.userId),
        );
        await onRefresh?.();
      } catch (error) {
        setActionError(error.message || "Unable to attach person to manager");
      }
    },
    [nodes, onAttachUser, onRefresh],
  );

  const handleUpdateUser = useCallback(
    async (payload) => {
      if (!selectedUser) return;
      setDetailSaving(true);
      setActionError("");
      try {
        await onUpdateUser?.(selectedUser.id, payload);
        await onRefresh?.();
      } catch (error) {
        setActionError(error.message || "Unable to update employee");
      } finally {
        setDetailSaving(false);
      }
    },
    [onRefresh, onUpdateUser, selectedUser],
  );

  const handleDeleteUser = useCallback(
    async (user) => {
      if (!user) return;
      const confirmed = window.confirm(
        `Delete ${user.username}? Reports will be detached and assigned tasks will be unassigned.`,
      );
      if (!confirmed) return;

      setDetailSaving(true);
      setActionError("");
      try {
        await onDeleteUser?.(user.id);
        setSelectedNodeId(null);
        await onRefresh?.();
      } catch (error) {
        setActionError(error.message || "Unable to delete employee");
      } finally {
        setDetailSaving(false);
      }
    },
    [onDeleteUser, onRefresh],
  );

  const loadingState = loading && !users.length;

  return (
    <div className="relative h-[760px] w-full overflow-hidden rounded-2xl border border-zinc-200 bg-[radial-gradient(circle_at_1px_1px,_rgba(24,24,27,0.10)_1px,_transparent_0)] bg-[size:18px_18px]">
      <div className="absolute left-4 top-4 z-20 max-w-md rounded-full border border-zinc-200 bg-white/90 px-3 py-1.5 text-xs text-zinc-600 shadow-sm backdrop-blur">
        Drag the handles to connect people under a manager.
      </div>

      <div className="absolute right-4 top-4 z-20 flex items-center gap-2">
        <Button
          type="button"
          className="rounded-full shadow-sm"
          onClick={() => setCreateOpen(true)}
        >
          <Plus className="h-4 w-4" />
          Add person
        </Button>
      </div>

      {actionError ? (
        <div className="absolute left-4 top-14 z-20 max-w-lg rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 shadow-sm">
          {actionError}
        </div>
      ) : null}

      {loadingState ? (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/70 text-sm text-zinc-500 backdrop-blur-sm">
          Loading reporting hierarchy...
        </div>
      ) : null}

      {!loadingState && !nodes.length ? (
        <Card className="absolute inset-x-6 top-24 border-dashed border-zinc-200 bg-white/80 shadow-sm backdrop-blur">
          <CardContent className="flex flex-col items-center justify-center p-8 text-center">
            <div className="rounded-full bg-amber-50 p-3 text-amber-600">
              <ShieldAlert className="h-6 w-6" />
            </div>
            <div className="mt-4 max-w-md space-y-2">
              <p className="text-sm font-semibold text-zinc-950">
                No attached hierarchy yet
              </p>
              <p className="text-xs leading-relaxed text-zinc-500">
                Add a person to start the staging pool, then connect them to a
                manager node using the top and bottom handles.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : null}

      <div className="h-full w-full p-3">
        <ReactFlow
          onInit={setFlowInstance}
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          nodesDraggable
          nodesConnectable
          elementsSelectable
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={handleConnect}
          onNodeClick={(_, node) => setSelectedNodeId(node.id)}
          panOnDrag
          selectionOnDrag
          zoomOnDoubleClick={false}
          minZoom={0.35}
          maxZoom={1.2}
          className="bg-transparent"
        >
          <Background variant="dots" gap={18} size={1} color="#d4d4d8" />
          <Controls
            position="bottom-right"
            showInteractive={false}
            className="!border-zinc-200 !bg-white !shadow-sm"
          />
        </ReactFlow>
      </div>

      {selectedNode ? (
        selectedUser ? (
          <EmployeeDetailsPanel
            key={`${selectedUser.id}-${selectedUser.username}-${selectedUser.email}-${selectedUser.job_title}-${selectedUser.role}`}
            user={{
              ...selectedUser,
              managerName: selectedNode.data.managerName,
            }}
            onClose={() => setSelectedNodeId(null)}
            onSave={handleUpdateUser}
            onDelete={handleDeleteUser}
            saving={detailSaving}
          />
        ) : null
      ) : null}

      <CreatePersonDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreate={handleCreateUser}
        saving={saving}
      />
    </div>
  );
}
