import { cn } from "@/shared/lib/utils";

export function Textarea({
  className,
  label,
  error,
  id,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
  error?: string;
}) {
  const inputId = id ?? props.name;
  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-on-surface">
          {label}
        </label>
      )}
      <textarea
        id={inputId}
        className={cn(
          "flex min-h-[100px] w-full rounded-lg border border-white/15 bg-zinc-950 px-3 py-2 text-sm text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:ring-2 focus:ring-white/20",
          error && "border-red-500",
          className,
        )}
        {...props}
      />
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}
