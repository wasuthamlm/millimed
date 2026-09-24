import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPageBySlug } from "@/lib/queries/pages";
import { PageSectionsRenderer } from "@/components/site/PageSectionsRenderer";

export const dynamic = "force-dynamic";

const PAGE_SLUG = "about/products-overview";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPageBySlug(PAGE_SLUG);
  return {
    title: page?.titleTh ?? "ผลิตภัณฑ์",
    alternates: { canonical: "/products" },
  };
}

export default async function ProductsPage() {
  const page = await getPageBySlug(PAGE_SLUG);
  if (!page) notFound();

  return <PageSectionsRenderer sections={page.sections} />;
}
