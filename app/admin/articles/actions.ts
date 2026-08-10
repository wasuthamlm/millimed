"use server";

import { z } from "zod";
import { UniqueConstraintError } from "sequelize";
import { revalidatePath } from "next/cache";
import { Post } from "@/lib/db/models/index";
import { requireAdmin } from "@/lib/require-admin";
import { getOrCreateMedia } from "@/lib/media";

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

export type PostFormInput = z.infer<typeof postSchema>;
export type PostActionResult = { error: string } | { error?: undefined; id: string };

function publicPathsFor(kind: PostFormInput["kind"], slug: string) {
  return kind === "ARTICLE" ? [`/articles`, `/articles/${slug}`] : [`/news`, `/news/${slug}`];
}

async function resolveCoverImageId(coverImageUrl?: string) {
  if (!coverImageUrl) return null;
  const media = await getOrCreateMedia(coverImageUrl);
  return media.id;
}

function revalidateAll(kind: PostFormInput["kind"], slugs: string[]) {
  revalidatePath("/admin/articles");
  revalidatePath("/admin");
  revalidatePath("/", "layout");
  for (const slug of slugs) {
    for (const path of publicPathsFor(kind, slug)) {
      revalidatePath(path);
    }
  }
}

export async function createPost(input: PostFormInput): Promise<PostActionResult> {
  await requireAdmin();

  const parsed = postSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง" };
  }
  const data = parsed.data;

  try {
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

    revalidateAll(data.kind, [data.slug]);
    return { id: post.id };
  } catch (err) {
    if (err instanceof UniqueConstraintError) {
      return { error: "สลักนี้ถูกใช้แล้ว กรุณาเลือกสลักอื่น" };
    }
    throw err;
  }
}

export async function updatePost(id: string, input: PostFormInput): Promise<PostActionResult> {
  await requireAdmin();

  const parsed = postSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง" };
  }
  const data = parsed.data;

  const existing = await Post.findByPk(id);
  if (!existing) {
    return { error: "ไม่พบบทความ" };
  }

  try {
    const coverImageId = data.coverImageUrl ? await resolveCoverImageId(data.coverImageUrl) : existing.coverImageId;
    const publishedAt = data.status === "PUBLISHED" ? (existing.publishedAt ?? new Date()) : existing.publishedAt;
    const oldKind = existing.kind;
    const oldSlug = existing.slug;

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

    const slugsToRevalidate = oldSlug !== data.slug ? [oldSlug, data.slug] : [data.slug];
    revalidateAll(data.kind, slugsToRevalidate);
    if (oldKind !== data.kind) {
      revalidateAll(oldKind, [oldSlug]);
    }

    return { id: existing.id };
  } catch (err) {
    if (err instanceof UniqueConstraintError) {
      return { error: "สลักนี้ถูกใช้แล้ว กรุณาเลือกสลักอื่น" };
    }
    throw err;
  }
}

export async function deletePost(id: string): Promise<{ error?: string }> {
  await requireAdmin();

  const existing = await Post.findByPk(id);
  if (!existing) return { error: "ไม่พบบทความ" };

  await existing.destroy();
  revalidateAll(existing.kind, [existing.slug]);
  return {};
}

export async function setPostStatus(id: string, status: "DRAFT" | "PUBLISHED"): Promise<{ error?: string }> {
  await requireAdmin();

  const existing = await Post.findByPk(id);
  if (!existing) return { error: "ไม่พบบทความ" };

  await existing.update({
    status,
    publishedAt: status === "PUBLISHED" ? (existing.publishedAt ?? new Date()) : existing.publishedAt,
  });

  revalidateAll(existing.kind, [existing.slug]);
  return {};
}

export async function setPostKind(id: string, kind: "ARTICLE" | "NEWS"): Promise<{ error?: string }> {
  await requireAdmin();

  const existing = await Post.findByPk(id);
  if (!existing) return { error: "ไม่พบบทความ" };
  const oldKind = existing.kind;

  await existing.update({ kind });

  revalidateAll(kind, [existing.slug]);
  if (oldKind !== kind) {
    revalidateAll(oldKind, [existing.slug]);
  }
  return {};
}

export async function setPostCategory(id: string, categoryId: string): Promise<{ error?: string }> {
  await requireAdmin();

  const existing = await Post.findByPk(id);
  if (!existing) return { error: "ไม่พบบทความ" };

  await existing.update({ categoryId: categoryId || null });

  revalidateAll(existing.kind, [existing.slug]);
  return {};
}
