import { DataTypes, Model, type CreationOptional, type InferAttributes, type InferCreationAttributes } from "sequelize";
import { sequelize } from "@/lib/db/sequelize";

export type ApiKeyScope = "read" | "write";

export class ApiKey extends Model<InferAttributes<ApiKey>, InferCreationAttributes<ApiKey>> {
  declare id: CreationOptional<string>;
  declare label: string;
  declare keyHash: string;
  declare keyPrefix: string;
  declare scopes: CreationOptional<ApiKeyScope[]>;
  declare active: CreationOptional<boolean>;
  declare lastUsedAt: Date | null;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

ApiKey.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    label: { type: DataTypes.STRING, allowNull: false },
    keyHash: { type: DataTypes.STRING, allowNull: false, unique: true },
    keyPrefix: { type: DataTypes.STRING, allowNull: false },
    scopes: { type: DataTypes.ARRAY(DataTypes.STRING), allowNull: false, defaultValue: ["read"] },
    active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    lastUsedAt: { type: DataTypes.DATE, allowNull: true },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  { sequelize, tableName: "api_keys", modelName: "ApiKey" }
);
