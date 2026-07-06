"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { PublicPhotographer } from "@/domain/entities/public-photographer";
import { PhotographerCard } from "@/features/photographers/presentation/components/photographer-card";
import { PhotographerProfileModal } from "@/features/photographers/presentation/components/photographer-profile-modal";

interface PhotographersGridProps {
  photographers: PublicPhotographer[];
}

export function PhotographersGrid({ photographers }: PhotographersGridProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const profileParam = searchParams.get("perfil");

  const [selected, setSelected] = useState<PublicPhotographer | null>(null);

  const openProfile = useCallback((photographer: PublicPhotographer) => {
    setSelected(photographer);
    const params = new URLSearchParams(searchParams.toString());
    params.set("perfil", photographer.id);
    router.replace(`?${params.toString()}`, { scroll: false });
  }, [router, searchParams]);

  const closeProfile = useCallback(() => {
    setSelected(null);
    const params = new URLSearchParams(searchParams.toString());
    params.delete("perfil");
    const query = params.toString();
    router.replace(query ? `?${query}` : "?", { scroll: false });
  }, [router, searchParams]);

  useEffect(() => {
    if (!profileParam) {
      setSelected(null);
      return;
    }

    const match = photographers.find((item) => item.id === profileParam);
    if (match) setSelected(match);
  }, [profileParam, photographers]);

  return (
    <>
      <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
        {photographers.map((photographer) => (
          <PhotographerCard
            key={photographer.id}
            photographer={photographer}
            onOpen={() => openProfile(photographer)}
          />
        ))}
      </div>

      {selected && (
        <PhotographerProfileModal photographer={selected} onClose={closeProfile} />
      )}
    </>
  );
}
