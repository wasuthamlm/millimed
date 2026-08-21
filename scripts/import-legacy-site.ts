import "dotenv/config";
import * as cheerio from "cheerio";
import sanitizeHtml from "sanitize-html";
import { sequelize, Post, Page, PageSection, ArticleCategory, FooterContact, Media } from "../lib/db/models/index";
import { uploadToStorage } from "../lib/media/cloudinary-storage";
import { slugify } from "../lib/slugify";

const SITEMAP_URL = "https://millimedthailand.com/sitemap.xml";
const USER_AGENT = "Mozilla/5.0 (compatible; MillimedLegacyImporter/1.0)";
const REQUEST_DELAY_MS = 350;
const FETCH_TIMEOUT_MS = 20000;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function shortHash(input: string): string {
  let h = 5381;
  for (let i = 0; i < input.length; i++) h = (h * 33) ^ input.charCodeAt(i);
  return (h >>> 0).toString(36);
}

function stripTags(html: string): string {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

async function fetchText(url: string): Promise<string> {
  const res = await fetch(url, { headers: { "User-Agent": USER_AGENT }, signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.text();
}

// ---------------------------------------------------------------------------
// Sitemap
// ---------------------------------------------------------------------------

interface SitemapEntry {
  url: string;
  path: string; // decoded pathname, no leading/trailing slash
  lastmod: string | null;
}

async function getSitemapEntries(): Promise<SitemapEntry[]> {
  const xml = await fetchText(SITEMAP_URL);
  const $ = cheerio.load(xml, { xmlMode: true });
  const entries: SitemapEntry[] = [];
  $("url").each((_, el) => {
    const loc = $(el).find("loc").text().trim();
    const lastmod = $(el).find("lastmod").text().trim() || null;
    if (!loc) return;
    const parsed = new URL(loc);
    const path = decodeURIComponent(parsed.pathname.replace(/^\/+|\/+$/g, ""));
    entries.push({ url: loc, path, lastmod });
  });
  return entries;
}

// ---------------------------------------------------------------------------
// Classification
// ---------------------------------------------------------------------------

type PostTarget = { kind: "post"; postKind: "NEWS" | "ARTICLE"; categorySlug?: "csr" | "internal-activities" };
type Target = { kind: "page"; slug: string } | { kind: "contact" } | PostTarget | { kind: "skip"; reason: string };
type KnownTarget = { kind: "page"; slug: string } | { kind: "contact" };

// Small fixed set of "structural" pages already scaffolded as placeholder
// Page rows in lib/db/seed.ts — mapped 1:1 from the nav crawl done during
// planning. Everything else (News/CSR/Education/Internal-activity posts)
// is classified dynamically below via each page's breadcrumb.
const KNOWN_PAGES: Record<string, KnownTarget> = {
  "14819487/หน้าแรก-": { kind: "page", slug: "about" },
  "14843542/นโยบายและเป้าหมาย": { kind: "page", slug: "about/policy" },
  "14856967/วิสัยทัศน์องค์กร": { kind: "page", slug: "about/vision" },
  "14857064/คุณภาพที่ได้รับการรับรอง": { kind: "page", slug: "about/quality-certification" },
  "14843540/ประกันคุณภาพการผลิต": { kind: "page", slug: "about/quality-assurance" },
  "14856965/กลุ่มธุรกิจ": { kind: "page", slug: "about/business-group" },
  "ผลิตภัณฑ์": { kind: "page", slug: "about/products-overview" },
  "i-herb": { kind: "page", slug: "advertisements/i-herb" },
  hyatear: { kind: "page", slug: "advertisements/hyatear" },
  cysterine: { kind: "page", slug: "advertisements/cysterine" },
  "14856970/ร่วมงานกับเรา": { kind: "page", slug: "careers" },
  "14819490/ติดต่อเรา": { kind: "contact" },
};

// Pure navigation/listing pages with no unique content of their own —
// their children carry the real content and are picked up individually.
const SKIP_PATHS = new Set(["", "member", "คลังข่าวย้อนหลัง", "ข่าวสารและกิจกรรม", "กิจกรรมเพื่อสังคม", "กิจกรรมภายใน"]);

function classifyByBreadcrumb(breadcrumb: string): Target {
  if (breadcrumb.includes("ข่าวสารและกิจกรรม")) return { kind: "post", postKind: "NEWS" };
  if (breadcrumb.includes("กิจกรรมภายใน")) return { kind: "post", postKind: "ARTICLE", categorySlug: "internal-activities" };
  if (breadcrumb.includes("กิจกรรมเพื่อสังคม") || breadcrumb.includes("การศึกษา")) {
    return { kind: "post", postKind: "ARTICLE", categorySlug: "csr" };
  }
  return { kind: "skip", reason: `unrecognized breadcrumb "${breadcrumb}"` };
}

// ---------------------------------------------------------------------------
// Page parsing (shared ReadyPlanet markup, confirmed across sample pages)
// ---------------------------------------------------------------------------

interface ParsedPage {
  title: string;
  breadcrumb: string;
  bodyHtml: string;
  galleryUrls: string[];
}

function parsePage(html: string, pageUrl: string): ParsedPage {
  const $ = cheerio.load(html);
  const title = $("#content h1[id^='title-'] [data-placeholder]").first().text().trim() || $("title").first().text().trim();
  const breadcrumb = $(".breadcrumb").first().text().replace(/\s+/g, " ").trim();
  const bodyHtml = $(".descriptionContainer .description").first().html() ?? "";

  const galleryUrls: string[] = [];
  const seen = new Set<string>();
  $(".images-area .image-wrapper a[href]").each((_, el) => {
    const href = $(el).attr("href");
    if (!href || href === "#") return;
    // The .images-area gallery is sometimes repurposed to link to a video
    // (e.g. brand/advertisement pages link out to YouTube) instead of an
    // image — only accept hrefs that actually look like image files.
    if (!/\.(jpe?g|png|gif|webp)$/i.test(href)) return;
    const abs = new URL(href, pageUrl).toString();
    if (!seen.has(abs)) {
      seen.add(abs);
      galleryUrls.push(abs);
    }
  });

  return { title, breadcrumb, bodyHtml, galleryUrls };
}

// ---------------------------------------------------------------------------
// Media re-hosting: download the legacy image, push it through the same
// Cloudinary pipeline the admin media uploader uses, register a Media row.
// ---------------------------------------------------------------------------

const mediaCache = new Map<string, Media>();

async function reuploadImage(legacyUrl: string): Promise<Media | null> {
  const cached = mediaCache.get(legacyUrl);
  if (cached) return cached;

  // Cloudinary re-encodes the public_id when building secure_url; a Thai
  // filename that's already percent-encoded (common in scraped src/href
  // attributes) gets double-encoded and can blow past the 255-char url
  // column. Use a short deterministic hash instead — stable across runs
  // (same legacy URL -> same filename -> same idempotency lookup) and
  // always ASCII-short regardless of the original filename.
  const rawBasename = legacyUrl.split("/").pop()?.split("?")[0] || "";
  const ext = (rawBasename.match(/\.[a-zA-Z0-9]{1,5}$/)?.[0] || ".jpg").toLowerCase();
  const legacyFilename = `legacy-${shortHash(legacyUrl)}${ext}`;

  const existing = await Media.findOne({ where: { filename: legacyFilename } });
  if (existing) {
    mediaCache.set(legacyUrl, existing);
    return existing;
  }

  let res: Response;
  try {
    res = await fetch(legacyUrl, { headers: { "User-Agent": USER_AGENT }, signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
  } catch (err) {
    console.warn(`    ! image download failed: ${legacyUrl} (${(err as Error).message})`);
    return null;
  }

  const contentType = res.headers.get("content-type") || "image/jpeg";
  if (!contentType.startsWith("image/")) {
    console.warn(`    ! skipped non-image response (${contentType}): ${legacyUrl}`);
    return null;
  }
  const buffer = Buffer.from(await res.arrayBuffer());

  let url: string;
  try {
    url = await uploadToStorage(legacyFilename, buffer, contentType);
  } catch (err) {
    console.warn(`    ! cloudinary upload failed: ${legacyUrl} (${(err as Error).message})`);
    return null;
  }

  const media = await Media.create({ url, filename: legacyFilename, mimeType: contentType, size: buffer.length });
  mediaCache.set(legacyUrl, media);
  await sleep(REQUEST_DELAY_MS);
  return media;
}

async function rehostGalleryImages(urls: string[]): Promise<Media[]> {
  const results: Media[] = [];
  for (const url of urls) {
    const media = await reuploadImage(url);
    if (media) results.push(media);
  }
  return results;
}

async function rehostBodyImages(bodyHtml: string, pageUrl: string): Promise<string> {
  if (!bodyHtml) return bodyHtml;
  const $ = cheerio.load(bodyHtml, {}, false);
  const imgs = $("img").toArray();
  for (const img of imgs) {
    const el = $(img);
    const src = el.attr("data-src") || el.attr("src");
    if (!src || src.includes("1x1.png") || src.includes("no-image.jpg")) {
      el.remove();
      continue;
    }
    const abs = new URL(src, pageUrl).toString();
    const media = await reuploadImage(abs);
    if (media) {
      el.attr("src", media.url);
      el.removeAttr("data-src");
      el.removeAttr("srcset");
    } else {
      el.remove();
    }
  }
  return $.html();
}

const SANITIZE_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: ["p", "br", "strong", "b", "em", "i", "u", "s", "span", "a", "ul", "ol", "li", "h2", "h3", "h4", "blockquote", "img", "table", "thead", "tbody", "tr", "td", "th"],
  allowedAttributes: {
    a: ["href", "target", "rel"],
    img: ["src", "alt", "width", "height"],
  },
  allowedSchemes: ["http", "https"],
  transformTags: {
    a: sanitizeHtml.simpleTransform("a", { rel: "noopener noreferrer", target: "_blank" }),
  },
};

// ---------------------------------------------------------------------------
// DB upserts
// ---------------------------------------------------------------------------

async function ensureArticleCategory(slug: string, nameTh: string): Promise<string> {
  const [category] = await ArticleCategory.findOrCreate({ where: { slug }, defaults: { slug, nameTh } });
  return category.id;
}

// The DB may already contain hand-curated legacy posts from a prior import
// (different slug/title convention, e.g. legacy "มหกรรมสมุนไพรแห่งชาติ ครั้งที่
// 23" became "I-HERB ร่วมงานมหกรรมสมุนไพรแห่งชาติ ครั้งที่ 23"). There's no
// shared key to join on, so fall back to substring matching on whitespace-
// stripped titles — covers "curated title wraps the original" in either
// direction, which is the pattern observed in the existing data.
function normalizeForMatch(s: string): string {
  return s.replace(/\s+/g, "").toLowerCase();
}

function findExistingMatch(title: string, existing: { slug: string; titleTh: string }[]): string | null {
  const n = normalizeForMatch(title);
  if (!n) return null;
  for (const post of existing) {
    const en = normalizeForMatch(post.titleTh);
    if (en && (n.includes(en) || en.includes(n))) return post.slug;
  }
  return null;
}

function nextCsrSlug(usedNumbers: Set<number>): string {
  let n = 1;
  while (usedNumbers.has(n)) n++;
  usedNumbers.add(n);
  return `csr-sharing-love-${String(n).padStart(2, "0")}`;
}

function deriveSlug(path: string, usedSlugs: Set<string>): string {
  const numericMatch = path.match(/^(\d+)\//);
  let base = numericMatch ? numericMatch[1] : slugify(path.split("/").pop() || path);
  if (!base) base = `legacy-${Math.random().toString(36).slice(2, 8)}`;
  let slug = base;
  let i = 2;
  while (usedSlugs.has(slug)) slug = `${base}-${i++}`;
  usedSlugs.add(slug);
  return slug;
}

async function upsertPost(params: {
  slug: string;
  postKind: "NEWS" | "ARTICLE";
  categoryId: string | null;
  title: string;
  bodyHtml: string;
  publishedAt: Date;
  coverMedia: Media | null;
  galleryMedia: Media[];
}): Promise<"created" | "updated"> {
  const attrs = {
    kind: params.postKind,
    slug: params.slug,
    status: "PUBLISHED" as const,
    titleTh: (params.title || "(ไม่มีชื่อเรื่อง)").slice(0, 250),
    excerptTh: stripTags(params.bodyHtml).slice(0, 200) || null,
    bodyTh: params.bodyHtml,
    categoryId: params.categoryId,
    publishedAt: params.publishedAt,
    coverImageId: params.coverMedia?.id ?? null,
    galleryImageIds: params.galleryMedia.map((m) => m.id),
  };

  const existing = await Post.findOne({ where: { slug: params.slug } });
  if (existing) {
    await existing.update(attrs);
    return "updated";
  }
  await Post.create(attrs);
  return "created";
}

async function upsertPage(slug: string, rawTitle: string, bodyHtml: string | undefined): Promise<"created" | "updated"> {
  const title = rawTitle.slice(0, 250);
  const [page, created] = await Page.findOrCreate({
    where: { slug },
    defaults: { slug, titleTh: title || slug, status: "PUBLISHED" },
  });
  if (!created) await page.update({ titleTh: title || page.titleTh, status: "PUBLISHED" });

  const sections = await PageSection.findAll({ where: { pageId: page.id }, order: [["order", "ASC"]] });
  const customSection = sections.find((s) => s.type === "CUSTOM") ?? sections[0];
  if (customSection) {
    await customSection.update({
      type: "CUSTOM",
      titleTh: title || customSection.titleTh,
      bodyTh: bodyHtml !== undefined ? bodyHtml : customSection.bodyTh,
    });
  } else if (bodyHtml !== undefined) {
    await PageSection.create({ pageId: page.id, order: 0, type: "CUSTOM", titleTh: title, bodyTh: bodyHtml });
  }
  return created ? "created" : "updated";
}

async function updateContact(bodyText: string): Promise<void> {
  const phoneMatch = bodyText.match(/0[\d\- ]{7,}\d/);
  const emailMatch = bodyText.match(/[\w.+-]+@[\w-]+\.[\w.-]+/);
  const patch: Record<string, string> = { id: "singleton" };
  if (phoneMatch) patch.phone = phoneMatch[0].replace(/\s+/g, " ").trim();
  if (emailMatch) patch.email = emailMatch[0];
  if (bodyText) patch.address = bodyText.slice(0, 800).trim();
  await FooterContact.upsert(patch as never);
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  await sequelize.authenticate();
  console.log("DB connection OK.\n");

  let entries = await getSitemapEntries();
  console.log(`Sitemap: ${entries.length} URLs\n`);

  const limit = Number(process.env.IMPORT_LIMIT);
  if (limit > 0) {
    entries = entries.slice(0, limit);
    console.log(`IMPORT_LIMIT set — processing only the first ${entries.length} URLs.\n`);
  }

  const categoryIds: Record<"csr" | "internal-activities", string> = {
    csr: await ensureArticleCategory("csr", "กิจกรรมเพื่อสังคม"),
    "internal-activities": await ensureArticleCategory("internal-activities", "กิจกรรมภายใน"),
  };

  const existingPosts = (await Post.findAll({ attributes: ["slug", "titleTh"] })).map((p) => ({ slug: p.slug, titleTh: p.titleTh }));
  const usedSlugs = new Set<string>(existingPosts.map((p) => p.slug));
  const usedCsrNumbers = new Set<number>(
    existingPosts
      .map((p) => p.slug.match(/^csr-sharing-love-(\d+)$/)?.[1])
      .filter((n): n is string => !!n)
      .map((n) => Number(n))
  );
  console.log(`Existing posts: ${existingPosts.length} (title-matching will skip likely-duplicate News/CSR/Internal items)\n`);

  const summary = { created: 0, updated: 0, skipped: 0, failed: 0 };
  const failedUrls: string[] = [];
  const skippedNotes: string[] = [];

  for (const entry of entries) {
    try {
      const known = KNOWN_PAGES[entry.path];
      if (known) {
        const html = await fetchText(entry.url);
        const parsed = parsePage(html, entry.url);
        const bodyRehosted = await rehostBodyImages(parsed.bodyHtml, entry.url);
        const bodySanitized = sanitizeHtml(bodyRehosted, SANITIZE_OPTIONS);
        const hasRealContent = stripTags(bodySanitized).length >= 15 || parsed.galleryUrls.length > 0;
        if (!hasRealContent) console.warn(`    ! near-empty body for known page ${entry.path} — leaving existing placeholder in place`);

        if (known.kind === "contact") {
          if (hasRealContent) await updateContact(stripTags(bodySanitized));
          summary.updated++;
          console.log(`[contact] ${hasRealContent ? "updated" : "skipped (empty)"} — ${entry.url}`);
        } else {
          const result = hasRealContent
            ? await upsertPage(known.slug, parsed.title, bodySanitized)
            : await upsertPage(known.slug, parsed.title, undefined);
          summary[result]++;
          console.log(`[page] ${result} ${known.slug} — ${parsed.title}`);
        }
        await sleep(REQUEST_DELAY_MS);
        continue;
      }

      if (SKIP_PATHS.has(entry.path)) {
        summary.skipped++;
        skippedNotes.push(`${entry.url} (index/listing page)`);
        continue;
      }

      const html = await fetchText(entry.url);
      const parsed = parsePage(html, entry.url);
      const target = classifyByBreadcrumb(parsed.breadcrumb);

      if (target.kind !== "post") {
        summary.skipped++;
        skippedNotes.push(`${entry.url} (${target.kind === "skip" ? target.reason : target.kind})`);
        await sleep(REQUEST_DELAY_MS);
        continue;
      }

      const existingMatch = findExistingMatch(parsed.title, existingPosts);
      if (existingMatch) {
        summary.skipped++;
        skippedNotes.push(`${entry.url} (likely already imported as post "${existingMatch}")`);
        await sleep(REQUEST_DELAY_MS);
        continue;
      }

      const bodyRehosted = await rehostBodyImages(parsed.bodyHtml, entry.url);
      const bodySanitized = sanitizeHtml(bodyRehosted, SANITIZE_OPTIONS);

      if (stripTags(bodySanitized).length < 20 && parsed.galleryUrls.length === 0) {
        summary.skipped++;
        skippedNotes.push(`${entry.url} (empty content, likely a listing/landing page)`);
        await sleep(REQUEST_DELAY_MS);
        continue;
      }

      const galleryMedia = await rehostGalleryImages(parsed.galleryUrls);
      const [coverMedia, ...restMedia] = galleryMedia;
      // CSR articles continue the existing "csr-sharing-love-NN" convention
      // from the prior partial import; everything else uses the numeric-ID
      // derived slug.
      const slug = target.categorySlug === "csr" ? nextCsrSlug(usedCsrNumbers) : deriveSlug(entry.path, usedSlugs);
      usedSlugs.add(slug);

      const result = await upsertPost({
        slug,
        postKind: target.postKind,
        categoryId: target.postKind === "ARTICLE" ? categoryIds[target.categorySlug!] : null,
        title: parsed.title,
        bodyHtml: bodySanitized,
        publishedAt: entry.lastmod ? new Date(entry.lastmod) : new Date(),
        coverMedia: coverMedia ?? null,
        galleryMedia: restMedia,
      });
      summary[result]++;
      existingPosts.push({ slug, titleTh: parsed.title });
      console.log(`[post:${target.postKind}] ${result} ${slug} — ${parsed.title}`);

      await sleep(REQUEST_DELAY_MS);
    } catch (err) {
      summary.failed++;
      failedUrls.push(entry.url);
      console.error(`! failed: ${entry.url}: ${(err as Error).message}`);
    }
  }

  console.log("\n--- Summary ---");
  console.log(summary);
  if (skippedNotes.length) {
    console.log(`\nSkipped (${skippedNotes.length}):`);
    skippedNotes.forEach((n) => console.log(`  ${n}`));
  }
  if (failedUrls.length) {
    console.log(`\nFailed (${failedUrls.length}):`);
    failedUrls.forEach((u) => console.log(`  ${u}`));
  }

  await sequelize.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
