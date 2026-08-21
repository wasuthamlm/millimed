"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/require-admin";
import { ServiceError } from "@/lib/services/errors";
import * as pageService from "@/lib/services/pages";
import type { PageInput, PageSeoInput } from "@/lib/services/pages";

export type PageFormInput = PageInput;
export type { PageSeoInput };
export type PageActionResult = { error: string } | { error?: undefined; slug: string };

function revalidateAll() {
  revalidatePath("/admin/pages");
  revalidatePath("/", "layout");
}

export async function createPage(input: PageFormInput): Promise<PageActionResult> {
  await requireAdmin();
  try {
    const page = await pageService.createPage(input);
    revalidateAll();
    return { slug: page.slug };
  } catch (err) {
    if (err instanceof ServiceError) return { error: err.message };
    throw err;
  }
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

export async function setPageStatus(id: string, status: "DRAFT" | "PUBLISHED"): Promise<{ error?: string }> {
  await requireAdmin();
  return run(() => pageService.setPageStatus(id, status));
}

export async function setPageSeo(id: string, input: PageSeoInput): Promise<{ error?: string }> {
  await requireAdmin();
  return run(() => pageService.setPageSeo(id, input));
}

export async function archivePages(ids: string[]): Promise<{ error?: string }> {
  await requireAdmin();
  return run(() => pageService.archivePages(ids));
}

export async function restorePages(ids: string[]): Promise<{ error?: string }> {
  await requireAdmin();
  return run(() => pageService.restorePages(ids));
}

export async function deletePage(id: string): Promise<{ error?: string }> {
  await requireAdmin();
  return run(() => pageService.deletePage(id));
}
