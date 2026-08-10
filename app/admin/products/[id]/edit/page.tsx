import { notFound } from "next/navigation";
import { PageHeader } from "@/components/admin/PageHeader";
import { ProductForm, type InitialProduct } from "@/components/admin/products/ProductForm";
import { BoxIcon } from "@/components/ui/admin-icons";
import { Product, ProductCategory, Media } from "@/lib/db/models/index";

export const dynamic = "force-dynamic";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [product, categories] = await Promise.all([
    Product.findByPk(id, { include: [{ model: Media, as: "image" }] }),
    ProductCategory.findAll({
      where: { active: true },
      order: [["order", "ASC"], ["nameTh", "ASC"]],
      attributes: ["id", "nameTh", "parentId"],
    }),
  ]);
  if (!product) notFound();

  const image = product.get("image") as Media | null;

  const initialProduct: InitialProduct = {
    id: product.id,
    sku: product.sku,
    status: product.status,
    nameTh: product.nameTh,
    nameEn: product.nameEn ?? "",
    descriptionTh: product.descriptionTh ?? "",
    descriptionEn: product.descriptionEn ?? "",
    imageUrl: image?.url ?? "",
    categoryId: product.categoryId ?? "",
    price: product.price != null ? String(product.price) : "",
    featured: product.featured,
    bestSeller: product.bestSeller,
    seoTitle: product.seoTitleTh ?? "",
    seoDesc: product.seoDescTh ?? "",
    seoTitleEn: product.seoTitleEn ?? "",
    seoDescEn: product.seoDescEn ?? "",
    seoNoIndex: product.seoNoIndex,
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader icon={BoxIcon} title="แก้ไขสินค้า" subtitle={product.nameTh} />
      <ProductForm initialProduct={initialProduct} categories={categories.map((c) => ({ id: c.id, nameTh: c.nameTh, parentId: c.parentId }))} />
    </div>
  );
}
