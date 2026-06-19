import { redirect } from "next/navigation";
import { auth } from "@/infrastructure/auth";
import { routes } from "@/config/routes";
import { getUserFavoritesWithEvents } from "@/features/favorites/infrastructure/favorite.repository";
import { FavoriteCard } from "@/features/favorites/presentation/components/favorite-card";
import Link from "next/link";

export default async function FavoritesPage() {
  const session = await auth();
  if (!session?.user) redirect(routes.login);

  const favorites = await getUserFavoritesWithEvents(session.user.id);

  return (
    <div>
      <h1 className="text-headline-lg">Mis favoritos</h1>
      <p className="text-on-surface-variant">
        {favorites.length} fotografías guardadas
      </p>

      {favorites.length === 0 ? (
        <div className="mt-12 text-center">
          <p className="text-on-surface-variant">
            Aún no tenés favoritos. Explorá eventos y guardá tus fotos preferidas.
          </p>
          <Link href={routes.events} className="mt-4 inline-block text-sm underline">
            Ver eventos
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {favorites.map((photo) => (
            <FavoriteCard key={photo.id} photo={photo} />
          ))}
        </div>
      )}
    </div>
  );
}
