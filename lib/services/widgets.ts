import { Widget, sequelize } from "@/lib/db/models/index";
import type { Widget as WidgetData } from "@/data/admin-widgets";

export async function listWidgets() {
  return Widget.findAll();
}

export async function saveWidgets(widgets: WidgetData[]) {
  await sequelize.transaction(async (t) => {
    await Promise.all(
      widgets.map((widget) =>
        Widget.update({ enabled: widget.enabled, link: widget.link || null }, { where: { id: widget.id }, transaction: t })
      )
    );
  });
  return listWidgets();
}
