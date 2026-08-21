"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/require-admin";
import { ServiceError } from "@/lib/services/errors";
import * as productService from "@/lib/services/products";
import type { ProductInput } from "@/lib/services/products";

export type ProductFormInput = ProductInput;
export type ProductActionResult = { error: string } | { error?: undefined; id: string };

function revalidateAll() {
  revalidatePath("/admin/products");
  revalidatePath("/admin");
  revalidatePath("/products");
}

async function run(fn: () => Promise<{ id: string }>): Promise<ProductActionResult> {
  try {
    const result = await fn();
    revalidateAll();
    return { id: result.id };
  } catch (err) {
    if (err instanceof ServiceError) return { error: err.message };
    throw err;
  }
}

export async function createProduct(input: ProductFormInput): Promise<ProductActionResult> {
  await requireAdmin();
  return run(() => productService.createProduct(input));
}

export async function updateProduct(id: string, input: ProductFormInput): Promise<ProductActionResult> {
  await requireAdmin();
  return run(() => productService.updateProduct(id, input));
}

export async function deleteProduct(id: string): Promise<{ error?: string }> {
  await requireAdmin();
  try {
    await productService.deleteProduct(id);
    revalidateAll();
    return {};
  } catch (err) {
    if (err instanceof ServiceError) return { error: err.message };
    throw err;
  }
}

export async function setProductStatus(id: string, status: "ACTIVE" | "DRAFT" | "ARCHIVED") {
  await requireAdmin();
  await productService.setProductStatus(id, status);
  revalidateAll();
  return {};
}

export async function toggleProductFeatured(id: string, featured: boolean) {
  await requireAdmin();
  await productService.toggleProductFeatured(id, featured);
  revalidateAll();
  return {};
}

export async function toggleProductBestSeller(id: string, bestSeller: boolean) {
  await requireAdmin();
  await productService.toggleProductBestSeller(id, bestSeller);
  revalidateAll();
  return {};
}
