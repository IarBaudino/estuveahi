import type { Metadata } from "next";
import { Hanken_Grotesk, Inter, JetBrains_Mono } from "next/font/google";
import { headers } from "next/headers";
import { Header } from "@/shared/components/header";
import { Footer } from "@/shared/components/footer";
import { Providers } from "@/shared/components/providers";
import { siteConfig } from "@/config/site";
import "./globals.css";

const hankenGrotesk = Hanken_Grotesk({
  variable: "--font-hanken",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: {
    default: `${siteConfig.name} | La mirada documental del deporte y la cultura`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  metadataBase: new URL(siteConfig.url),
  openGraph: {
    title: siteConfig.name,
    description: siteConfig.description,
    url: siteConfig.url,
    siteName: siteConfig.name,
    locale: "es_AR",
    type: "website",
  },
};

export const dynamic = "force-dynamic";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headersList = await headers();
  const pathname = headersList.get("x-pathname") ?? "";
  const isLanding = pathname === "/";

  return (
    <html
      lang="es"
      className={`dark ${hankenGrotesk.variable} ${inter.variable} ${jetbrainsMono.variable} h-full`}
    >
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,300,0,0&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="flex min-h-full flex-col bg-black text-body-md antialiased">
        <Providers>
          {!isLanding && <Header />}
          <main className={isLanding ? "flex-1" : "flex-1 pt-16"}>{children}</main>
          {!isLanding && <Footer />}
        </Providers>
      </body>
    </html>
  );
}
