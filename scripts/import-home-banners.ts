import "dotenv/config";
import * as cheerio from "cheerio";
import { sequelize, Banner, Media } from "../lib/db/models/index";
import { uploadToStorage } from "../lib/media/cloudinary-storage";

const HOME_URL = "https://www.millimedthailand.com/";
const USER_AGENT = "Mozilla/5.0 (compatible; MillimedLegacyImporter/1.0)";

function shortHash(input: string): string {
  let h = 5381;
  for (let i = 0; i < input.length; i++) h = (h * 33) ^ input.charCodeAt(i);
  return (h >>> 0).toString(36);
}

async function main() {
  await sequelize.authenticate();

  const html = await (await fetch(HOME_URL, { headers: { "User-Agent": USER_AGENT } })).text();
  const $ = cheerio.load(html);

  const items: { src: string; link: string | null }[] = [];
  $(".banner-section-item").each((_, el) => {
    const $el = $(el);
    const img = $el.find("img").first();
    const src = img.attr("data-src") || img.attr("src");
    if (!src) return;
    const link = $el.find("a.banner-section-link").attr("href") || null;
    items.push({ src: new URL(src, HOME_URL).toString(), link });
  });

  console.log(`Found ${items.length} banner slides on legacy homepage.`);
  if (items.length === 0) {
    console.log("Nothing to do.");
    await sequelize.close();
    return;
  }

  const titles = [
    "I-Herb",
    "มิลลิเมด",
    "Amogin",
    "มิลลิเมด",
    "มิลลิเมด",
    "Millimed BFS Health Connect",
    "Eye Care Corner",
    "มิลลิเมด",
  ];

  const created: string[] = [];
  let order = 0;
  for (const item of items) {
    const res = await fetch(item.src, { headers: { "User-Agent": USER_AGENT } });
    if (!res.ok) {
      console.warn(`  ! failed to download ${item.src}: HTTP ${res.status}`);
      continue;
    }
    const contentType = res.headers.get("content-type") || "image/jpeg";
    const buffer = Buffer.from(await res.arrayBuffer());
    const ext = (item.src.match(/\.[a-zA-Z0-9]{1,5}$/)?.[0] || ".jpg").toLowerCase();
    const filename = `home-banner-${shortHash(item.src)}${ext}`;

    let media = await Media.findOne({ where: { filename } });
    if (!media) {
      const url = await uploadToStorage(filename, buffer, contentType);
      media = await Media.create({ url, filename, mimeType: contentType, size: buffer.length });
    }

    const title = titles[order] ?? "มิลลิเมด";
    const existingBanner = await Banner.findOne({ where: { imageId: media.id } });
    if (existingBanner) {
      await existingBanner.update({ titleTh: title, link: item.link, order, active: true });
    } else {
      await Banner.create({ titleTh: title, imageId: media.id, link: item.link, order, active: true });
    }
    created.push(`${title} (${item.link ?? "no link"})`);
    order++;
  }

  // Deactivate the old seed placeholder banners now that real ones exist.
  const placeholderMedia = await Media.findAll({
    where: { url: ["/images/placeholder-banner-1.png", "/images/placeholder-banner-2.png", "/images/placeholder-banner-3.png"] },
  });
  const placeholderIds = placeholderMedia.map((m) => m.id);
  if (placeholderIds.length > 0) {
    const [count] = await Banner.update({ active: false }, { where: { imageId: placeholderIds } });
    console.log(`Deactivated ${count} placeholder banner(s).`);
  }

  console.log(`\nCreated ${created.length} banner(s):`);
  created.forEach((c) => console.log(`  - ${c}`));

  await sequelize.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
