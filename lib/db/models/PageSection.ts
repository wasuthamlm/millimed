import { DataTypes, Model, type CreationOptional, type InferAttributes, type InferCreationAttributes } from "sequelize";
import { sequelize } from "@/lib/db/sequelize";

export type SectionType = "HERO_BANNERS" | "CTA_BAR" | "COMPANY_INTRO" | "LATEST_NEWS" | "ARTICLES" | "CUSTOM";

export class PageSection extends Model<InferAttributes<PageSection>, InferCreationAttributes<PageSection>> {
  declare id: CreationOptional<string>;
  declare pageId: string;
  declare order: number;
  declare type: SectionType;
  declare titleTh: string | null;
  declare titleEn: string | null;
  declare bodyTh: string | null;
  declare visibleDesktop: CreationOptional<boolean>;
  declare visibleTablet: CreationOptional<boolean>;
  declare visibleMobile: CreationOptional<boolean>;
  declare columns: number | null;
  declare itemsToShow: number | null;
  declare config: Record<string, unknown> | null;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

PageSection.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    pageId: { type: DataTypes.UUID, allowNull: false },
    order: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    type: {
      type: DataTypes.ENUM("HERO_BANNERS", "CTA_BAR", "COMPANY_INTRO", "LATEST_NEWS", "ARTICLES", "CUSTOM"),
      allowNull: false,
    },
    titleTh: { type: DataTypes.STRING, allowNull: true },
    titleEn: { type: DataTypes.STRING, allowNull: true },
    bodyTh: { type: DataTypes.TEXT, allowNull: true },
    visibleDesktop: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    visibleTablet: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    visibleMobile: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    columns: { type: DataTypes.INTEGER, allowNull: true },
    itemsToShow: { type: DataTypes.INTEGER, allowNull: true },
    config: { type: DataTypes.JSONB, allowNull: true },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  {
    sequelize,
    tableName: "page_sections",
    modelName: "PageSection",
    indexes: [{ fields: ["pageId", "order"] }],
  }
);
