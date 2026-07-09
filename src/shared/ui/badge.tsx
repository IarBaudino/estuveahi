import { cn } from "@/shared/lib/utils";

const variants = {
  default: "bg-zinc-800 text-zinc-200",
  success: "bg-green-900 text-green-200",
  warning: "bg-amber-900 text-amber-200",
  destructive: "bg-red-900 text-red-200",
  outline: "border border-zinc-600 text-zinc-300",
};

export function Badge({
  className,
  variant = "default",
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & {
  variant?: keyof typeof variants;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}
