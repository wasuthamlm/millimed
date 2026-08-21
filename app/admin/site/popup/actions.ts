"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/require-admin";
import * as popupConfigService from "@/lib/services/popup-config";
import type { PopupConfig as PopupConfigData } from "@/data/admin-popup";

export async function savePopupConfig(config: PopupConfigData) {
  await requireAdmin();
  await popupConfigService.savePopupConfig(config);
  revalidatePath("/admin/site/popup");
  revalidatePath("/", "layout");
}
