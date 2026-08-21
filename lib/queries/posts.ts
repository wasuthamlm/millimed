import { Post, Media } from "@/lib/db/models/index";
import type { NewsItem } from "@/data/news";
import type { ArticleItem } from "@/data/articles";

const PLACEHOLDER = "/images/placeholder-news-1.png";

function toNewsItem(row: Post, gallery: string[] = []): NewsItem {
  const image = (row.get("coverImage") as Media | null)?.url ?? PLACEHOLDER;
  return {
    slug: row.slug,
    title: row.titleTh,
    image,
    gallery,
    excerpt: row.excerptTh ?? "",
    publishedAt: (row.publishedAt ?? row.createdAt).toISOString(),
    bodyTh: row.bodyTh ?? "",
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
    include: [{ model: Media, as: "coverImage" }],
  });
  return rows.map((row) => toNewsItem(row));
}

export async function getNewsBySlug(slug: string): Promise<NewsItem | null> {
  const row = await Post.findOne({
    where: { kind: "NEWS", status: "PUBLISHED", slug },
    include: [{ model: Media, as: "coverImage" }],
  });
  if (!row) return null;

  return toNewsItem(row, await resolveGallery(row.galleryImageIds));
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
