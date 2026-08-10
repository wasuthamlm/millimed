import { Media } from "@/lib/db/models/index";

export async function getOrCreateMedia(url: string) {
  const existing = await Media.findOne({ where: { url } });
  if (existing) return existing;
  return Media.create({ url, filename: url.split("/").pop() ?? "media", mimeType: "image/png", size: 0 });
}
