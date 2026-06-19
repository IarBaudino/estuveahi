"use client";

import Image, { type ImageProps } from "next/image";
import { useCallback } from "react";
import { cn } from "@/shared/lib/utils";

interface ProtectedImageProps extends Omit<ImageProps, "onContextMenu" | "draggable"> {
  containerClassName?: string;
}

export function ProtectedImage({
  className,
  containerClassName,
  alt,
  ...props
}: ProtectedImageProps) {
  const blockInteraction = useCallback((e: React.SyntheticEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  return (
    <div
      className={cn("protected-image relative select-none", containerClassName)}
      onContextMenu={blockInteraction}
      onDragStart={blockInteraction}
    >
      <Image
        {...props}
        alt={alt}
        unoptimized
        draggable={false}
        className={cn("pointer-events-none select-none", className)}
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
