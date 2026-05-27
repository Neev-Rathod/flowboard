import { cn } from "../../lib/utils";

export function Badge({ className, variant = "default", ...props }) {
  const variants = {
    default: "bg-zinc-900 text-zinc-50 border-transparent",
    secondary: "bg-zinc-100 text-zinc-900 border-transparent",
    success: "bg-emerald-50 text-emerald-700 border-emerald-200",
    outline: "bg-transparent text-zinc-700 border-zinc-200",
    destructive: "bg-red-50 text-red-700 border-red-200",
    warning: "bg-amber-50 text-amber-700 border-amber-200",
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
