"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/require-admin";
import * as siteSettingsService from "@/lib/services/site-settings";
import type { SiteSettingsInput, GlobalThemeInput } from "@/data/admin-settings";

export async function saveSiteSettings(input: SiteSettingsInput) {
  await requireAdmin();
  await siteSettingsService.saveSiteSettings(input);
  revalidatePath("/admin/settings");
  revalidatePath("/", "layout");
}

export async function saveGlobalTheme(input: GlobalThemeInput) {
  await requireAdmin();
  await siteSettingsService.saveGlobalTheme(input);
  revalidatePath("/admin/settings");
  revalidatePath("/", "layout");
}
