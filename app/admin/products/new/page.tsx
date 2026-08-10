import { PageHeader } from "@/components/admin/PageHeader";
import { ProductForm } from "@/components/admin/products/ProductForm";
import { BoxIcon } from "@/components/ui/admin-icons";
import { ProductCategory } from "@/lib/db/models/index";

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  const categories = await ProductCategory.findAll({
    where: { active: true },
    order: [["order", "ASC"], ["nameTh", "ASC"]],
    attributes: ["id", "nameTh", "parentId"],
  });

  return (
    <div className="flex flex-col gap-6">
      <PageHeader icon={BoxIcon} title="เพิ่มสินค้าใหม่" />
      <ProductForm categories={categories.map((c) => ({ id: c.id, nameTh: c.nameTh, parentId: c.parentId }))} />
    </div>
  );
}
