import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";

import { cn } from "../../lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-violet-400 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-violet-500 !text-white hover:bg-violet-400 shadow-[0_8px_30px_-12px_rgba(139,92,246,0.55)]",
        secondary: "bg-zinc-800 text-zinc-100 hover:bg-zinc-700",
        outline:
          "border border-zinc-700 bg-zinc-950 text-zinc-100 hover:bg-zinc-900 shadow-sm",
        ghost: "bg-transparent text-zinc-100 hover:bg-zinc-900",
        destructive: "bg-rose-600 !text-white hover:bg-rose-500 shadow-sm",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { buttonVariants };
