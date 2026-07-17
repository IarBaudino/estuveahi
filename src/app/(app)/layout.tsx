import { Header } from "@/shared/components/header";
import { Footer } from "@/shared/components/footer";

export const runtime = "nodejs";

export default function AppShellLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Header />
      <main className="flex-1 pt-16">{children}</main>
      <Footer />
    </>
  );
}
