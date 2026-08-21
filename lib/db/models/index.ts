import { sequelize } from "@/lib/db/sequelize";
import { User } from "./User";
import { ArticleCategory } from "./ArticleCategory";
import { Media } from "./Media";
import { MediaFolder } from "./MediaFolder";
import { Post } from "./Post";
import { ProductCategory } from "./ProductCategory";
import { Product } from "./Product";
import { Page } from "./Page";
import { PageSection } from "./PageSection";
import { NavLink } from "./NavLink";
import { Banner } from "./Banner";
import { FooterColumn } from "./FooterColumn";
import { FooterLink } from "./FooterLink";
import { FooterContact } from "./FooterContact";
import { FooterConfig } from "./FooterConfig";
import { PopupConfig } from "./PopupConfig";
import { Widget } from "./Widget";
import { SiteHeaderConfig } from "./SiteHeaderConfig";
import { SiteBannerConfig } from "./SiteBannerConfig";
import { ContactMessage } from "./ContactMessage";
import { SiteSettings } from "./SiteSettings";
import { GlobalTheme } from "./GlobalTheme";
import { AiSettings } from "./AiSettings";
import { Translation } from "./Translation";
import { ApiKey } from "./ApiKey";

// Dev-mode HMR / Turbopack can re-evaluate this module (with fresh model class
// references) independently of any external flag, so a single global boolean
// guard isn't reliable — it can end up `true` while the *current* classes have
// no associations yet. Instead check each model's own `.associations` map
// (Sequelize's real runtime state) before registering that specific alias.
type AssociableModel = { associations: Record<string, unknown> };
function once(model: AssociableModel, alias: string, register: () => void) {
  if (!model.associations[alias]) register();
}

// Media relations
once(Media, "uploadedBy", () => Media.belongsTo(User, { foreignKey: "uploadedById", as: "uploadedBy" }));
once(Media, "folder", () => Media.belongsTo(MediaFolder, { foreignKey: "folderId", as: "folder" }));
once(MediaFolder, "media", () => MediaFolder.hasMany(Media, { foreignKey: "folderId", as: "media" }));

// Post relations
once(Post, "author", () => Post.belongsTo(User, { foreignKey: "authorId", as: "author" }));
once(Post, "categoryRef", () => Post.belongsTo(ArticleCategory, { foreignKey: "categoryId", as: "categoryRef" }));
once(Post, "coverImage", () => Post.belongsTo(Media, { foreignKey: "coverImageId", as: "coverImage" }));
once(ArticleCategory, "posts", () => ArticleCategory.hasMany(Post, { foreignKey: "categoryId", as: "posts" }));

// Product relations
once(Product, "categoryRef", () => Product.belongsTo(ProductCategory, { foreignKey: "categoryId", as: "categoryRef" }));
once(Product, "image", () => Product.belongsTo(Media, { foreignKey: "imageId", as: "image" }));
once(ProductCategory, "products", () => ProductCategory.hasMany(Product, { foreignKey: "categoryId", as: "products" }));
once(ProductCategory, "parent", () => ProductCategory.belongsTo(ProductCategory, { foreignKey: "parentId", as: "parent" }));
once(ProductCategory, "children", () => ProductCategory.hasMany(ProductCategory, { foreignKey: "parentId", as: "children" }));

// Page/Section relations
once(Page, "sections", () => Page.hasMany(PageSection, { foreignKey: "pageId", as: "sections", onDelete: "CASCADE" }));
once(PageSection, "page", () => PageSection.belongsTo(Page, { foreignKey: "pageId", as: "page" }));

// NavLink self-reference
once(NavLink, "parent", () => NavLink.belongsTo(NavLink, { foreignKey: "parentId", as: "parent" }));
once(NavLink, "children", () => NavLink.hasMany(NavLink, { foreignKey: "parentId", as: "children", onDelete: "CASCADE" }));

// Banner
once(Banner, "image", () => Banner.belongsTo(Media, { foreignKey: "imageId", as: "image" }));

// Footer
once(FooterColumn, "links", () => FooterColumn.hasMany(FooterLink, { foreignKey: "columnId", as: "links", onDelete: "CASCADE" }));
once(FooterLink, "column", () => FooterLink.belongsTo(FooterColumn, { foreignKey: "columnId", as: "column" }));

// Popup
once(PopupConfig, "image", () => PopupConfig.belongsTo(Media, { foreignKey: "imageId", as: "image" }));

// SiteSettings media
once(SiteSettings, "logo", () => SiteSettings.belongsTo(Media, { foreignKey: "logoId", as: "logo" }));
once(SiteSettings, "favicon", () => SiteSettings.belongsTo(Media, { foreignKey: "faviconId", as: "favicon" }));
once(SiteSettings, "loginBg", () => SiteSettings.belongsTo(Media, { foreignKey: "loginBgId", as: "loginBg" }));

export {
  sequelize,
  User,
  ArticleCategory,
  Media,
  MediaFolder,
  Post,
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
  ContactMessage,
  SiteSettings,
  GlobalTheme,
  AiSettings,
  Translation,
  ApiKey,
};
