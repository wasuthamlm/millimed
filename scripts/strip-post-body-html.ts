// One-off data cleanup: the legacy import stored raw sanitized HTML in
// posts.bodyTh (see scripts/import-legacy-site.ts), but the public article/
// news detail page renders bodyTh as plain text (whitespace-pre-line), so
// the leftover <p>/<span>/etc. tags show up literally on the page. This
// strips those tags out of every post's bodyTh, leaving plain text with
// paragraph/line breaks preserved. Safe to re-run — posts with no HTML tags
// are left untouched.
import "dotenv/config";
import { sequelize, Post } from "../lib/db/models/index";

const HAS_TAGS = /<[a-z][\s\S]*>/i;

function htmlToPlainText(html: string): string {
  let text = html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|li|h[1-6]|tr|blockquote)>/gi, "\n")
    .replace(/<li[^>]*>/gi, "- ")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#0?39;/gi, "'");

  const lines = text.split("\n").map((line) => line.replace(/[ \t]+/g, " ").trim());
  const collapsed: string[] = [];
  for (const line of lines) {
    if (line === "" && collapsed[collapsed.length - 1] === "") continue;
    collapsed.push(line);
  }
  return collapsed.join("\n").trim();
}

const DRY_RUN = process.argv.includes("--dry-run");

async function main() {
  const posts = await Post.findAll({ attributes: ["id", "slug", "bodyTh"] });
  let changed = 0;

  for (const post of posts) {
    const body = post.bodyTh;
    if (!body || !HAS_TAGS.test(body)) continue;
    const plain = htmlToPlainText(body);
    changed++;
    if (DRY_RUN) {
      console.log(`\n[would clean] ${post.slug}`);
      console.log(`  before: ${body.slice(0, 160).replace(/\n/g, "\\n")}${body.length > 160 ? "…" : ""}`);
      console.log(`  after:  ${plain.slice(0, 160).replace(/\n/g, "\\n")}${plain.length > 160 ? "…" : ""}`);
    } else {
      await post.update({ bodyTh: plain });
      console.log(`[cleaned] ${post.slug}`);
    }
  }

  console.log(`\n${DRY_RUN ? "Dry run: would clean" : "Done. Cleaned"} ${changed}/${posts.length} posts.`);
  await sequelize.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
