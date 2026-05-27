import { useMemo } from "react";
import {
  Background,
  Controls,
  Handle,
  Position,
  ReactFlow,
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

function WorkflowNode({ data, selected }) {
  const accent = data.accent || "#18181b";

  return (
    <div
      className={[
        "w-[220px] overflow-hidden rounded-xl border bg-white shadow-sm transition-all",
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
        <p className="line-clamp-2 text-sm font-semibold text-zinc-950">
          {data.title}
        </p>
        <p className="line-clamp-3 text-[11px] leading-relaxed text-zinc-500">
          {data.description}
        </p>
        {data.meta ? (
          <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-400">
            {data.meta}
          </p>
        ) : null}
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

function priorityAccent(priority) {
  return priorityColors[priority || "normal"] || priorityColors.normal;
}

function buildGraph(workflow) {
  const stages = workflow?.stages || [];
  const nodes = [];
  const edges = [];
  const stageGap = 320;
  const stageBaseX = 80;

  stages.forEach((stage, stageIndex) => {
    const stageId = `stage-${stage.id ?? stageIndex}`;
    const stageX = stageBaseX + stageIndex * stageGap;
    const stageAccent =
      stage.color || stageColors[stageIndex % stageColors.length];
    const tasks = stage.tasks || [];

    nodes.push({
      id: stageId,
      type: "workflowNode",
      position: { x: stageX, y: 70 },
      data: {
        kind: "stage",
        title: stage.title,
        description:
          stage.completion_rule ||
          `${tasks.length} linked task${tasks.length === 1 ? "" : "s"}`,
        label: `Stage ${stageIndex + 1}`,
        accent: stageAccent,
        badge: `${tasks.length} task${tasks.length === 1 ? "" : "s"}`,
      },
    });

    tasks.forEach((task, taskIndex) => {
      const taskId = `task-${stage.id ?? stageIndex}-${task.id ?? taskIndex}`;
      const taskX =
        stageX + (taskIndex - Math.max(tasks.length - 1, 0) / 2) * 220;
      const taskY = 250 + Math.floor(taskIndex / 3) * 120;

      nodes.push({
        id: taskId,
        type: "workflowNode",
        position: { x: taskX, y: taskY },
        data: {
          kind: "task",
          title: task.title,
          description: task.description || "No task description yet.",
          label: "Task",
          accent: priorityAccent(task.priority),
          badge: (task.priority || "normal").toUpperCase(),
          meta: task.assigned_to
            ? `Assignee ${task.assigned_to}`
            : "Unassigned",
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

export function WorkflowCanvas({ workflow, selectedNodeId, onNodeSelect }) {
  const graph = useMemo(() => buildGraph(workflow), [workflow]);
  const nodeTypes = useMemo(
    () => ({
      workflowNode: (props) => (
        <WorkflowNode {...props} selected={props.id === selectedNodeId} />
      ),
    }),
    [selectedNodeId],
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
        nodes={graph.nodes}
        edges={graph.edges}
        nodeTypes={nodeTypes}
        fitView
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
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
