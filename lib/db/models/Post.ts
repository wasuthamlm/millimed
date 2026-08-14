import { DataTypes, Model, type CreationOptional, type InferAttributes, type InferCreationAttributes } from "sequelize";
import { sequelize } from "@/lib/db/sequelize";

export type PostKind = "ARTICLE" | "NEWS";
export type PostStatus = "DRAFT" | "PUBLISHED";

export class Post extends Model<InferAttributes<Post>, InferCreationAttributes<Post>> {
  declare id: CreationOptional<string>;
  declare kind: PostKind;
  declare slug: string;
  declare status: CreationOptional<PostStatus>;
  declare titleTh: string;
  declare titleEn: string | null;
  declare excerptTh: string | null;
  declare excerptEn: string | null;
  declare bodyTh: string | null;
  declare bodyEn: string | null;
  declare coverImageId: string | null;
  declare galleryImageIds: CreationOptional<string[]>;
  declare categoryId: string | null;
  declare featured: CreationOptional<boolean>;
  declare publishedAt: Date | null;
  declare authorId: string | null;
  declare seoTitleTh: string | null;
  declare seoTitleEn: string | null;
  declare seoDescTh: string | null;
  declare seoDescEn: string | null;
  declare seoNoIndex: CreationOptional<boolean>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

Post.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    kind: { type: DataTypes.ENUM("ARTICLE", "NEWS"), allowNull: false },
    slug: { type: DataTypes.STRING, allowNull: false, unique: true },
    status: { type: DataTypes.ENUM("DRAFT", "PUBLISHED"), allowNull: false, defaultValue: "DRAFT" },
    titleTh: { type: DataTypes.STRING, allowNull: false },
    titleEn: { type: DataTypes.STRING, allowNull: true },
    excerptTh: { type: DataTypes.TEXT, allowNull: true },
    excerptEn: { type: DataTypes.TEXT, allowNull: true },
    bodyTh: { type: DataTypes.TEXT, allowNull: true },
    bodyEn: { type: DataTypes.TEXT, allowNull: true },
    coverImageId: { type: DataTypes.UUID, allowNull: true },
    galleryImageIds: { type: DataTypes.ARRAY(DataTypes.UUID), allowNull: false, defaultValue: [] },
    categoryId: { type: DataTypes.UUID, allowNull: true },
    featured: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    publishedAt: { type: DataTypes.DATE, allowNull: true },
    authorId: { type: DataTypes.UUID, allowNull: true },
    seoTitleTh: { type: DataTypes.STRING, allowNull: true },
    seoTitleEn: { type: DataTypes.STRING, allowNull: true },
    seoDescTh: { type: DataTypes.STRING, allowNull: true },
    seoDescEn: { type: DataTypes.STRING, allowNull: true },
    seoNoIndex: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  {
    sequelize,
    tableName: "posts",
    modelName: "Post",
    indexes: [{ fields: ["kind", "status", "publishedAt"] }],
  }
);
