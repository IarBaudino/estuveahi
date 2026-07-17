"use client";

import Image, { type ImageProps } from "next/image";
import { useCallback, useState } from "react";
import { ImageOff } from "lucide-react";
import { cn } from "@/shared/lib/utils";

interface ProtectedImageProps extends Omit<ImageProps, "onContextMenu" | "draggable"> {
  containerClassName?: string;
}

export function ProtectedImage({
  className,
  containerClassName,
  alt,
  fill,
  onError,
  ...props
}: ProtectedImageProps) {
  const [failed, setFailed] = useState(false);

  const blockInteraction = useCallback((e: React.SyntheticEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  if (failed) {
    return (
      <div
        className={cn(
          "protected-image flex select-none items-center justify-center bg-zinc-100 text-zinc-400 dark:bg-zinc-900",
          fill ? "absolute inset-0" : "relative h-full w-full",
          containerClassName,
        )}
        aria-hidden
      >
        <ImageOff className="h-5 w-5" />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "protected-image select-none",
        fill ? "absolute inset-0" : "relative",
        containerClassName,
      )}
      onContextMenu={blockInteraction}
      onDragStart={blockInteraction}
    >
      <Image
        {...props}
        alt={alt}
        fill={fill}
        unoptimized
        draggable={false}
        loading={props.priority ? undefined : (props.loading ?? "lazy")}
        className={cn("pointer-events-none select-none", className)}
        onError={(event) => {
          setFailed(true);
          onError?.(event);
        }}
      />
      <div
        className="absolute inset-0 z-10"
        aria-hidden
        onContextMenu={blockInteraction}
        onDragStart={blockInteraction}
      />
    </div>
  );
}
