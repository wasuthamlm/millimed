import { Widget } from "@/lib/db/models/index";

/** Whether a given Widget row (managed at /admin/site/widgets) is enabled. */
export async function isWidgetEnabled(key: string): Promise<boolean> {
  const row = await Widget.findOne({ where: { key } });
  return row?.enabled === true;
}
