import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/infrastructure/auth";
import { ClientNav } from "@/shared/components/client-nav";
import { routes } from "@/config/routes";

export default async function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect(routes.login);

  const headersList = await headers();
  const pathname = headersList.get("x-pathname") ?? "/cliente";

  return (
    <div className="mx-auto flex max-w-7xl gap-0 px-0 sm:px-6">
      <ClientNav currentPath={pathname} />
      <div className="min-w-0 flex-1 px-4 py-8 pb-24 sm:px-0 md:pb-8">{children}</div>
    </div>
  );
}
