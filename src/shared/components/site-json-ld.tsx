import { siteConfig } from "@/config/site";
import { routes } from "@/config/routes";

export function SiteJsonLd() {
  const base = siteConfig.url.replace(/\/$/, "");

  const website = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.name,
    url: base,
    description: siteConfig.description,
    inLanguage: "es-AR",
    potentialAction: {
      "@type": "SearchAction",
      target: `${base}${routes.events}?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };

  const organization = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteConfig.name,
    url: base,
    description: siteConfig.description,
    logo: `${base}${siteConfig.logo}`,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(website) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organization) }}
      />
    </>
  );
}
