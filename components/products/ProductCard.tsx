import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/data/products";

export function ProductCard({ product }: { product: Product }) {
  return (
    <Link
      href={`/products/${product.id}`}
      className="overflow-hidden rounded-xl border border-slate-100 shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="relative aspect-square w-full bg-slate-50">
        <Image
          src={product.image}
          alt={product.nameTh}
          fill
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
          className="object-cover"
        />
      </div>
      <div className="p-3">
        <p className="text-xs text-slate-400">{product.sku}</p>
        <h3 className="line-clamp-2 text-sm font-semibold text-slate-900">{product.nameTh}</h3>
      </div>
    </Link>
  );
}
