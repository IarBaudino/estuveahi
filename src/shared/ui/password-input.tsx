"use client";

import { forwardRef, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import type { InputProps } from "@/shared/ui/input";

export const PasswordInput = forwardRef<HTMLInputElement, InputProps>(
  function PasswordInput({ className, label, error, id, ...props }, ref) {
    const [visible, setVisible] = useState(false);
    const inputId = id ?? props.name;

    return (
      <div className="space-y-1.5">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium">
            {label}
          </label>
        )}
        <div className="relative">
          <input
            ref={ref}
            id={inputId}
            type={visible ? "text" : "password"}
            autoComplete={props.autoComplete ?? "current-password"}
            className={cn(
              "flex h-10 w-full rounded-lg border border-zinc-300 bg-white py-2 pl-3 pr-10 text-sm placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-400 dark:border-zinc-700 dark:bg-zinc-950",
              error && "border-red-500 focus:ring-red-400",
              className,
            )}
            {...props}
          />
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setVisible((value) => !value)}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-zinc-500 transition-colors hover:text-zinc-800 dark:hover:text-zinc-200"
            aria-label={visible ? "Ocultar contraseña" : "Mostrar contraseña"}
          >
            {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>
    );
  },
);
