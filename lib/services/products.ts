import { z } from "zod";
import { Op, UniqueConstraintError } from "sequelize";
import { Product, ProductCategory, Media } from "@/lib/db/models/index";
import { getOrCreateMedia } from "@/lib/media";
import { conflict, notFound, validationError } from "@/lib/services/errors";

const productSchema = z.object({
  sku: z.string().min(1, "จำเป็นต้องระบุ SKU").max(64),
  status: z.enum(["ACTIVE", "DRAFT", "ARCHIVED"]),
  nameTh: z.string().min(1, "จำเป็นต้องระบุชื่อสินค้า").max(300),
  nameEn: z.string().max(300).optional().or(z.literal("")),
  descriptionTh: z.string().optional().or(z.literal("")),
  descriptionEn: z.string().optional().or(z.literal("")),
  imageUrl: z.string().url().optional().or(z.literal("")),
  categoryId: z.string().optional().or(z.literal("")),
  price: z.string().optional().or(z.literal("")),
  featured: z.boolean().optional(),
  bestSeller: z.boolean().optional(),
  seoTitle: z.string().max(70).optional().or(z.literal("")),
  seoDesc: z.string().max(200).optional().or(z.literal("")),
  seoTitleEn: z.string().max(70).optional().or(z.literal("")),
  seoDescEn: z.string().max(200).optional().or(z.literal("")),
  seoNoIndex: z.boolean().optional(),
});

export type ProductInput = z.infer<typeof productSchema>;

const INCLUDE = [
  { model: ProductCategory, as: "categoryRef" },
  { model: Media, as: "image" },
];

export interface ListOptions {
  page?: number;
  limit?: number;
  updatedSince?: Date;
  status?: "ACTIVE" | "DRAFT" | "ARCHIVED";
}

export async function listProducts(options: ListOptions = {}) {
  const page = options.page ?? 1;
  const limit = options.limit ?? 20;
  const where: Record<string, unknown> = {};
  if (options.updatedSince) where.updatedAt = { [Op.gte]: options.updatedSince };
  if (options.status) where.status = options.status;

  const { rows, count } = await Product.findAndCountAll({
    where,
    include: INCLUDE,
    order: [["createdAt", "DESC"]],
    limit,
    offset: (page - 1) * limit,
  });

  return { items: rows, total: count, page, limit };
}

export async function getProduct(id: string) {
  const product = await Product.findByPk(id, { include: INCLUDE });
  if (!product) throw notFound("ไม่พบสินค้า");
  return product;
}

function parseInput(input: unknown): ProductInput {
  const parsed = productSchema.safeParse(input);
  if (!parsed.success) throw validationError(parsed.error);
  return parsed.data;
}

function parsePrice(price?: string): number | null {
  if (!price) return null;
  const n = Number(price);
  return Number.isFinite(n) ? n : null;
}

async function resolveImageId(imageUrl?: string) {
  if (!imageUrl) return null;
  const media = await getOrCreateMedia(imageUrl);
  return media.id;
}

async function withUniqueSkuGuard<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    if (err instanceof UniqueConstraintError) throw conflict("SKU นี้ถูกใช้แล้ว กรุณาเลือก SKU อื่น");
    throw err;
  }
}

export async function createProduct(input: unknown) {
  const data = parseInput(input);
  return withUniqueSkuGuard(async () => {
    const imageId = await resolveImageId(data.imageUrl);
    const product = await Product.create({
      sku: data.sku,
      status: data.status,
      nameTh: data.nameTh,
      nameEn: data.nameEn || null,
      descriptionTh: data.descriptionTh || null,
      descriptionEn: data.descriptionEn || null,
      imageId,
      categoryId: data.categoryId || null,
      price: parsePrice(data.price),
      featured: data.featured ?? false,
      bestSeller: data.bestSeller ?? false,
      seoTitleTh: data.seoTitle || null,
      seoDescTh: data.seoDesc || null,
      seoTitleEn: data.seoTitleEn || null,
      seoDescEn: data.seoDescEn || null,
      seoNoIndex: data.seoNoIndex ?? false,
    });
    return getProduct(product.id);
  });
}

export async function updateProduct(id: string, input: unknown) {
  const data = parseInput(input);
  const existing = await Product.findByPk(id);
  if (!existing) throw notFound("ไม่พบสินค้า");

  return withUniqueSkuGuard(async () => {
    const imageId = data.imageUrl ? await resolveImageId(data.imageUrl) : existing.imageId;
    await existing.update({
      sku: data.sku,
      status: data.status,
      nameTh: data.nameTh,
      nameEn: data.nameEn || null,
      descriptionTh: data.descriptionTh || null,
      descriptionEn: data.descriptionEn || null,
      imageId,
      categoryId: data.categoryId || null,
      price: parsePrice(data.price),
      featured: data.featured ?? existing.featured,
      bestSeller: data.bestSeller ?? existing.bestSeller,
      seoTitleTh: data.seoTitle || null,
      seoDescTh: data.seoDesc || null,
      seoTitleEn: data.seoTitleEn || null,
      seoDescEn: data.seoDescEn || null,
      seoNoIndex: data.seoNoIndex ?? false,
    });
    return getProduct(id);
  });
}

export async function deleteProduct(id: string) {
  const existing = await Product.findByPk(id);
  if (!existing) throw notFound("ไม่พบสินค้า");
  await existing.destroy();
}

export async function setProductStatus(id: string, status: "ACTIVE" | "DRAFT" | "ARCHIVED") {
  const existing = await Product.findByPk(id);
  if (!existing) throw notFound("ไม่พบสินค้า");
  await existing.update({ status });
  return getProduct(id);
}

export async function toggleProductFeatured(id: string, featured: boolean) {
  const existing = await Product.findByPk(id);
  if (!existing) throw notFound("ไม่พบสินค้า");
  await existing.update({ featured });
  return getProduct(id);
}

export async function toggleProductBestSeller(id: string, bestSeller: boolean) {
  const existing = await Product.findByPk(id);
  if (!existing) throw notFound("ไม่พบสินค้า");
  await existing.update({ bestSeller });
  return getProduct(id);
}
