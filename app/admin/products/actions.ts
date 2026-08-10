"use server";

import { z } from "zod";
import { UniqueConstraintError } from "sequelize";
import { revalidatePath } from "next/cache";
import { Product } from "@/lib/db/models/index";
import { requireAdmin } from "@/lib/require-admin";
import { getOrCreateMedia } from "@/lib/media";

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

export type ProductFormInput = z.infer<typeof productSchema>;
export type ProductActionResult = { error: string } | { error?: undefined; id: string };

function revalidateAll() {
  revalidatePath("/admin/products");
  revalidatePath("/admin");
  revalidatePath("/products");
}

async function resolveImageId(imageUrl?: string) {
  if (!imageUrl) return null;
  const media = await getOrCreateMedia(imageUrl);
  return media.id;
}

function parsePrice(price?: string): number | null {
  if (!price) return null;
  const n = Number(price);
  return Number.isFinite(n) ? n : null;
}

export async function createProduct(input: ProductFormInput): Promise<ProductActionResult> {
  await requireAdmin();

  const parsed = productSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง" };
  }
  const data = parsed.data;

  try {
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

    revalidateAll();
    return { id: product.id };
  } catch (err) {
    if (err instanceof UniqueConstraintError) {
      return { error: "SKU นี้ถูกใช้แล้ว กรุณาเลือก SKU อื่น" };
    }
    throw err;
  }
}

export async function updateProduct(id: string, input: ProductFormInput): Promise<ProductActionResult> {
  await requireAdmin();

  const parsed = productSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง" };
  }
  const data = parsed.data;

  const existing = await Product.findByPk(id);
  if (!existing) {
    return { error: "ไม่พบสินค้า" };
  }

  try {
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

    revalidateAll();
    return { id: existing.id };
  } catch (err) {
    if (err instanceof UniqueConstraintError) {
      return { error: "SKU นี้ถูกใช้แล้ว กรุณาเลือก SKU อื่น" };
    }
    throw err;
  }
}

export async function deleteProduct(id: string): Promise<{ error?: string }> {
  await requireAdmin();

  const existing = await Product.findByPk(id);
  if (!existing) return { error: "ไม่พบสินค้า" };

  await existing.destroy();
  revalidateAll();
  return {};
}

export async function setProductStatus(id: string, status: "ACTIVE" | "DRAFT" | "ARCHIVED") {
  await requireAdmin();
  await Product.update({ status }, { where: { id } });
  revalidateAll();
  return {};
}

export async function toggleProductFeatured(id: string, featured: boolean) {
  await requireAdmin();
  await Product.update({ featured }, { where: { id } });
  revalidateAll();
  return {};
}

export async function toggleProductBestSeller(id: string, bestSeller: boolean) {
  await requireAdmin();
  await Product.update({ bestSeller }, { where: { id } });
  revalidateAll();
  return {};
}
