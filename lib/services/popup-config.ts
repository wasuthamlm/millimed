import { PopupConfig, Media } from "@/lib/db/models/index";
import type { PopupConfig as PopupConfigData } from "@/data/admin-popup";

export async function getPopupConfig() {
  return PopupConfig.findByPk("singleton");
}

export async function savePopupConfig(config: PopupConfigData) {
  let imageId: string | undefined;
  if (config.image) {
    const existing = await Media.findOne({ where: { url: config.image } });
    const media =
      existing ??
      (await Media.create({ url: config.image, filename: config.image.split("/").pop() ?? "popup.png", mimeType: "image/png", size: 0 }));
    imageId = media.id;
  }

  const data = {
    enabled: config.enabled,
    titleTh: config.titleTh,
    imageId,
    link: config.link,
    frequency: config.frequency,
    startDate: new Date(config.startDate),
    endDate: new Date(config.endDate),
  };

  const [row] = await PopupConfig.findOrCreate({ where: { id: "singleton" }, defaults: { id: "singleton", ...data } });
  await row.update(data);
  return row;
}
