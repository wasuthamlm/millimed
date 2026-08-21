"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/require-admin";
import * as widgetService from "@/lib/services/widgets";
import type { Widget as WidgetData } from "@/data/admin-widgets";

export async function saveWidgets(widgets: WidgetData[]) {
  await requireAdmin();
  await widgetService.saveWidgets(widgets);
  revalidatePath("/admin/site/widgets");
  revalidatePath("/", "layout");
}
