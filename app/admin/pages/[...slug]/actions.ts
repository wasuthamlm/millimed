"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/require-admin";
import { ServiceError } from "@/lib/services/errors";
import * as pageSectionService from "@/lib/services/page-sections";
import type { PageSectionInput } from "@/lib/services/page-sections";

export type { PageSectionInput };

export async function saveSections(pageId: string, sections: PageSectionInput[]): Promise<{ error?: string }> {
  await requireAdmin();

  try {
    const page = await pageSectionService.saveSections(pageId, sections);
    revalidatePath(`/admin/pages/${page.slug}`);
    revalidatePath("/", "layout");
    return {};
  } catch (err) {
    if (err instanceof ServiceError) return { error: err.message };
    throw err;
  }
}
