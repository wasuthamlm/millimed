import { z } from "zod";
import { Op, UniqueConstraintError } from "sequelize";
import { Page } from "@/lib/db/models/index";
import { conflict, notFound, validationError } from "@/lib/services/errors";

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

export type PageInput = z.infer<typeof pageSchema>;

export type PageSeoInput = {
  seoTitle: string;
  seoDesc: string;
  seoTitleEn: string;
  seoDescEn: string;
  seoNoIndex: boolean;
};

export interface ListOptions {
  page?: number;
  limit?: number;
  updatedSince?: Date;
  archived?: boolean;
}

export async function listPages(options: ListOptions = {}) {
  const listPage = options.page ?? 1;
  const limit = options.limit ?? 20;
  const where: Record<string, unknown> = {};
  if (options.updatedSince) where.updatedAt = { [Op.gte]: options.updatedSince };
  if (options.archived !== undefined) where.archived = options.archived;

  const { rows, count } = await Page.findAndCountAll({
    where,
    order: [["createdAt", "DESC"]],
    limit,
    offset: (listPage - 1) * limit,
  });

  return { items: rows, total: count, page: listPage, limit };
}

export async function getPage(id: string) {
  const page = await Page.findByPk(id);
  if (!page) throw notFound("ไม่พบหน้านี้");
  return page;
}

export async function createPage(input: unknown) {
  const parsed = pageSchema.safeParse(input);
  if (!parsed.success) throw validationError(parsed.error);
  const data = parsed.data;

  try {
    return await Page.create({ status: data.status, slug: data.slug, titleTh: data.titleTh, titleEn: data.titleEn || null });
  } catch (err) {
    if (err instanceof UniqueConstraintError) throw conflict("สลักนี้ถูกใช้แล้ว กรุณาเลือกสลักอื่น");
    throw err;
  }
}

export async function setPageStatus(id: string, status: "DRAFT" | "PUBLISHED") {
  await getPage(id);
  await Page.update({ status }, { where: { id } });
}

export async function setPageSeo(id: string, input: PageSeoInput) {
  await getPage(id);
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
}

export async function archivePages(ids: string[]) {
  if (ids.length === 0) return;
  await Page.update({ archived: true }, { where: { id: { [Op.in]: ids } } });
}

export async function restorePages(ids: string[]) {
  if (ids.length === 0) return;
  await Page.update({ archived: false }, { where: { id: { [Op.in]: ids } } });
}

export async function deletePage(id: string) {
  const existing = await getPage(id);
  await existing.destroy();
}
