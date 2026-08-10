import { DataTypes, Model, type CreationOptional, type InferAttributes, type InferCreationAttributes } from "sequelize";
import { sequelize } from "@/lib/db/sequelize";

export type PageStatus = "PUBLISHED" | "DRAFT";

export class Page extends Model<InferAttributes<Page>, InferCreationAttributes<Page>> {
  declare id: CreationOptional<string>;
  declare slug: string;
  declare titleTh: string;
  declare titleEn: string | null;
  declare status: CreationOptional<PageStatus>;
  declare seoTitleTh: string | null;
  declare seoTitleEn: string | null;
  declare seoDescTh: string | null;
  declare seoDescEn: string | null;
  declare seoNoIndex: CreationOptional<boolean>;
  declare archived: CreationOptional<boolean>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

Page.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    slug: { type: DataTypes.STRING, allowNull: false, unique: true },
    titleTh: { type: DataTypes.STRING, allowNull: false },
    titleEn: { type: DataTypes.STRING, allowNull: true },
    status: { type: DataTypes.ENUM("PUBLISHED", "DRAFT"), allowNull: false, defaultValue: "DRAFT" },
    seoTitleTh: { type: DataTypes.STRING, allowNull: true },
    seoTitleEn: { type: DataTypes.STRING, allowNull: true },
    seoDescTh: { type: DataTypes.STRING, allowNull: true },
    seoDescEn: { type: DataTypes.STRING, allowNull: true },
    seoNoIndex: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    archived: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  { sequelize, tableName: "pages", modelName: "Page" }
);
