import { useEffect, useMemo, useState } from "react";

function reorder(array, fromIndex, toIndex) {
  const next = [...array];
  const [item] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, item);
  return next;
}

export default function WorkflowList({ apiBase, token }) {
  const [workflows, setWorkflows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [title, setTitle] = useState("");
  const [stageTitle, setStageTitle] = useState("");

  const headers = useMemo(
    () => ({
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    }),
    [token],
  );

  const loadWorkflows = async () => {
    try {
      const res = await fetch(`${apiBase}/workflows/`, { headers });
      if (!res.ok) throw new Error("Failed to load workflows");
      const data = await res.json();
      setWorkflows(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWorkflows();
  }, [apiBase, headers]);

  const createWorkflow = async () => {
    if (!title.trim()) return;
    try {
      const res = await fetch(`${apiBase}/workflows/`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          title: title.trim(),
          description: "",
          category: null,
        }),
      });
      if (!res.ok) throw new Error("Create failed");
      const wf = await res.json();
      setWorkflows((current) => [wf, ...current]);
      setTitle("");
    } catch (error) {
      console.error(error);
    }
  };

  const duplicate = async (id) => {
    try {
      const res = await fetch(`${apiBase}/workflows/${id}/duplicate`, {
        method: "POST",
        headers,
      });
      if (!res.ok) throw new Error("Duplicate failed");
      const wf = await res.json();
      setWorkflows((current) => [wf, ...current]);
    } catch (error) {
      console.error(error);
    }
  };

  const remove = async (id) => {
    try {
      const res = await fetch(`${apiBase}/workflows/${id}`, {
        method: "DELETE",
        headers,
      });
      if (res.status !== 204) throw new Error("Delete failed");
      setWorkflows((current) =>
        current.filter((workflow) => workflow.id !== id),
      );
      if (expandedId === id) setExpandedId(null);
    } catch (error) {
      console.error(error);
    }
  };

  const loadWorkflowDetail = async (workflowId) => {
    const res = await fetch(`${apiBase}/workflows/${workflowId}`, { headers });
    if (!res.ok) throw new Error("Failed to load workflow");
    return res.json();
  };

  const toggleExpanded = async (workflowId) => {
    if (expandedId === workflowId) {
      setExpandedId(null);
      return;
    }

    try {
      const detail = await loadWorkflowDetail(workflowId);
      setWorkflows((current) =>
        current.map((workflow) =>
          workflow.id === workflowId ? detail : workflow,
        ),
      );
      setExpandedId(workflowId);
    } catch (error) {
      console.error(error);
    }
  };

  const createStage = async (workflowId) => {
    if (!stageTitle.trim()) return;
    try {
      const res = await fetch(`${apiBase}/workflows/${workflowId}/stages`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          title: stageTitle.trim(),
          position: 0,
          color: null,
          completion_rule: null,
        }),
      });
      if (!res.ok) throw new Error("Stage create failed");
      const createdStage = await res.json();
      setWorkflows((current) =>
        current.map((workflow) =>
          workflow.id === workflowId
            ? {
                ...workflow,
                stages: [...(workflow.stages || []), createdStage],
              }
            : workflow,
        ),
      );
      setStageTitle("");
    } catch (error) {
      console.error(error);
    }
  };

  const reorderStages = async (workflowId, stages) => {
    setWorkflows((current) =>
      current.map((workflow) =>
        workflow.id === workflowId ? { ...workflow, stages } : workflow,
      ),
    );
    await fetch(`${apiBase}/workflows/stages/reorder`, {
      method: "PUT",
      headers,
      body: JSON.stringify({ stage_ids: stages.map((stage) => stage.id) }),
    });
  };

  const onStageDrop = async (workflowId, fromIndex, toIndex) => {
    const workflow = workflows.find((item) => item.id === workflowId);
    if (!workflow?.stages?.length || fromIndex === toIndex) return;
    const nextStages = reorder(workflow.stages, fromIndex, toIndex).map(
      (stage, index) => ({
        ...stage,
        position: index,
      }),
    );
    await reorderStages(workflowId, nextStages);
  };

  if (loading)
    return <div className="text-sm text-slate-300">Loading workflows...</div>;

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="New workflow title"
          className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-sky-400/50"
        />
        <button
          type="button"
          onClick={createWorkflow}
          className="rounded-2xl bg-sky-400 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-300"
        >
          Create
        </button>
      </div>

      <div className="space-y-3">
        {workflows.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
            No workflows yet.
          </div>
        ) : (
          workflows.map((workflow) => {
            const stages = workflow.stages || [];

            return (
              <div
                key={workflow.id}
                className="rounded-3xl border border-white/10 bg-white/5 p-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-base font-semibold text-white">
                      {workflow.title}
                    </div>
                    <div className="mt-1 text-xs text-slate-400">
                      {workflow.description || "No description"}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => toggleExpanded(workflow.id)}
                      className="rounded-full border border-white/10 px-3 py-1 text-xs text-slate-200"
                    >
                      {expandedId === workflow.id ? "Hide stages" : "Manage"}
                    </button>
                    <button
                      type="button"
                      onClick={() => duplicate(workflow.id)}
                      className="rounded-full border border-white/10 px-3 py-1 text-xs text-slate-200"
                    >
                      Duplicate
                    </button>
                    <button
                      type="button"
                      onClick={() => remove(workflow.id)}
                      className="rounded-full border border-rose-400/20 px-3 py-1 text-xs text-rose-200"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                {expandedId === workflow.id ? (
                  <div className="mt-4 space-y-4 border-t border-white/10 pt-4">
                    <div className="flex flex-col gap-3 sm:flex-row">
                      <input
                        value={stageTitle}
                        onChange={(event) => setStageTitle(event.target.value)}
                        placeholder="Add stage"
                        className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-2.5 text-sm text-white outline-none placeholder:text-slate-500"
                      />
                      <button
                        type="button"
                        onClick={() => createStage(workflow.id)}
                        className="rounded-2xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-950"
                      >
                        Add stage
                      </button>
                    </div>

                    <div className="grid gap-3">
                      {stages.length === 0 ? (
                        <div className="text-sm text-slate-400">
                          No stages yet.
                        </div>
                      ) : (
                        stages.map((stage, index) => (
                          <div
                            key={stage.id}
                            draggable
                            onDragStart={(event) =>
                              event.dataTransfer.setData(
                                "text/plain",
                                String(index),
                              )
                            }
                            onDragOver={(event) => event.preventDefault()}
                            onDrop={(event) => {
                              event.preventDefault();
                              const fromIndex = Number(
                                event.dataTransfer.getData("text/plain"),
                              );
                              onStageDrop(workflow.id, fromIndex, index);
                            }}
                            className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3"
                          >
                            <div>
                              <div className="text-sm font-medium text-white">
                                {stage.title}
                              </div>
                              <div className="text-xs text-slate-400">
                                Position {stage.position ?? index + 1}
                              </div>
                            </div>
                            <div className="text-xs uppercase tracking-[0.18em] text-slate-500">
                              Drag
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                ) : null}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
