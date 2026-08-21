"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/require-admin";
import { ServiceError } from "@/lib/services/errors";
import * as productCategoryService from "@/lib/services/product-categories";
import type { ProductCategoryInput } from "@/lib/services/product-categories";

function revalidateAll() {
  revalidatePath("/admin/products/categories");
  revalidatePath("/admin/products");
  revalidatePath("/products");
}

async function run(fn: () => Promise<unknown>): Promise<{ error?: string }> {
  try {
    await fn();
    revalidateAll();
    return {};
  } catch (err) {
    if (err instanceof ServiceError) return { error: err.message };
    throw err;
  }
}

export async function createProductCategory(input: ProductCategoryInput) {
  await requireAdmin();
  return run(() => productCategoryService.createProductCategory(input));
}

export async function updateProductCategory(id: string, input: ProductCategoryInput) {
  await requireAdmin();
  return run(() => productCategoryService.updateProductCategory(id, input));
}

export async function deleteProductCategory(id: string) {
  await requireAdmin();
  return run(() => productCategoryService.deleteProductCategory(id));
}

export async function toggleProductCategory(id: string, active: boolean) {
  await requireAdmin();
  return run(() => productCategoryService.toggleProductCategory(id, active));
}

export async function reorderProductCategories(ids: string[]) {
  await requireAdmin();
  return run(() => productCategoryService.reorderProductCategories(ids));
}
