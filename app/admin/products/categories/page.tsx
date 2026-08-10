import type { Metadata } from "next";
import { fn, col } from "sequelize";
import { PageHeader } from "@/components/admin/PageHeader";
import { BoxIcon } from "@/components/ui/admin-icons";
import { CategoryManager, type CategoryRow } from "@/components/admin/categories/CategoryManager";
import { ProductCategory, Product } from "@/lib/db/models/index";
import { createProductCategory, updateProductCategory, deleteProductCategory, toggleProductCategory, reorderProductCategories } from "./actions";

export const metadata: Metadata = { title: "จัดการหมวดหมู่สินค้า" };
export const dynamic = "force-dynamic";

export default async function ProductCategoriesPage() {
  const [categories, counts] = await Promise.all([
    ProductCategory.findAll({ order: [["order", "ASC"], ["nameTh", "ASC"]] }),
    Product.findAll({
      attributes: ["categoryId", [fn("COUNT", col("id")), "count"]],
      group: ["categoryId"],
      raw: true,
    }) as unknown as Promise<{ categoryId: string | null; count: string }[]>,
  ]);

  const countByCategory = new Map(counts.map((c) => [c.categoryId, Number(c.count)]));

  const rows: CategoryRow[] = categories.map((c) => ({
    id: c.id,
    nameTh: c.nameTh,
    nameEn: c.nameEn,
    slug: c.slug,
    active: c.active,
    parentId: c.parentId,
    itemCount: countByCategory.get(c.id) ?? 0,
  }));

  return (
    <div className="flex flex-col gap-6">
      <PageHeader icon={BoxIcon} title="จัดการหมวดหมู่สินค้า" subtitle={`หมวดหมู่ทั้งหมด ${rows.length} รายการ`} />
      <CategoryManager
        itemCountLabel="สินค้า"
        hasHierarchy
        initialCategories={rows}
        onCreate={createProductCategory}
        onUpdate={updateProductCategory}
        onDelete={deleteProductCategory}
        onToggle={toggleProductCategory}
        onReorder={reorderProductCategories}
      />
    </div>
  );
}
