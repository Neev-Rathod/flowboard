import { cn } from "../../lib/utils";

export function Badge({ className, variant = "default", ...props }) {
  const variants = {
    default: "bg-zinc-100 text-zinc-950 border-transparent",
    secondary: "bg-zinc-900 text-zinc-50 border-transparent",
    success: "bg-emerald-500/10 text-emerald-300 border-emerald-500/20",
    outline: "bg-transparent text-zinc-300 border-zinc-700",
    destructive: "bg-rose-500/10 text-rose-300 border-rose-500/20",
    warning: "bg-amber-500/10 text-amber-300 border-amber-500/20",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors",
        variants[variant] || variants.default,
        className,
      )}
      {...props}
    />
  );
}
