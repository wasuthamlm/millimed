"use server";

import { revalidatePath } from "next/cache";
import { Widget, sequelize } from "@/lib/db/models/index";
import { requireAdmin } from "@/lib/require-admin";
import type { Widget as WidgetData } from "@/data/admin-widgets";

export async function saveWidgets(widgets: WidgetData[]) {
  await requireAdmin();

  await sequelize.transaction(async (t) => {
    await Promise.all(widgets.map((widget) => Widget.update({ enabled: widget.enabled, link: widget.link || null }, { where: { id: widget.id }, transaction: t })));
  });

  revalidatePath("/admin/site/widgets");
  revalidatePath("/", "layout");
}
