import { DataTypes, Model, type CreationOptional, type InferAttributes, type InferCreationAttributes } from "sequelize";
import { sequelize } from "@/lib/db/sequelize";

export type AiProvider = "OPENAI" | "GEMINI";

export class AiSettings extends Model<InferAttributes<AiSettings>, InferCreationAttributes<AiSettings>> {
  declare id: CreationOptional<string>;
  declare provider: CreationOptional<AiProvider>;
  declare model: string | null;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

AiSettings.init(
  {
    id: { type: DataTypes.STRING, primaryKey: true, defaultValue: "singleton" },
    provider: { type: DataTypes.ENUM("OPENAI", "GEMINI"), allowNull: false, defaultValue: "GEMINI" },
    model: { type: DataTypes.STRING, allowNull: true },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  { sequelize, tableName: "ai_settings", modelName: "AiSettings" }
);
