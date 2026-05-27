import { cn } from "../../lib/utils";

export function Separator({ className, orientation = "horizontal", ...props }) {
  return (
    <div
      role="separator"
      aria-orientation={orientation}
      className={cn(
        orientation === "horizontal" ? "h-px w-full" : "h-full w-px",
        "bg-white/10",
        className,
      )}
      {...props}
    />
  );
}
