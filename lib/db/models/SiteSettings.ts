import { DataTypes, Model, type CreationOptional, type InferAttributes, type InferCreationAttributes } from "sequelize";
import { sequelize } from "@/lib/db/sequelize";

export class SiteSettings extends Model<InferAttributes<SiteSettings>, InferCreationAttributes<SiteSettings>> {
  declare id: CreationOptional<string>;
  declare siteNameTh: CreationOptional<string>;
  declare siteNameEn: string | null;
  declare siteUrl: string | null;
  declare youtubeEmbedUrl: string | null;
  declare gtmId: string | null;
  declare ga4Id: string | null;
  declare fbPixelId: string | null;
  declare tiktokPixelId: string | null;
  declare seoMetaTitleTh: string | null;
  declare seoMetaDescTh: string | null;
  declare facebookUrl: string | null;
  declare instagramUrl: string | null;
  declare youtubeUrl: string | null;
  declare tiktokUrl: string | null;
  declare lineUrl: string | null;
  declare socialIconStyle: CreationOptional<string>;
  declare showSocialInHeader: CreationOptional<boolean>;
  declare logoId: string | null;
  declare faviconId: string | null;
  declare loginBgId: string | null;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

SiteSettings.init(
  {
    id: { type: DataTypes.STRING, primaryKey: true, defaultValue: "singleton" },
    siteNameTh: { type: DataTypes.STRING, allowNull: false, defaultValue: "Millimed" },
    siteNameEn: { type: DataTypes.STRING, allowNull: true },
    siteUrl: { type: DataTypes.STRING, allowNull: true },
    youtubeEmbedUrl: { type: DataTypes.STRING, allowNull: true },
    gtmId: { type: DataTypes.STRING, allowNull: true },
    ga4Id: { type: DataTypes.STRING, allowNull: true },
    fbPixelId: { type: DataTypes.STRING, allowNull: true },
    tiktokPixelId: { type: DataTypes.STRING, allowNull: true },
    seoMetaTitleTh: { type: DataTypes.STRING, allowNull: true },
    seoMetaDescTh: { type: DataTypes.STRING, allowNull: true },
    facebookUrl: { type: DataTypes.STRING, allowNull: true },
    instagramUrl: { type: DataTypes.STRING, allowNull: true },
    youtubeUrl: { type: DataTypes.STRING, allowNull: true },
    tiktokUrl: { type: DataTypes.STRING, allowNull: true },
    lineUrl: { type: DataTypes.STRING, allowNull: true },
    socialIconStyle: { type: DataTypes.STRING, allowNull: false, defaultValue: "filled" },
    showSocialInHeader: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    logoId: { type: DataTypes.UUID, allowNull: true },
    faviconId: { type: DataTypes.UUID, allowNull: true },
    loginBgId: { type: DataTypes.UUID, allowNull: true },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  { sequelize, tableName: "site_settings", modelName: "SiteSettings" }
);
