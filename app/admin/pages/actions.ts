"use server";

import { z } from "zod";
import { UniqueConstraintError, Op } from "sequelize";
import { revalidatePath } from "next/cache";
import { Page } from "@/lib/db/models/index";
import { requireAdmin } from "@/lib/require-admin";

const pageSchema = z.object({
  status: z.enum(["DRAFT", "PUBLISHED"]),
  slug: z
    .string()
    .min(1, "จำเป็นต้องระบุสลัก")
    .max(160)
    .regex(/^[a-zA-Z0-9_-]+(\/[a-zA-Z0-9_-]+)*$/, "สลักต้องเป็นตัวอักษร ตัวเลข ขีดกลาง ขีดล่าง และ / สำหรับหน้าย่อยเท่านั้น"),
  titleTh: z.string().min(1, "จำเป็นต้องระบุชื่อหน้า").max(200),
  titleEn: z.string().max(200).optional().or(z.literal("")),
});

export type PageFormInput = z.infer<typeof pageSchema>;
export type PageActionResult = { error: string } | { error?: undefined; slug: string };

export async function createPage(input: PageFormInput): Promise<PageActionResult> {
  await requireAdmin();

  const parsed = pageSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง" };
  }
  const data = parsed.data;

  try {
    const page = await Page.create({ status: data.status, slug: data.slug, titleTh: data.titleTh, titleEn: data.titleEn || null });

    revalidatePath("/admin/pages");
    revalidatePath("/", "layout");
    return { slug: page.slug };
  } catch (err) {
    if (err instanceof UniqueConstraintError) {
      return { error: "สลักนี้ถูกใช้แล้ว กรุณาเลือกสลักอื่น" };
    }
    throw err;
  }
}

export async function setPageStatus(id: string, status: "DRAFT" | "PUBLISHED"): Promise<{ error?: string }> {
  await requireAdmin();
  await Page.update({ status }, { where: { id } });
  revalidatePath("/admin/pages");
  revalidatePath("/", "layout");
  return {};
}

export type PageSeoInput = {
  seoTitle: string;
  seoDesc: string;
  seoTitleEn: string;
  seoDescEn: string;
  seoNoIndex: boolean;
};

export async function setPageSeo(id: string, input: PageSeoInput): Promise<{ error?: string }> {
  await requireAdmin();
  await Page.update(
    {
      seoTitleTh: input.seoTitle || null,
      seoDescTh: input.seoDesc || null,
      seoTitleEn: input.seoTitleEn || null,
      seoDescEn: input.seoDescEn || null,
      seoNoIndex: input.seoNoIndex,
    },
    { where: { id } }
  );
  revalidatePath("/admin/pages");
  revalidatePath("/", "layout");
  return {};
}

export async function archivePages(ids: string[]): Promise<{ error?: string }> {
  await requireAdmin();
  if (ids.length === 0) return {};
  await Page.update({ archived: true }, { where: { id: { [Op.in]: ids } } });
  revalidatePath("/admin/pages");
  revalidatePath("/", "layout");
  return {};
}

export async function restorePages(ids: string[]): Promise<{ error?: string }> {
  await requireAdmin();
  if (ids.length === 0) return {};
  await Page.update({ archived: false }, { where: { id: { [Op.in]: ids } } });
  revalidatePath("/admin/pages");
  revalidatePath("/", "layout");
  return {};
}

export async function deletePage(id: string): Promise<{ error?: string }> {
  await requireAdmin();

  const existing = await Page.findByPk(id);
  if (!existing) return { error: "ไม่พบหน้านี้" };

  await existing.destroy();
  revalidatePath("/admin/pages");
  revalidatePath("/", "layout");
  return {};
}
