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
        "h-4 w-4 shrink-0 rounded-sm border border-zinc-300 ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors",
        checked ? "bg-zinc-900 border-zinc-900 text-white" : "bg-white",
        className,
      )}
      {...props}
    >
      {checked && <Check className="h-3 w-3" />}
    </button>
  );
}
