import { DataTypes, Model, type CreationOptional, type InferAttributes, type InferCreationAttributes } from "sequelize";
import { sequelize } from "@/lib/db/sequelize";

export type ProductStatus = "ACTIVE" | "DRAFT" | "ARCHIVED";

export class Product extends Model<InferAttributes<Product>, InferCreationAttributes<Product>> {
  declare id: CreationOptional<string>;
  declare sku: string;
  declare nameTh: string;
  declare nameEn: string | null;
  declare descriptionTh: string | null;
  declare descriptionEn: string | null;
  declare status: CreationOptional<ProductStatus>;
  declare price: number | null;
  declare featured: CreationOptional<boolean>;
  declare bestSeller: CreationOptional<boolean>;
  declare imageId: string | null;
  declare categoryId: string | null;
  declare seoTitleTh: string | null;
  declare seoTitleEn: string | null;
  declare seoDescTh: string | null;
  declare seoDescEn: string | null;
  declare seoNoIndex: CreationOptional<boolean>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

Product.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    sku: { type: DataTypes.STRING, allowNull: false, unique: true },
    nameTh: { type: DataTypes.STRING, allowNull: false },
    nameEn: { type: DataTypes.STRING, allowNull: true },
    descriptionTh: { type: DataTypes.TEXT, allowNull: true },
    descriptionEn: { type: DataTypes.TEXT, allowNull: true },
    status: { type: DataTypes.ENUM("ACTIVE", "DRAFT", "ARCHIVED"), allowNull: false, defaultValue: "DRAFT" },
    price: { type: DataTypes.DECIMAL(10, 2), allowNull: true },
    featured: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    bestSeller: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    imageId: { type: DataTypes.UUID, allowNull: true },
    categoryId: { type: DataTypes.UUID, allowNull: true },
    seoTitleTh: { type: DataTypes.STRING, allowNull: true },
    seoTitleEn: { type: DataTypes.STRING, allowNull: true },
    seoDescTh: { type: DataTypes.STRING, allowNull: true },
    seoDescEn: { type: DataTypes.STRING, allowNull: true },
    seoNoIndex: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  { sequelize, tableName: "products", modelName: "Product" }
);
