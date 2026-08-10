import { Product, Media } from "@/lib/db/models/index";
import type { Product as ProductData } from "@/data/products";

const PLACEHOLDER = "/images/placeholder-product-1.png";

function toProductItem(row: Product): ProductData {
  return {
    id: row.id,
    sku: row.sku,
    nameTh: row.nameTh,
    image: (row.get("image") as Media | null)?.url ?? PLACEHOLDER,
    descriptionTh: row.descriptionTh ?? "",
  };
}

export async function getActiveProducts(): Promise<ProductData[]> {
  const rows = await Product.findAll({
    where: { status: "ACTIVE" },
    order: [["createdAt", "DESC"]],
    include: [{ model: Media, as: "image" }],
  });
  return rows.map(toProductItem);
}

export async function getProductById(id: string): Promise<ProductData | null> {
  const row = await Product.findOne({
    where: { id, status: "ACTIVE" },
    include: [{ model: Media, as: "image" }],
  });
  return row ? toProductItem(row) : null;
}
