import { cn } from "../../lib/utils";

export function Badge({ className, variant = "default", ...props }) {
  const variants = {
    default: "bg-sky-400/15 text-sky-100 border-sky-400/20",
    secondary: "bg-white/10 text-white border-white/10",
    success: "bg-emerald-400/15 text-emerald-100 border-emerald-400/20",
    outline: "bg-transparent text-slate-200 border-white/15",
    destructive: "bg-rose-400/15 text-rose-100 border-rose-400/20",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium",
        variants[variant] || variants.default,
        className,
      )}
      {...props}
    />
  );
}
