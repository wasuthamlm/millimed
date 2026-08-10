import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { ProductCard } from "@/components/products/ProductCard";
import { getActiveProducts } from "@/lib/queries/catalog";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "สินค้า",
  description: "ผลิตภัณฑ์ของ Millimed",
  alternates: { canonical: "/products" },
};

export default async function ProductsPage() {
  const products = await getActiveProducts();

  return (
    <Container className="flex flex-col gap-8 py-14 sm:py-20">
      <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">สินค้า</h1>
      <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </Container>
  );
}
