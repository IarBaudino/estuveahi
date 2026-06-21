"use client";

import { useState } from "react";
import { Camera } from "lucide-react";
import { getAvatarMediaUrl } from "@/shared/lib/avatar-url";
import { cn } from "@/shared/lib/utils";

function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

interface PhotographerAvatarProps {
  userId: string;
  displayName: string;
  hasAvatar: boolean;
  className?: string;
  imageClassName?: string;
  sizes?: string;
}

export function PhotographerAvatar({
  userId,
  displayName,
  hasAvatar,
  className,
  imageClassName,
  sizes = "(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw",
}: PhotographerAvatarProps) {
  const [failed, setFailed] = useState(false);

  if (hasAvatar && !failed) {
    return (
      <img
        src={getAvatarMediaUrl(userId)}
        alt={displayName}
        sizes={sizes}
        onError={() => setFailed(true)}
        className={cn(
          "h-full w-full object-cover transition-transform duration-500 group-hover:scale-105",
          imageClassName,
          className,
        )}
      />
    );
  }

  return (
    <div
      className={cn(
        "flex h-full w-full flex-col items-center justify-center gap-3",
        "bg-gradient-to-br from-surface-container-high to-surface-container-lowest",
        className,
      )}
    >
      <span className="text-3xl font-semibold tracking-tight text-on-surface-variant/80">
        {getInitials(displayName) || "?"}
      </span>
      <Camera className="h-8 w-8 text-on-surface-variant/40" aria-hidden />
    </div>
  );
}
