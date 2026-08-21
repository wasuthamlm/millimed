import { z } from "zod";
import { Op, UniqueConstraintError } from "sequelize";
import { Post, ArticleCategory, Media, User } from "@/lib/db/models/index";
import { getOrCreateMedia } from "@/lib/media";
import { conflict, notFound, validationError } from "@/lib/services/errors";
import { serializeUserRef } from "@/lib/api/serialize";

const postSchema = z.object({
  kind: z.enum(["ARTICLE", "NEWS"]),
  status: z.enum(["DRAFT", "PUBLISHED"]),
  slug: z
    .string()
    .min(1, "จำเป็นต้องระบุสลัก")
    .max(160)
    .regex(/^[a-z0-9-]+$/, "สลักต้องเป็นตัวอักษรภาษาอังกฤษพิมพ์เล็ก ตัวเลข และขีดกลางเท่านั้น"),
  titleTh: z.string().min(1, "จำเป็นต้องระบุชื่อเรื่อง").max(300),
  titleEn: z.string().max(300).optional().or(z.literal("")),
  excerptTh: z.string().max(500).optional().or(z.literal("")),
  excerptEn: z.string().max(500).optional().or(z.literal("")),
  bodyTh: z.string().optional().or(z.literal("")),
  bodyEn: z.string().optional().or(z.literal("")),
  categoryId: z.string().optional().or(z.literal("")),
  featured: z.boolean().optional(),
  coverImageUrl: z.string().url().optional().or(z.literal("")),
  seoTitle: z.string().max(70).optional().or(z.literal("")),
  seoDesc: z.string().max(200).optional().or(z.literal("")),
  seoTitleEn: z.string().max(70).optional().or(z.literal("")),
  seoDescEn: z.string().max(200).optional().or(z.literal("")),
  seoNoIndex: z.boolean().optional(),
});

export type PostInput = z.infer<typeof postSchema>;

const INCLUDE = [
  { model: ArticleCategory, as: "categoryRef" },
  { model: Media, as: "coverImage" },
  { model: User, as: "author" },
];

/**
 * Post.author is a User association with no defaultScope excluding
 * passwordHash (NextAuth credentials login needs to read it elsewhere), so
 * API responses must never spread the raw included User — always go through
 * this to whitelist to {id, name}.
 */
export function toApiJson(post: Post): Record<string, unknown> {
  const plain = post.toJSON() as Record<string, unknown> & { author?: unknown };
  return { ...plain, author: serializeUserRef(plain.author) };
}

export interface ListOptions {
  page?: number;
  limit?: number;
  updatedSince?: Date;
  kind?: "ARTICLE" | "NEWS";
  status?: "DRAFT" | "PUBLISHED";
}

export async function listPosts(options: ListOptions = {}) {
  const page = options.page ?? 1;
  const limit = options.limit ?? 20;
  const where: Record<string, unknown> = {};
  if (options.updatedSince) where.updatedAt = { [Op.gte]: options.updatedSince };
  if (options.kind) where.kind = options.kind;
  if (options.status) where.status = options.status;

  const { rows, count } = await Post.findAndCountAll({
    where,
    include: INCLUDE,
    order: [["createdAt", "DESC"]],
    limit,
    offset: (page - 1) * limit,
  });

  return { items: rows.map(toApiJson), total: count, page, limit };
}

export async function getPost(id: string) {
  const post = await Post.findByPk(id, { include: INCLUDE });
  if (!post) throw notFound("ไม่พบบทความ");
  return toApiJson(post);
}

function parseInput(input: unknown): PostInput {
  const parsed = postSchema.safeParse(input);
  if (!parsed.success) throw validationError(parsed.error);
  return parsed.data;
}

async function resolveCoverImageId(coverImageUrl?: string) {
  if (!coverImageUrl) return null;
  const media = await getOrCreateMedia(coverImageUrl);
  return media.id;
}

async function withUniqueSlugGuard<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    if (err instanceof UniqueConstraintError) throw conflict("สลักนี้ถูกใช้แล้ว กรุณาเลือกสลักอื่น");
    throw err;
  }
}

export async function createPost(input: unknown) {
  const data = parseInput(input);
  return withUniqueSlugGuard(async () => {
    const coverImageId = await resolveCoverImageId(data.coverImageUrl);
    const post = await Post.create({
      kind: data.kind,
      status: data.status,
      slug: data.slug,
      titleTh: data.titleTh,
      titleEn: data.titleEn || null,
      excerptTh: data.excerptTh || null,
      excerptEn: data.excerptEn || null,
      bodyTh: data.bodyTh || null,
      bodyEn: data.bodyEn || null,
      categoryId: data.categoryId || null,
      featured: data.featured ?? false,
      coverImageId,
      publishedAt: data.status === "PUBLISHED" ? new Date() : null,
      seoTitleTh: data.seoTitle || null,
      seoDescTh: data.seoDesc || null,
      seoTitleEn: data.seoTitleEn || null,
      seoDescEn: data.seoDescEn || null,
      seoNoIndex: data.seoNoIndex ?? false,
    });
    return getPost(post.id);
  });
}

export async function updatePost(id: string, input: unknown) {
  const data = parseInput(input);
  const existing = await Post.findByPk(id);
  if (!existing) throw notFound("ไม่พบบทความ");

  return withUniqueSlugGuard(async () => {
    const coverImageId = data.coverImageUrl ? await resolveCoverImageId(data.coverImageUrl) : existing.coverImageId;
    const publishedAt = data.status === "PUBLISHED" ? (existing.publishedAt ?? new Date()) : existing.publishedAt;

    await existing.update({
      kind: data.kind,
      status: data.status,
      slug: data.slug,
      titleTh: data.titleTh,
      titleEn: data.titleEn || null,
      excerptTh: data.excerptTh || null,
      excerptEn: data.excerptEn || null,
      bodyTh: data.bodyTh || null,
      bodyEn: data.bodyEn || null,
      categoryId: data.categoryId || null,
      featured: data.featured ?? false,
      coverImageId,
      publishedAt,
      seoTitleTh: data.seoTitle || null,
      seoDescTh: data.seoDesc || null,
      seoTitleEn: data.seoTitleEn || null,
      seoDescEn: data.seoDescEn || null,
      seoNoIndex: data.seoNoIndex ?? false,
    });
    return getPost(id);
  });
}

export async function deletePost(id: string) {
  const existing = await Post.findByPk(id);
  if (!existing) throw notFound("ไม่พบบทความ");
  await existing.destroy();
}

export async function setPostStatus(id: string, status: "DRAFT" | "PUBLISHED") {
  const existing = await Post.findByPk(id);
  if (!existing) throw notFound("ไม่พบบทความ");
  await existing.update({
    status,
    publishedAt: status === "PUBLISHED" ? (existing.publishedAt ?? new Date()) : existing.publishedAt,
  });
  return getPost(id);
}

export async function setPostKind(id: string, kind: "ARTICLE" | "NEWS") {
  const existing = await Post.findByPk(id);
  if (!existing) throw notFound("ไม่พบบทความ");
  await existing.update({ kind });
  return getPost(id);
}

export async function setPostCategory(id: string, categoryId: string) {
  const existing = await Post.findByPk(id);
  if (!existing) throw notFound("ไม่พบบทความ");
  await existing.update({ categoryId: categoryId || null });
  return getPost(id);
}
