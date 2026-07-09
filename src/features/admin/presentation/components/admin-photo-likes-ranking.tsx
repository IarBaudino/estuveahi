import Link from "next/link";
import { ThumbsUp } from "lucide-react";
import {
  getTopPhotosByLikes,
  type RankedPhoto,
} from "@/features/photo-likes/infrastructure/photo-like.repository";
import { formatPhotoNumber } from "@/shared/lib/photo-number";
import { routes } from "@/config/routes";

export async function AdminPhotoLikesRanking() {
  const photos = await getTopPhotosByLikes(20);

  return (
    <div className="rounded-xl border border-white/10 bg-surface-container-low p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Ranking de fotos por likes</h2>
          <p className="mt-1 text-sm text-on-surface-variant">
            Top 20 fotografías con más likes en la plataforma
          </p>
        </div>
      </div>

      {photos.length === 0 ? (
        <p className="mt-6 text-sm text-on-surface-variant">
          Todavía no hay likes registrados.
        </p>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-white/10 text-left text-on-surface-variant">
                <th className="px-3 py-2 font-medium">#</th>
                <th className="px-3 py-2 font-medium">Evento</th>
                <th className="px-3 py-2 font-medium">Foto</th>
                <th className="px-3 py-2 font-medium">Likes</th>
                <th className="px-3 py-2 font-medium" />
              </tr>
            </thead>
            <tbody>
              {photos.map((photo, index) => (
                <RankingRow key={photo.id} photo={photo} rank={index + 1} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function RankingRow({ photo, rank }: { photo: RankedPhoto; rank: number }) {
  return (
    <tr className="border-b border-white/5 hover:bg-white/5">
      <td className="px-3 py-3 font-mono text-on-surface-variant">{rank}</td>
      <td className="px-3 py-3">
        <p className="line-clamp-1 font-medium">{photo.eventTitle}</p>
      </td>
      <td className="px-3 py-3 font-mono text-xs text-on-surface-variant">
        {formatPhotoNumber(photo.sortOrder)}
      </td>
      <td className="px-3 py-3">
        <span className="inline-flex items-center gap-1 rounded bg-white/10 px-2 py-0.5 text-xs">
          <ThumbsUp className="h-3 w-3" />
          {photo.likeCount}
        </span>
      </td>
      <td className="px-3 py-3 text-right">
        <Link
          href={routes.event(photo.eventSlug)}
          className="text-xs text-primary hover:underline"
          target="_blank"
        >
          Ver galería
        </Link>
      </td>
    </tr>
  );
}
