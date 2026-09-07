import "dotenv/config";
import bcrypt from "bcryptjs";
import {
  sequelize,
  User,
  ArticleCategory,
  ProductCategory,
  Product,
  Page,
  PageSection,
  NavLink,
  Banner,
  FooterColumn,
  FooterLink,
  FooterContact,
  FooterConfig,
  PopupConfig,
  Widget,
  SiteHeaderConfig,
  SiteBannerConfig,
  SiteSettings,
  GlobalTheme,
  AiSettings,
} from "./models/index";
import { getOrCreateMedia } from "../media";
import { navLinks, type NavLink as NavLinkData } from "../../data/nav";
import { products } from "../../data/products";

async function seedAdminUser() {
  const email = process.env.SEED_ADMIN_EMAIL || "admin@millimedthailand.com";
  const password = process.env.SEED_ADMIN_PASSWORD || "ChangeMe123!";
  const passwordHash = await bcrypt.hash(password, 12);

  const [user] = await User.findOrCreate({
    where: { email },
    defaults: { email, passwordHash, name: "Admin", role: "ADMIN" },
  });
  console.log(`Admin user ready: ${user.email}`);
}

async function seedNavLinks() {
  const count = await NavLink.count();
  if (count > 0) return;

  let order = 0;
  for (const link of navLinks as NavLinkData[]) {
    const parent = await NavLink.create({
      labelTh: link.label,
      href: link.href,
      order: order++,
      placement: "HEADER",
    });
    if (link.children) {
      let childOrder = 0;
      for (const child of link.children) {
        await NavLink.create({
          labelTh: child.label,
          href: child.href,
          order: childOrder++,
          placement: "HEADER",
          parentId: parent.id,
        });
      }
    }
  }
  console.log("Nav links seeded.");
}

async function seedFooter() {
  const columnDefs = [
    {
      title: "รู้จักเรา",
      links: [
        { label: "นโยบายและเป้าหมาย", href: "/about/policy" },
        { label: "วิสัยทัศน์องค์กร", href: "/about/vision" },
        { label: "คุณภาพที่ได้รับการรับรอง", href: "/about/quality-certification" },
        { label: "กลุ่มธุรกิจ", href: "/about/business-group" },
      ],
    },
    {
      title: "ธุรกิจ",
      links: [
        { label: "ผลิตภัณฑ์", href: "/products" },
        { label: "ข่าวสารและกิจกรรม", href: "/news" },
        { label: "ร่วมงานกับเรา", href: "/careers" },
      ],
    },
    {
      title: "กิจกรรม",
      links: [
        { label: "มิลลิเมดปันน้ำใจ", href: "/csr/sharing-love" },
        { label: "มิลลิเมดเพื่อการศึกษา", href: "/csr/education" },
        { label: "Kick off & Outing", href: "/internal-activities/kick-off-outing" },
      ],
    },
  ];

  const existingCount = await FooterColumn.count();
  if (existingCount === 0) {
    let order = 0;
    for (const col of columnDefs) {
      const column = await FooterColumn.create({ title: col.title, order: order++ });
      let linkOrder = 0;
      for (const link of col.links) {
        await FooterLink.create({ columnId: column.id, label: link.label, href: link.href, order: linkOrder++ });
      }
    }
    console.log("Footer columns seeded.");
  }

  await FooterContact.upsert({
    id: "singleton",
    phone: "02-XXX-XXXX",
    email: "info@millimedthailand.com",
    address: "กรุงเทพมหานคร ประเทศไทย",
    tagline: "Pass on Happiness",
    companyNameTh: "Millimed",
  });

  await FooterConfig.upsert({
    id: "singleton",
    bgColor: "#0d1a4a",
    textColor: "#ffffff",
    accentColor: "#f5b301",
    desktopColumns: 3,
  });

  console.log("Footer contact/config seeded.");
}

async function seedSiteSettings() {
  await SiteSettings.upsert({
    id: "singleton",
    siteNameTh: "Millimed",
    facebookUrl: "https://facebook.com",
    instagramUrl: "https://instagram.com",
    youtubeUrl: "https://youtube.com",
    tiktokUrl: "https://tiktok.com",
    lineUrl: "https://line.me",
  });

  await GlobalTheme.upsert({
    id: "singleton",
    fontHeader: "thai",
    fontBody: "thai",
    colorPrimary: "#16296b",
    colorPrimaryHover: "#0d1a4a",
    colorAccent: "#f5b301",
    colorBackground: "#ffffff",
    colorText: "#171717",
    buttonRadius: "9999px",
  });

  await SiteHeaderConfig.upsert({ id: "singleton" });
  await SiteBannerConfig.upsert({ id: "singleton" });
  await PopupConfig.upsert({ id: "singleton", enabled: false });
  await AiSettings.upsert({ id: "singleton", provider: "GEMINI" });

  console.log("Site settings / theme / header / banner / popup / AI settings seeded.");
}

async function seedWidgets() {
  const count = await Widget.count();
  if (count > 0) return;
  await Widget.bulkCreate([
    { key: "scroll-to-top", name: "ปุ่มเลื่อนขึ้นด้านบน", enabled: true },
    { key: "social-float", name: "ปุ่มลอย Line/Messenger", enabled: false },
  ]);
  console.log("Widgets seeded.");
}

async function seedProductCategories() {
  const count = await ProductCategory.count();
  if (count > 0) return new Map<string, string>();

  const defs = [
    { slug: "i-herb", nameTh: "I-HERB" },
    { slug: "hyatear", nameTh: "Hyatear" },
    { slug: "cysterine", nameTh: "Cysterine" },
  ];
  const map = new Map<string, string>();
  let order = 0;
  for (const def of defs) {
    const category = await ProductCategory.create({ nameTh: def.nameTh, slug: def.slug, order: order++ });
    map.set(def.slug, category.id);
  }
  console.log("Product categories seeded.");
  return map;
}

// Maps each hardcoded product's id to the brand category it belongs to.
const PRODUCT_CATEGORY_SLUG: Record<string, string> = {
  hyatear: "hyatear",
  "i-herb-eye-drop": "i-herb",
  "eye-mask": "i-herb",
  cysterine: "cysterine",
  "gentle-cleanser": "cysterine",
  "moisture-cream": "cysterine",
};

async function seedProducts(categoryMap: Map<string, string>) {
  const count = await Product.count();
  if (count > 0) return;

  for (const product of products) {
    const categorySlug = PRODUCT_CATEGORY_SLUG[product.id];
    const media = await getOrCreateMedia(product.image);
    await Product.create({
      sku: product.sku,
      nameTh: product.nameTh,
      descriptionTh: product.descriptionTh,
      status: "ACTIVE",
      categoryId: categorySlug ? categoryMap.get(categorySlug) : null,
      imageId: media.id,
    });
  }
  console.log("Products seeded.");
}

async function seedArticleCategories() {
  const count = await ArticleCategory.count();
  if (count > 0) return;

  const defs = [
    { slug: "eye-health", nameTh: "สุขภาพดวงตา" },
    { slug: "skin-beauty", nameTh: "ผิวพรรณและความงาม" },
    { slug: "manufacturing", nameTh: "มาตรฐานการผลิต" },
  ];
  let order = 0;
  for (const def of defs) {
    await ArticleCategory.create({ nameTh: def.nameTh, slug: def.slug, order: order++ });
  }
  console.log("Article categories seeded.");
}

async function seedBanners() {
  const count = await Banner.count();
  if (count > 0) return;

  const defs = [
    { titleTh: "Millimed Pass on Happiness", link: "/about", image: "/images/placeholder-banner-1.png" },
    { titleTh: "มาตรฐานการผลิตระดับสากล", link: "/about/quality-certification", image: "/images/placeholder-banner-2.png" },
    { titleTh: "ผลิตภัณฑ์คุณภาพเพื่อสุขภาพที่ดี", link: "/products", image: "/images/placeholder-banner-3.png" },
  ];
  let order = 0;
  for (const def of defs) {
    const media = await getOrCreateMedia(def.image);
    await Banner.create({ titleTh: def.titleTh, link: def.link, imageId: media.id, order: order++ });
  }
  console.log("Banners seeded.");
}

async function seedPages() {
  const [homePage] = await Page.findOrCreate({
    where: { slug: "home" },
    defaults: { slug: "home", titleTh: "หน้าแรก", status: "PUBLISHED" },
  });
  const homeSectionCount = await PageSection.count({ where: { pageId: homePage.id } });
  if (homeSectionCount === 0) {
    await PageSection.bulkCreate([
      { pageId: homePage.id, order: 0, type: "HERO_BANNERS", titleTh: "" },
      { pageId: homePage.id, order: 1, type: "LATEST_NEWS", titleTh: "ข่าวสารล่าสุด", itemsToShow: 3 },
      { pageId: homePage.id, order: 2, type: "ARTICLES", titleTh: "บทความน่ารู้", itemsToShow: 8, columns: 4 },
    ]);
    console.log("Home page sections seeded.");
  }

  // The 14 static placeholder routes + the "รู้จักเรา" landing, all "coming soon" for now.
  const placeholderPages: { slug: string; titleTh: string }[] = [
    { slug: "about", titleTh: "รู้จักเรา" },
    { slug: "about/policy", titleTh: "นโยบายและเป้าหมาย" },
    { slug: "about/vision", titleTh: "วิสัยทัศน์องค์กร" },
    { slug: "about/quality-certification", titleTh: "คุณภาพที่ได้รับการรับรอง" },
    { slug: "about/quality-assurance", titleTh: "ประกันคุณภาพการผลิต" },
    { slug: "about/business-group", titleTh: "กลุ่มธุรกิจ" },
    { slug: "advertisements/i-herb", titleTh: "I HERB" },
    { slug: "advertisements/hyatear", titleTh: "HYATEAR" },
    { slug: "advertisements/cysterine", titleTh: "CYSTERINE" },
    { slug: "csr/sharing-love", titleTh: "มิลลิเมดปันน้ำใจ" },
    { slug: "csr/education", titleTh: "มิลลิเมดเพื่อการศึกษา" },
    { slug: "internal-activities/kick-off-outing", titleTh: "Kick off & Outing" },
    { slug: "internal-activities/family", titleTh: "มิลลิเมดเพื่อพนักงานและครอบครัว" },
    { slug: "internal-activities/recreation", titleTh: "สันทนาการและอื่นๆ" },
    { slug: "careers", titleTh: "ร่วมงานกับเรา" },
  ];

  for (const def of placeholderPages) {
    const [page] = await Page.findOrCreate({
      where: { slug: def.slug },
      defaults: { slug: def.slug, titleTh: def.titleTh, status: "PUBLISHED" },
    });
    const sectionCount = await PageSection.count({ where: { pageId: page.id } });
    if (sectionCount === 0) {
      await PageSection.create({
        pageId: page.id,
        order: 0,
        type: "CUSTOM",
        titleTh: def.titleTh,
        bodyTh: "หน้านี้กำลังจะมาเร็ว ๆ นี้",
      });
    }
  }
  console.log("Placeholder pages seeded.");
}

async function main() {
  await sequelize.authenticate();

  await seedAdminUser();
  await seedNavLinks();
  await seedFooter();
  await seedSiteSettings();
  await seedWidgets();
  const productCategoryMap = await seedProductCategories();
  await seedProducts(productCategoryMap);
  await seedArticleCategories();
  await seedBanners();
  await seedPages();

  console.log("Seed complete.");
  await sequelize.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
