import { Op } from "sequelize";
import { Post, Media, ArticleCategory } from "@/lib/db/models/index";
import type { NewsItem } from "@/data/news";
import type { ArticleItem } from "@/data/articles";

const PLACEHOLDER = "/images/placeholder-news-1.png";

export type NewsCategoryFilter = "all" | "company" | "csr" | "internal";

const CSR_CATEGORY_SLUGS = ["csr-sharing-love", "csr-education"];
const INTERNAL_CATEGORY_SLUGS = ["internal-kickoff", "internal-family", "internal-recreation"];

async function resolveCategoryIds(slugs: string[]): Promise<string[]> {
  const rows = await ArticleCategory.findAll({ where: { slug: slugs }, attributes: ["id"] });
  return rows.map((r) => r.id);
}

function toNewsItem(row: Post, gallery: string[] = []): NewsItem {
  const image = (row.get("coverImage") as Media | null)?.url ?? PLACEHOLDER;
  const category = row.get("categoryRef") as ArticleCategory | null;
  return {
    slug: row.slug,
    title: row.titleTh,
    image,
    gallery,
    excerpt: row.excerptTh ?? "",
    publishedAt: (row.publishedAt ?? row.createdAt).toISOString(),
    bodyTh: row.bodyTh ?? "",
    categoryId: row.categoryId ?? null,
    categoryLabel: category?.nameTh ?? null,
  };
}

function toArticleItem(row: Post, gallery: string[] = []): ArticleItem {
  const image = (row.get("coverImage") as Media | null)?.url ?? PLACEHOLDER;
  return {
    slug: row.slug,
    title: row.titleTh,
    image,
    gallery,
    bodyTh: row.bodyTh ?? "",
    categoryId: row.categoryId ?? null,
  };
}

async function resolveGallery(galleryImageIds: string[]): Promise<string[]> {
  if (!galleryImageIds.length) return [];
  const media = await Media.findAll({ where: { id: galleryImageIds }, attributes: ["id", "url"] });
  const byId = new Map(media.map((m) => [m.id, m.url]));
  return galleryImageIds.map((id) => byId.get(id)).filter((url): url is string => Boolean(url));
}

export async function getLatestNews(limit: number): Promise<NewsItem[]> {
  const rows = await Post.findAll({
    where: { kind: "NEWS", status: "PUBLISHED" },
    order: [["publishedAt", "DESC"]],
    limit,
    include: [
      { model: Media, as: "coverImage" },
      { model: ArticleCategory, as: "categoryRef" },
    ],
  });
  return rows.map((row) => toNewsItem(row));
}

export async function getNewsBySlug(slug: string): Promise<NewsItem | null> {
  const row = await Post.findOne({
    where: { kind: "NEWS", status: "PUBLISHED", slug },
    include: [
      { model: Media, as: "coverImage" },
      { model: ArticleCategory, as: "categoryRef" },
    ],
  });
  if (!row) return null;

  return toNewsItem(row, await resolveGallery(row.galleryImageIds));
}

export async function getLatestActivities(limit: number): Promise<NewsItem[]> {
  const categoryIds = await resolveCategoryIds([...CSR_CATEGORY_SLUGS, ...INTERNAL_CATEGORY_SLUGS]);
  const rows = await Post.findAll({
    where: { kind: "NEWS", status: "PUBLISHED", categoryId: { [Op.in]: categoryIds } },
    order: [["publishedAt", "DESC"]],
    limit,
    include: [
      { model: Media, as: "coverImage" },
      { model: ArticleCategory, as: "categoryRef" },
    ],
  });
  return rows.map((row) => toNewsItem(row));
}

export async function getNewsAndActivities({
  page = 1,
  pageSize = 12,
  category = "all",
}: {
  page?: number;
  pageSize?: number;
  category?: NewsCategoryFilter;
}): Promise<{ items: NewsItem[]; total: number; totalPages: number }> {
  const conditions: object[] = [{ kind: "NEWS", status: "PUBLISHED" }];

  if (category === "company") {
    // "ข่าวสารบริษัท" excludes CSR/internal-activity posts, whether or not they
    // carry a categoryId — otherwise this tab would just duplicate "all".
    const activityIds = await resolveCategoryIds([...CSR_CATEGORY_SLUGS, ...INTERNAL_CATEGORY_SLUGS]);
    conditions.push({ [Op.or]: [{ categoryId: null }, { categoryId: { [Op.notIn]: activityIds } }] });
  } else if (category === "csr") {
    conditions.push({ categoryId: { [Op.in]: await resolveCategoryIds(CSR_CATEGORY_SLUGS) } });
  } else if (category === "internal") {
    conditions.push({ categoryId: { [Op.in]: await resolveCategoryIds(INTERNAL_CATEGORY_SLUGS) } });
  }

  const where = { [Op.and]: conditions };

  const { rows, count } = await Post.findAndCountAll({
    where,
    order: [["publishedAt", "DESC"]],
    limit: pageSize,
    offset: (page - 1) * pageSize,
    include: [
      { model: Media, as: "coverImage" },
      { model: ArticleCategory, as: "categoryRef" },
    ],
  });

  return {
    items: rows.map((row) => toNewsItem(row)),
    total: count,
    totalPages: Math.max(1, Math.ceil(count / pageSize)),
  };
}

export async function getLatestArticles(limit: number): Promise<ArticleItem[]> {
  const rows = await Post.findAll({
    where: { kind: "ARTICLE", status: "PUBLISHED" },
    order: [["publishedAt", "DESC"]],
    limit,
    include: [{ model: Media, as: "coverImage" }],
  });
  return rows.map((row) => toArticleItem(row));
}

export async function getArticlesByCategory(categoryId: string, limit: number): Promise<ArticleItem[]> {
  const rows = await Post.findAll({
    where: { kind: "ARTICLE", status: "PUBLISHED", categoryId },
    order: [["publishedAt", "DESC"]],
    limit,
    include: [{ model: Media, as: "coverImage" }],
  });
  return rows.map((row) => toArticleItem(row));
}

export async function getArticleBySlug(slug: string): Promise<ArticleItem | null> {
  const row = await Post.findOne({
    where: { kind: "ARTICLE", status: "PUBLISHED", slug },
    include: [{ model: Media, as: "coverImage" }],
  });
  if (!row) return null;

  return toArticleItem(row, await resolveGallery(row.galleryImageIds));
}
