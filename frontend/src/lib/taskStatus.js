const normalizeStatus = (value) =>
  (value || "todo").toString().trim().toLowerCase().replace(/\s+/g, "_");

export function getTaskLane(task, now = Date.now()) {
  const status = normalizeStatus(task?.status);

  if (status === "completed") {
    return "completed";
  }

  if (task?.due_date) {
    const dueDate = new Date(task.due_date).getTime();
    if (!Number.isNaN(dueDate) && dueDate < now) {
      return "backlog";
    }
  }

  if (
    status === "in_progress" ||
    status === "inprogress" ||
    status === "doing"
  ) {
    return "in_progress";
  }

  return "todo";
}

export function getTaskLaneLabel(lane) {
  switch (lane) {
    case "backlog":
      return "Backlog";
    case "in_progress":
      return "In Progress";
    case "completed":
      return "Completed";
    default:
      return "To Do";
  }
}
