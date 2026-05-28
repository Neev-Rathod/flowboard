import { useEffect, useMemo } from "react";
import {
  Background,
  Controls,
  Handle,
  Position,
  ReactFlow,
  useEdgesState,
  useNodesState,
} from "@xyflow/react";

const stageColors = [
  "#18181b",
  "#2563eb",
  "#0f766e",
  "#7c3aed",
  "#ca8a04",
  "#db2777",
];

const priorityColors = {
  low: "#e4e4e7",
  normal: "#d4d4d8",
  medium: "#fcd34d",
  high: "#fb7185",
  urgent: "#f43f5e",
};

function WorkflowNode({ data, selected, onAddTask }) {
  const accent = data.accent || "#18181b";
  const canAddTask = data.kind === "stage" && typeof onAddTask === "function";
  const statusTone =
    data.status === "done"
      ? "bg-emerald-500/10 text-emerald-700 border-emerald-500/20"
      : data.status === "in-progress"
        ? "bg-sky-500/10 text-sky-700 border-sky-500/20"
        : data.status === "pending"
          ? "bg-amber-500/10 text-amber-700 border-amber-500/20"
          : "bg-zinc-100 text-zinc-700 border-zinc-200";

  return (
    <div
      className={[
        "relative w-[220px] overflow-hidden rounded-xl border bg-white shadow-sm transition-all cursor-grab active:cursor-grabbing",
        selected
          ? "border-zinc-900 ring-2 ring-zinc-900/10"
          : "border-zinc-200",
      ].join(" ")}
    >
      <div
        className="px-3 py-2 text-xs font-semibold text-white"
        style={{ backgroundColor: accent }}
      >
        <div className="flex items-center justify-between gap-2">
          <span className="truncate">{data.label}</span>
          {data.badge ? (
            <span className="rounded-full bg-white/15 px-2 py-0.5 text-[10px] uppercase tracking-wide text-white/90">
              {data.badge}
            </span>
          ) : null}
        </div>
      </div>
      <div className="space-y-1.5 px-3 py-3">
        <div className="flex flex-wrap items-center gap-2">
          {data.status ? (
            <span
              className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${statusTone}`}
            >
              {data.status}
            </span>
          ) : null}
          {data.taskCount !== undefined ? (
            <span className="text-[10px] uppercase tracking-[0.2em] text-zinc-400">
              {data.taskCount} task{data.taskCount === 1 ? "" : "s"}
            </span>
          ) : null}
        </div>
        <p className="line-clamp-2 text-sm font-semibold text-zinc-950">
          {data.title}
        </p>
        <p className="line-clamp-3 text-[11px] leading-relaxed text-zinc-500">
          {data.description}
        </p>
        {data.progress ? (
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-400">
            {data.progress}
          </p>
        ) : null}
        {data.note ? (
          <div className="rounded-lg border border-zinc-200 bg-zinc-50 px-2 py-1.5 text-[11px] leading-relaxed text-zinc-600">
            <span className="mr-1 font-semibold uppercase tracking-wide text-zinc-400">
              Note
            </span>
            <span className="line-clamp-3">{data.note}</span>
          </div>
        ) : null}
        {data.meta ? (
          <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-400">
            {data.meta}
          </p>
        ) : null}
      </div>
      {canAddTask ? (
        <button
          type="button"
          aria-label={`Add task to ${data.title}`}
          onClick={(event) => {
            event.stopPropagation();
            onAddTask(data.stageId);
          }}
          className="nodrag absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full border border-zinc-200 bg-white text-zinc-700 shadow-sm transition-colors hover:bg-zinc-900 hover:text-white"
        >
          +
        </button>
      ) : null}
      <Handle
        type="target"
        position={Position.Top}
        style={{
          width: 10,
          height: 10,
          background: "#09090b",
          border: "2px solid #ffffff",
        }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        style={{
          width: 10,
          height: 10,
          background: "#09090b",
          border: "2px solid #ffffff",
        }}
      />
    </div>
  );
}

function PlaceholderNode({ data, selected, onCreate }) {
  const canCreate = typeof onCreate === "function";

  return (
    <button
      type="button"
      onClick={(event) => {
        event.stopPropagation();
        onCreate?.(data.stageId);
      }}
      className={[
        "relative flex h-[92px] w-[220px] items-center justify-center rounded-xl border border-dashed bg-white/90 px-4 text-left shadow-sm transition-all cursor-pointer",
        selected
          ? "border-zinc-900 ring-2 ring-zinc-900/10"
          : "border-zinc-200",
        canCreate ? "hover:border-zinc-900 hover:bg-zinc-50" : "opacity-70",
      ].join(" ")}
      aria-label={data.label}
      disabled={!canCreate}
    >
      <div className="flex items-center gap-3">
        <div className="grid h-9 w-9 place-items-center rounded-full border border-zinc-200 bg-zinc-50 text-lg font-semibold text-zinc-900">
          +
        </div>
        <div>
          <p className="text-sm font-semibold text-zinc-950">{data.title}</p>
          <p className="text-xs text-zinc-500">{data.description}</p>
        </div>
      </div>
      <Handle
        type="target"
        position={Position.Top}
        style={{
          width: 10,
          height: 10,
          background: "#09090b",
          border: "2px solid #ffffff",
        }}
      />
    </button>
  );
}

function priorityAccent(priority) {
  return priorityColors[priority || "normal"] || priorityColors.normal;
}

function buildGraph(workflow, users = []) {
  const stages = workflow?.stages || [];
  const nodes = [];
  const edges = [];
  const stageGap = 320;
  const stageBaseX = 80;
  const userLookup = new Map(users.map((user) => [String(user.id), user]));

  stages.forEach((stage, stageIndex) => {
    const stageId = `stage-${stage.id ?? stageIndex}`;
    const stageX = stageBaseX + stageIndex * stageGap;
    const stageAccent =
      stage.color || stageColors[stageIndex % stageColors.length];
    const tasks = stage.tasks || [];
    const completedTasks = tasks.filter((task) => task.status === "completed");
    const pendingTasks = tasks.filter((task) => task.status !== "completed");

    nodes.push({
      id: stageId,
      type: "workflowNode",
      position: { x: stageX, y: 70 },
      data: {
        kind: "stage",
        stageId: stage.id ?? stageIndex,
        title: stage.title,
        details: stage.completion_rule || "Sequential stage",
        description:
          stage.completion_rule ||
          `${tasks.length} linked task${tasks.length === 1 ? "" : "s"}`,
        label: `Stage ${stageIndex + 1}`,
        accent: stageAccent,
        badge: `${completedTasks.length}/${tasks.length || 0} done`,
        taskCount: tasks.length,
        status:
          tasks.length === 0
            ? "pending"
            : pendingTasks.length === 0
              ? "done"
              : completedTasks.length > 0
                ? "in-progress"
                : "pending",
        progress:
          tasks.length === 0
            ? "No tasks yet"
            : `${completedTasks.length} completed, ${pendingTasks.length} pending`,
      },
    });

    tasks.forEach((task, taskIndex) => {
      const taskId = `task-${stage.id ?? stageIndex}-${task.id ?? taskIndex}`;
      const taskX =
        stageX + (taskIndex - Math.max(tasks.length - 1, 0) / 2) * 220;
      const taskY = 250 + Math.floor(taskIndex / 3) * 120;

      const assignee = userLookup.get(String(task.assigned_to));

      nodes.push({
        id: taskId,
        type: "workflowNode",
        position: { x: taskX, y: taskY },
        data: {
          kind: "task",
          stageId: stage.id ?? stageIndex,
          stageTitle: stage.title,
          taskId: task.id ?? taskIndex,
          title: task.title,
          details: task.description || "No task description yet.",
          description: task.description || "No task description yet.",
          label: "Task",
          accent: priorityAccent(task.priority),
          badge: (task.priority || "normal").toUpperCase(),
          meta: assignee
            ? `${assignee.username}${assignee.job_title ? ` · ${assignee.job_title}` : ""}`
            : "Unassigned",
          assigneeName: assignee?.username || "Unassigned",
          assigneeTitle: assignee?.job_title || "",
          assignedTo: task.assigned_to ?? null,
          priority: task.priority || "normal",
          dueDate: task.due_date || null,
          status: task.status === "completed" ? "done" : "pending",
          progress: task.status === "completed" ? "Completed" : "Pending work",
          note: task.notes || "",
        },
      });

      edges.push({
        id: `edge-${stageId}-${taskId}`,
        source: stageId,
        target: taskId,
        type: "smoothstep",
        style: { stroke: stageAccent, strokeWidth: 2 },
      });

      if (stages[stageIndex + 1]) {
        const nextStageId = `stage-${stages[stageIndex + 1].id ?? stageIndex + 1}`;
        edges.push({
          id: `edge-${taskId}-${nextStageId}`,
          source: taskId,
          target: nextStageId,
          type: "smoothstep",
          style: { stroke: "#d4d4d8", strokeWidth: 2 },
        });
      }
    });

    const placeholderId = `placeholder-${stage.id ?? stageIndex}`;
    const placeholderY = tasks.length
      ? 250 + Math.ceil(tasks.length / 3) * 120 + 10
      : 250;

    nodes.push({
      id: placeholderId,
      type: "placeholderNode",
      position: { x: stageX, y: placeholderY },
      data: {
        kind: "placeholder",
        stageId: stage.id ?? stageIndex,
        stageTitle: stage.title,
        title: "Click to add a task",
        description: "Create a new node in this stage",
        label: `Add task to ${stage.title}`,
      },
    });

    edges.push({
      id: `edge-${stageId}-${placeholderId}`,
      source: stageId,
      target: placeholderId,
      type: "smoothstep",
      style: { stroke: "#d4d4d8", strokeWidth: 2, strokeDasharray: "6 6" },
    });

    if (!tasks.length && stages[stageIndex + 1]) {
      const nextStageId = `stage-${stages[stageIndex + 1].id ?? stageIndex + 1}`;
      edges.push({
        id: `edge-${stageId}-${nextStageId}`,
        source: stageId,
        target: nextStageId,
        type: "smoothstep",
        style: { stroke: stageAccent, strokeWidth: 2 },
      });
    }
  });

  return { nodes, edges };
}

export function WorkflowCanvas({
  workflow,
  users = [],
  selectedNodeId,
  onNodeSelect,
  onAddTask,
}) {
  const graph = useMemo(() => buildGraph(workflow, users), [workflow, users]);
  const [nodes, setNodes, onNodesChange] = useNodesState(graph.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(graph.edges);

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

  const nodeTypes = useMemo(
    () => ({
      workflowNode: (props) => (
        <WorkflowNode
          {...props}
          selected={props.id === selectedNodeId}
          onAddTask={onAddTask}
        />
      ),
      placeholderNode: (props) => (
        <PlaceholderNode
          {...props}
          selected={props.id === selectedNodeId}
          onCreate={onAddTask}
        />
      ),
    }),
    [onAddTask, selectedNodeId],
  );

  if (!workflow) {
    return (
      <div className="flex h-[520px] items-center justify-center rounded-2xl border border-dashed border-zinc-200 bg-zinc-50 text-sm text-zinc-500">
        Select a workflow to preview its flowchart.
      </div>
    );
  }

  return (
    <div className="h-[560px] overflow-hidden rounded-2xl border border-zinc-200 bg-[radial-gradient(circle_at_1px_1px,_rgba(24,24,27,0.10)_1px,_transparent_0)] bg-[size:18px_18px] p-3">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        nodesDraggable
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodesConnectable={false}
        elementsSelectable
        panOnDrag
        selectionOnDrag
        zoomOnDoubleClick={false}
        onNodeClick={(_, node) => onNodeSelect?.(node)}
        className="bg-transparent"
        minZoom={0.45}
        maxZoom={1.2}
      >
        <Background variant="dots" gap={18} size={1} color="#d4d4d8" />
        <Controls
          position="bottom-right"
          showInteractive={false}
          className="!border-zinc-200 !bg-white !shadow-sm"
        />
      </ReactFlow>
    </div>
  );
}
