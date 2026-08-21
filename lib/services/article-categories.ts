import { z } from "zod";
import { Op, UniqueConstraintError } from "sequelize";
import { ArticleCategory, sequelize } from "@/lib/db/models/index";
import { conflict, notFound, validationError } from "@/lib/services/errors";

export const articleCategorySchema = z.object({
  nameTh: z.string().min(1, "จำเป็นต้องระบุชื่อไทย").max(120),
  nameEn: z.string().max(120).optional().or(z.literal("")),
  slug: z.string().min(1).max(120),
});

export type ArticleCategoryInput = z.infer<typeof articleCategorySchema>;

export interface ListArticleCategoriesOptions {
  page?: number;
  limit?: number;
  updatedSince?: Date;
}

export async function listArticleCategories(options: ListArticleCategoriesOptions = {}) {
  const page = options.page ?? 1;
  const limit = options.limit ?? 50;
  const where = options.updatedSince ? { updatedAt: { [Op.gte]: options.updatedSince } } : undefined;

  const { rows, count } = await ArticleCategory.findAndCountAll({
    where,
    order: [["order", "ASC"]],
    limit,
    offset: (page - 1) * limit,
  });

  return { items: rows, total: count, page, limit };
}

export async function getArticleCategory(id: string) {
  const category = await ArticleCategory.findByPk(id);
  if (!category) throw notFound("ไม่พบหมวดหมู่บทความ");
  return category;
}

function parseInput(input: unknown): ArticleCategoryInput {
  const parsed = articleCategorySchema.safeParse(input);
  if (!parsed.success) throw validationError(parsed.error);
  return parsed.data;
}

async function withUniqueSlugGuard<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    if (err instanceof UniqueConstraintError) {
      throw conflict("Slug นี้ถูกใช้แล้ว");
    }
    throw err;
  }
}

export async function createArticleCategory(input: unknown) {
  const data = parseInput(input);
  return withUniqueSlugGuard(() =>
    ArticleCategory.create({ nameTh: data.nameTh, nameEn: data.nameEn || null, slug: data.slug })
  );
}

export async function updateArticleCategory(id: string, input: unknown) {
  const data = parseInput(input);
  await getArticleCategory(id);
  return withUniqueSlugGuard(async () => {
    await ArticleCategory.update(
      { nameTh: data.nameTh, nameEn: data.nameEn || null, slug: data.slug },
      { where: { id } }
    );
    return getArticleCategory(id);
  });
}

export async function deleteArticleCategory(id: string) {
  await getArticleCategory(id);
  await ArticleCategory.destroy({ where: { id } });
}

export async function toggleArticleCategory(id: string, active: boolean) {
  await getArticleCategory(id);
  await ArticleCategory.update({ active }, { where: { id } });
}

export async function reorderArticleCategories(ids: string[]) {
  await sequelize.transaction(async (t) => {
    await Promise.all(
      ids.map((id, index) => ArticleCategory.update({ order: index }, { where: { id }, transaction: t }))
    );
  });
}
