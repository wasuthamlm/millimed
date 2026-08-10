import Link from "next/link";
import { Op, type WhereOptions } from "sequelize";
import { PageHeader } from "@/components/admin/PageHeader";
import { Pager } from "@/components/admin/Pager";
import { FileTextIcon, PlusIcon } from "@/components/ui/admin-icons";
import { ArticleFilters } from "@/components/admin/articles/ArticleFilters";
import { PostStatusCell } from "@/components/admin/articles/PostStatusCell";
import { PostKindCell } from "@/components/admin/articles/PostKindCell";
import { PostCategoryCell } from "@/components/admin/articles/PostCategoryCell";
import { PostRowMenu } from "@/components/admin/articles/PostRowMenu";
import { SeoScoreBadge } from "@/components/admin/articles/SeoScoreBadge";
import { calculateSeoAeoGeo, postToScoreInput } from "@/lib/seo-score";
import { Post, ArticleCategory } from "@/lib/db/models/index";
import { formatThaiDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 20;

export default async function AdminArticlesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string; kind?: string; status?: string }>;
}) {
  const { page: pageParam, q, kind, status } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);

  const where: WhereOptions = {
    ...(q
      ? { [Op.or]: [{ titleTh: { [Op.iLike]: `%${q}%` } }, { titleEn: { [Op.iLike]: `%${q}%` } }, { slug: { [Op.iLike]: `%${q}%` } }] }
      : {}),
    ...(kind ? { kind } : {}),
    ...(status ? { status } : {}),
  };

  const [{ rows: posts, count: totalArticles }, publishedArticles, categories] = await Promise.all([
    Post.findAndCountAll({ where, order: [["updatedAt", "DESC"]], limit: PAGE_SIZE, offset: (page - 1) * PAGE_SIZE }),
    Post.count({ where: { status: "PUBLISHED" } }),
    ArticleCategory.findAll({ where: { active: true }, order: [["order", "ASC"], ["nameTh", "ASC"]], attributes: ["id", "nameTh"] }),
  ]);

  const totalPages = Math.max(1, Math.ceil(totalArticles / PAGE_SIZE));
  const categoryOptions = categories.map((c) => ({ id: c.id, nameTh: c.nameTh }));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4">
        <PageHeader icon={FileTextIcon} title="บทความ" subtitle={`บทความทั้งหมด ${totalArticles} รายการ • เผยแพร่แล้ว ${publishedArticles}`} />
        <Link href="/admin/articles/new" className="inline-flex items-center gap-2 rounded-lg bg-brand-navy px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-navy-dark">
          <PlusIcon className="h-4 w-4" />
          เพิ่มบทความใหม่
        </Link>
      </div>

      <ArticleFilters />

      <div className="overflow-x-auto rounded-2xl border border-slate-100 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400">
              <th className="px-6 py-3 font-medium">ชื่อบทความ</th>
              <th className="px-6 py-3 font-medium">ประเภท</th>
              <th className="px-6 py-3 font-medium">หมวดหมู่</th>
              <th className="px-6 py-3 font-medium">สถานะ</th>
              <th className="px-6 py-3 font-medium">SEO</th>
              <th className="px-6 py-3 font-medium">เผยแพร่เมื่อ</th>
              <th className="px-6 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {posts.map((post) => {
              const seo = calculateSeoAeoGeo(
                postToScoreInput({
                  titleTh: post.titleTh,
                  titleEn: post.titleEn,
                  seoTitle: post.seoTitleTh,
                  seoTitleEn: post.seoTitleEn,
                  seoDesc: post.seoDescTh,
                  seoDescEn: post.seoDescEn,
                  excerptTh: post.excerptTh,
                  bodyTh: post.bodyTh,
                  slug: post.slug,
                  hasCoverImage: !!post.coverImageId,
                })
              );

              return (
                <tr key={post.id} className="border-b border-slate-50 last:border-0">
                  <td className="max-w-md px-6 py-3.5">
                    <Link href={`/admin/articles/${post.id}/edit`} className="block truncate font-medium text-slate-800 hover:text-brand-navy">
                      {post.titleTh}
                    </Link>
                    <p className="truncate text-xs text-slate-400">{post.titleEn || "+ ชื่ออังกฤษ"}</p>
                  </td>
                  <td className="px-6 py-3.5">
                    <PostKindCell id={post.id} kind={post.kind} />
                  </td>
                  <td className="px-6 py-3.5">
                    <PostCategoryCell id={post.id} categoryId={post.categoryId} categories={categoryOptions} />
                  </td>
                  <td className="px-6 py-3.5">
                    <PostStatusCell id={post.id} status={post.status} />
                  </td>
                  <td className="px-6 py-3.5">
                    <SeoScoreBadge score={seo.seo.score} />
                  </td>
                  <td className="px-6 py-3.5 text-slate-400">{post.publishedAt ? formatThaiDate(post.publishedAt.toISOString()) : "—"}</td>
                  <td className="px-6 py-3.5">
                    <PostRowMenu id={post.id} />
                  </td>
                </tr>
              );
            })}
            {posts.length === 0 && (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-slate-400">
                  ไม่พบบทความที่ตรงกับเงื่อนไข
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Pager page={page} totalPages={totalPages} basePath="/admin/articles" extraParams={{ q, kind, status }} />
    </div>
  );
}
