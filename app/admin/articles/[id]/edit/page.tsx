import { notFound } from "next/navigation";
import { PageHeader } from "@/components/admin/PageHeader";
import { PostForm, type InitialPost } from "@/components/admin/articles/PostForm";
import { FileTextIcon } from "@/components/ui/admin-icons";
import { Post, ArticleCategory, Media } from "@/lib/db/models/index";

export const dynamic = "force-dynamic";

export default async function EditArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [post, categories] = await Promise.all([
    Post.findByPk(id, { include: [{ model: Media, as: "coverImage" }] }),
    ArticleCategory.findAll({ where: { active: true }, order: [["order", "ASC"], ["nameTh", "ASC"]], attributes: ["id", "nameTh"] }),
  ]);
  if (!post) notFound();

  const coverImage = post.get("coverImage") as Media | null;

  const initialPost: InitialPost = {
    id: post.id,
    kind: post.kind,
    status: post.status,
    slug: post.slug,
    titleTh: post.titleTh,
    titleEn: post.titleEn ?? "",
    excerptTh: post.excerptTh ?? "",
    excerptEn: post.excerptEn ?? "",
    bodyTh: post.bodyTh ?? "",
    bodyEn: post.bodyEn ?? "",
    categoryId: post.categoryId ?? "",
    featured: post.featured,
    coverImageUrl: coverImage?.url ?? "",
    seoTitle: post.seoTitleTh ?? "",
    seoDesc: post.seoDescTh ?? "",
    seoTitleEn: post.seoTitleEn ?? "",
    seoDescEn: post.seoDescEn ?? "",
    seoNoIndex: post.seoNoIndex,
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader icon={FileTextIcon} title="แก้ไขบทความ" subtitle={post.titleTh} />
      <PostForm initialPost={initialPost} categories={categories.map((c) => ({ id: c.id, nameTh: c.nameTh }))} />
    </div>
  );
}
