import { PageHeader } from "@/components/admin/PageHeader";
import { PostForm } from "@/components/admin/articles/PostForm";
import { FileTextIcon } from "@/components/ui/admin-icons";
import { ArticleCategory } from "@/lib/db/models/index";

export const dynamic = "force-dynamic";

export default async function NewArticlePage() {
  const categories = await ArticleCategory.findAll({
    where: { active: true },
    order: [["order", "ASC"], ["nameTh", "ASC"]],
    attributes: ["id", "nameTh"],
  });

  return (
    <div className="flex flex-col gap-6">
      <PageHeader icon={FileTextIcon} title="เพิ่มบทความใหม่" />
      <PostForm categories={categories.map((c) => ({ id: c.id, nameTh: c.nameTh }))} />
    </div>
  );
}
