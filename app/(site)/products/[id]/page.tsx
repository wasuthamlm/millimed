import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { getProductById } from "@/lib/queries/catalog";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const product = await getProductById(id);
  if (!product) return {};
  return {
    title: product.nameTh,
    description: product.descriptionTh,
    alternates: { canonical: `/products/${id}` },
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getProductById(id);
  if (!product) notFound();

  return (
    <Container className="grid gap-10 py-14 sm:py-20 lg:grid-cols-2">
      <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-slate-50">
        <Image
          src={product.image}
          alt={product.nameTh}
          fill
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="object-cover"
          priority
        />
      </div>

      <div className="flex flex-col gap-4">
        <p className="text-sm text-slate-400">{product.sku}</p>
        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">{product.nameTh}</h1>
        <p className="whitespace-pre-line text-base leading-relaxed text-slate-600">
          {product.descriptionTh}
        </p>
      </div>
    </Container>
  );
}
