import { PublicMobileNav } from "@/shared/components/public-mobile-nav";

export default function PublicAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <div className="pb-24 md:pb-0">{children}</div>
      <PublicMobileNav />
    </>
  );
}
