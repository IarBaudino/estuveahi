"use client";

import { useState } from "react";
import type { PhotographerProfile, Profile } from "@/domain/entities/user";
import { PhotographerProfileForm } from "@/features/auth/presentation/components/photographer-profile-form";
import { ProfileForm } from "@/features/profile/presentation/components/profile-form";
import { ProfileAvatarUploader } from "@/features/profile/presentation/components/profile-avatar-uploader";
import { cn } from "@/shared/lib/utils";

type Tab = "public" | "account";

interface PhotographerProfilePanelProps {
  photographerProfile: PhotographerProfile;
  accountProfile: Profile;
  email: string;
}

export function PhotographerProfilePanel({
  photographerProfile,
  accountProfile,
  email,
}: PhotographerProfilePanelProps) {
  const [tab, setTab] = useState<Tab>("public");

  return (
    <div>
      <div className="flex gap-1 hairline-border p-1">
        {(
          [
            { id: "public" as const, label: "Perfil público" },
            { id: "account" as const, label: "Datos de contacto" },
          ] as const
        ).map(({ id, label }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={cn(
              "flex-1 rounded-sm px-3 py-2 text-sm transition-colors",
              tab === id
                ? "bg-surface-container-high font-medium"
                : "text-on-surface-variant hover:text-on-surface",
            )}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {tab === "public" ? (
          <div className="space-y-8">
            <ProfileAvatarUploader
              avatarUrl={accountProfile.avatarUrl}
              variant="public"
            />
            <PhotographerProfileForm profile={photographerProfile} email={email} />
          </div>
        ) : (
          <div>
            <p className="mb-4 text-sm text-on-surface-variant">
              Nombre y teléfono que verán los clientes al solicitar tus fotos.
            </p>
            <ProfileForm profile={accountProfile} hideAvatar />
          </div>
        )}
      </div>
    </div>
  );
}
