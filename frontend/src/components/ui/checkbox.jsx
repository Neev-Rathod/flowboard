import { cn } from "../../lib/utils";
import { Check } from "lucide-react";

export function Checkbox({ className, checked, onCheckedChange, ...props }) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      onClick={() => onCheckedChange?.(!checked)}
      className={cn(
        "h-4 w-4 shrink-0 rounded-sm border border-zinc-700 ring-offset-zinc-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors",
        checked ? "bg-violet-500 border-violet-500 text-white" : "bg-zinc-950",
        className,
      )}
      {...props}
    >
      {checked && <Check className="h-3 w-3" />}
    </button>
  );
}
