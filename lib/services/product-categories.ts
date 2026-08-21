import { z } from "zod";
import { Op, UniqueConstraintError } from "sequelize";
import { ProductCategory, sequelize } from "@/lib/db/models/index";
import { conflict, notFound, validationError } from "@/lib/services/errors";

export const productCategorySchema = z.object({
  nameTh: z.string().min(1, "จำเป็นต้องระบุชื่อไทย").max(120),
  nameEn: z.string().max(120).optional().or(z.literal("")),
  slug: z.string().min(1).max(120),
  parentId: z.string().nullable(),
});

export type ProductCategoryInput = z.infer<typeof productCategorySchema>;

export interface ListOptions {
  page?: number;
  limit?: number;
  updatedSince?: Date;
}

export async function listProductCategories(options: ListOptions = {}) {
  const page = options.page ?? 1;
  const limit = options.limit ?? 50;
  const where = options.updatedSince ? { updatedAt: { [Op.gte]: options.updatedSince } } : undefined;

  const { rows, count } = await ProductCategory.findAndCountAll({
    where,
    order: [["order", "ASC"]],
    limit,
    offset: (page - 1) * limit,
  });

  return { items: rows, total: count, page, limit };
}

export async function getProductCategory(id: string) {
  const category = await ProductCategory.findByPk(id);
  if (!category) throw notFound("ไม่พบหมวดหมู่สินค้า");
  return category;
}

function parseInput(input: unknown): ProductCategoryInput {
  const parsed = productCategorySchema.safeParse(input);
  if (!parsed.success) throw validationError(parsed.error);
  return parsed.data;
}

async function withUniqueSlugGuard<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    if (err instanceof UniqueConstraintError) throw conflict("Slug นี้ถูกใช้แล้ว");
    throw err;
  }
}

export async function createProductCategory(input: unknown) {
  const data = parseInput(input);
  return withUniqueSlugGuard(() =>
    ProductCategory.create({ nameTh: data.nameTh, nameEn: data.nameEn || null, slug: data.slug, parentId: data.parentId })
  );
}

export async function updateProductCategory(id: string, input: unknown) {
  const data = parseInput(input);
  await getProductCategory(id);
  return withUniqueSlugGuard(async () => {
    await ProductCategory.update(
      { nameTh: data.nameTh, nameEn: data.nameEn || null, slug: data.slug, parentId: data.parentId },
      { where: { id } }
    );
    return getProductCategory(id);
  });
}

export async function deleteProductCategory(id: string) {
  await getProductCategory(id);
  await ProductCategory.destroy({ where: { id } });
}

export async function toggleProductCategory(id: string, active: boolean) {
  await getProductCategory(id);
  await ProductCategory.update({ active }, { where: { id } });
}

export async function reorderProductCategories(ids: string[]) {
  await sequelize.transaction(async (t) => {
    await Promise.all(ids.map((id, index) => ProductCategory.update({ order: index }, { where: { id }, transaction: t })));
  });
}
