import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { getNewsBySlug } from "@/lib/queries/posts";
import { formatThaiDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const item = await getNewsBySlug(slug);
  if (!item) return {};
  return {
    title: item.title,
    description: item.excerpt,
    alternates: { canonical: `/news/${slug}` },
  };
}

export default async function NewsDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const item = await getNewsBySlug(slug);
  if (!item) notFound();

  return (
    <Container className="flex flex-col gap-6 py-14 sm:py-20">
      <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl">
        <Image src={item.image} alt={item.title} fill sizes="100vw" className="object-cover" priority />
      </div>
      <p className="text-sm text-slate-400">{formatThaiDate(item.publishedAt)}</p>
      <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">{item.title}</h1>
      <p className="whitespace-pre-line text-base leading-relaxed text-slate-600">{item.bodyTh}</p>
      {item.gallery.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {item.gallery.map((url, i) => (
            <div key={url} className="relative aspect-square overflow-hidden rounded-xl bg-slate-50">
              <Image src={url} alt={`${item.title} ${i + 1}`} fill sizes="(min-width: 640px) 33vw, 50vw" className="object-cover" />
            </div>
          ))}
        </div>
      )}
    </Container>
  );
}
