"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/require-admin";
import { ServiceError } from "@/lib/services/errors";
import * as articleCategoryService from "@/lib/services/article-categories";
import type { ArticleCategoryInput } from "@/lib/services/article-categories";

function revalidateAll() {
  revalidatePath("/admin/articles/categories");
  revalidatePath("/admin/articles");
  revalidatePath("/articles");
  revalidatePath("/news");
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

export async function createArticleCategory(input: ArticleCategoryInput) {
  await requireAdmin();
  return run(() => articleCategoryService.createArticleCategory(input));
}

export async function updateArticleCategory(id: string, input: ArticleCategoryInput) {
  await requireAdmin();
  return run(() => articleCategoryService.updateArticleCategory(id, input));
}

export async function deleteArticleCategory(id: string) {
  await requireAdmin();
  return run(() => articleCategoryService.deleteArticleCategory(id));
}

export async function toggleArticleCategory(id: string, active: boolean) {
  await requireAdmin();
  return run(() => articleCategoryService.toggleArticleCategory(id, active));
}

export async function reorderArticleCategories(ids: string[]) {
  await requireAdmin();
  return run(() => articleCategoryService.reorderArticleCategories(ids));
}
