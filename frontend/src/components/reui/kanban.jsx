import { createContext, useContext, useMemo, useState } from "react";

import { cn } from "../../lib/utils";

const KanbanContext = createContext(null);
const KanbanColumnContext = createContext(null);

function cloneColumns(value) {
  return Object.fromEntries(
    Object.entries(value || {}).map(([columnId, items]) => [
      columnId,
      [...items],
    ]),
  );
}

export function Kanban({
  value,
  onValueChange,
  getItemValue,
  onItemClick,
  onItemMove,
  className,
  children,
}) {
  const [dragState, setDragState] = useState(null);

  const contextValue = useMemo(
    () => ({
      value,
      onValueChange,
      getItemValue,
      onItemClick,
      onItemMove,
      dragState,
      setDragState,
      clearDragState: () => setDragState(null),
    }),
    [dragState, getItemValue, onItemClick, onItemMove, onValueChange, value],
  );

  return (
    <KanbanContext.Provider value={contextValue}>
      <div className={cn("w-full", className)}>{children}</div>
    </KanbanContext.Provider>
  );
}

export function KanbanBoard({ className, children }) {
  return (
    <div className={cn("grid gap-4 md:grid-cols-2 xl:grid-cols-3", className)}>
      {children}
    </div>
  );
}

export function KanbanColumn({ value, className, children }) {
  return (
    <section
      className={cn(
        "flex min-h-[18rem] flex-col rounded-3xl border border-zinc-800 bg-zinc-950 shadow-sm",
        className,
      )}
    >
      <KanbanColumnContext.Provider value={value}>
        {children}
      </KanbanColumnContext.Provider>
    </section>
  );
}

export function KanbanColumnHandle({ className, children }) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-3 border-b border-zinc-800 px-4 py-3",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function KanbanColumnContent({ value, className, children }) {
  const kanban = useContext(KanbanContext);

  const handleDrop = (event) => {
    event.preventDefault();
    const dragState = kanban?.dragState;
    if (!dragState || dragState.columnValue === value) {
      kanban?.clearDragState();
      return;
    }

    const nextValue = cloneColumns(kanban.value);
    const sourceItems = nextValue[dragState.columnValue] || [];
    const targetItems = nextValue[value] || [];
    const itemIndex = sourceItems.findIndex(
      (item) => kanban.getItemValue(item) === dragState.itemValue,
    );

    if (itemIndex < 0) {
      kanban?.clearDragState();
      return;
    }

    const [movedItem] = sourceItems.splice(itemIndex, 1);
    targetItems.push(movedItem);
    nextValue[dragState.columnValue] = sourceItems;
    nextValue[value] = targetItems;
    kanban.onValueChange?.(nextValue);
    kanban.onItemMove?.({
      itemValue: dragState.itemValue,
      fromColumn: dragState.columnValue,
      toColumn: value,
    });
    kanban.clearDragState();
  };

  return (
    <div
      className={cn("flex-1 space-y-3 overflow-y-auto p-3", className)}
      onDragOver={(event) => event.preventDefault()}
      onDrop={handleDrop}
      data-kanban-content={value}
    >
      {children}
    </div>
  );
}

export function KanbanItem({ value, disabled = false, className, children }) {
  const kanban = useContext(KanbanContext);
  const columnValue = useContext(KanbanColumnContext);
  const isDragging = kanban?.dragState?.itemValue === value;

  return (
    <article
      draggable={!disabled}
      onDragStart={(event) => {
        if (disabled) return;
        event.dataTransfer.effectAllowed = "move";
        kanban?.setDragState({ itemValue: value, columnValue });
      }}
      onDragEnd={() => kanban?.clearDragState()}
      onClick={() => kanban?.onItemClick?.(value)}
      className={cn(
        "rounded-2xl border border-zinc-800 bg-zinc-950 p-3 text-zinc-50 shadow-sm transition-all",
        disabled
          ? "cursor-default opacity-75"
          : "cursor-grab active:cursor-grabbing",
        isDragging
          ? "scale-[0.99] border-zinc-700 opacity-80"
          : "hover:border-zinc-700 hover:shadow-md",
        className,
      )}
      data-kanban-item={value}
    >
      {children}
    </article>
  );
}

export function KanbanItemHandle({ className, children }) {
  return <div className={cn("select-none", className)}>{children}</div>;
}

export function KanbanOverlay({ className, children }) {
  const kanban = useContext(KanbanContext);

  if (!kanban?.dragState) return null;

  return (
    <div
      className={cn("pointer-events-none fixed inset-0 z-50 p-6", className)}
    >
      {children}
    </div>
  );
}
