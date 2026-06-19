import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LegalLayout } from "@/features/legal/presentation/components/legal-layout";
import { legalContentBySlug } from "@/features/legal/content/documents";
import { legalDocuments } from "@/config/legal";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return legalDocuments.map((doc) => ({ slug: doc.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const content = legalContentBySlug[slug];
  if (!content) return { title: "Documento no encontrado" };
  return {
    title: content.title,
    description: content.subtitle,
  };
}

export default async function LegalDocumentPage({ params }: PageProps) {
  const { slug } = await params;
  const content = legalContentBySlug[slug];

  if (!content) notFound();

  return <LegalLayout currentSlug={slug} content={content} />;
}
