import { DataTypes, Model, type CreationOptional, type InferAttributes, type InferCreationAttributes } from "sequelize";
import { sequelize } from "@/lib/db/sequelize";

export type TranslatableEntity = "ARTICLE" | "PRODUCT";

export class Translation extends Model<InferAttributes<Translation>, InferCreationAttributes<Translation>> {
  declare id: CreationOptional<string>;
  declare entityType: TranslatableEntity;
  declare entityId: string;
  declare locale: string;
  declare field: string;
  declare value: string;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

Translation.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    entityType: { type: DataTypes.ENUM("ARTICLE", "PRODUCT"), allowNull: false },
    entityId: { type: DataTypes.UUID, allowNull: false },
    locale: { type: DataTypes.STRING, allowNull: false },
    field: { type: DataTypes.STRING, allowNull: false },
    value: { type: DataTypes.TEXT, allowNull: false },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  {
    sequelize,
    tableName: "translations",
    modelName: "Translation",
    indexes: [
      { unique: true, fields: ["entityType", "entityId", "locale", "field"] },
      { fields: ["entityType", "locale"] },
    ],
  }
);
