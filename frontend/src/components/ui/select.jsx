import { cn } from "../../lib/utils";
import { ChevronDown } from "lucide-react";

export function Select({ className, children, ...props }) {
  return (
    <div className="relative">
      <select
        className={cn(
          "flex h-10 w-full items-center rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-50 outline-none focus-visible:ring-1 focus-visible:ring-violet-400 disabled:cursor-not-allowed disabled:opacity-50 appearance-none pr-8",
          className,
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
    </div>
  );
}
