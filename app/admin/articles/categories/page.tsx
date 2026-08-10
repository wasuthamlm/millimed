import type { Metadata } from "next";
import { fn, col } from "sequelize";
import { PageHeader } from "@/components/admin/PageHeader";
import { FileTextIcon } from "@/components/ui/admin-icons";
import { CategoryManager, type CategoryRow } from "@/components/admin/categories/CategoryManager";
import { ArticleCategory, Post } from "@/lib/db/models/index";
import { createArticleCategory, updateArticleCategory, deleteArticleCategory, toggleArticleCategory, reorderArticleCategories } from "./actions";

export const metadata: Metadata = { title: "จัดการประเภทบทความ" };
export const dynamic = "force-dynamic";

export default async function ArticleCategoriesPage() {
  const [categories, counts] = await Promise.all([
    ArticleCategory.findAll({ order: [["order", "ASC"], ["nameTh", "ASC"]] }),
    Post.findAll({ attributes: ["categoryId", [fn("COUNT", col("id")), "count"]], group: ["categoryId"], raw: true }) as unknown as Promise<
      { categoryId: string | null; count: string }[]
    >,
  ]);

  const countByCategory = new Map(counts.map((c) => [c.categoryId, Number(c.count)]));

  const rows: CategoryRow[] = categories.map((c) => ({
    id: c.id,
    nameTh: c.nameTh,
    nameEn: c.nameEn,
    slug: c.slug,
    active: c.active,
    parentId: null,
    itemCount: countByCategory.get(c.id) ?? 0,
  }));

  return (
    <div className="flex flex-col gap-6">
      <PageHeader icon={FileTextIcon} title="จัดการประเภทบทความ" subtitle={`ประเภททั้งหมด ${rows.length} รายการ`} />
      <CategoryManager
        itemCountLabel="บทความ"
        hasHierarchy={false}
        initialCategories={rows}
        onCreate={createArticleCategory}
        onUpdate={updateArticleCategory}
        onDelete={deleteArticleCategory}
        onToggle={toggleArticleCategory}
        onReorder={reorderArticleCategories}
      />
    </div>
  );
}
