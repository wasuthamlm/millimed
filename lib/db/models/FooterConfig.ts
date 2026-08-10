import { DataTypes, Model, type CreationOptional, type InferAttributes, type InferCreationAttributes } from "sequelize";
import { sequelize } from "@/lib/db/sequelize";

export class FooterConfig extends Model<InferAttributes<FooterConfig>, InferCreationAttributes<FooterConfig>> {
  declare id: CreationOptional<string>;
  declare bgColor: CreationOptional<string>;
  declare textColor: CreationOptional<string>;
  declare accentColor: CreationOptional<string>;
  declare desktopColumns: CreationOptional<number>;
  declare copyrightTh: string | null;
  declare copyrightEn: string | null;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

FooterConfig.init(
  {
    id: { type: DataTypes.STRING, primaryKey: true, defaultValue: "singleton" },
    bgColor: { type: DataTypes.STRING, allowNull: false, defaultValue: "#0d1a4a" },
    textColor: { type: DataTypes.STRING, allowNull: false, defaultValue: "#ffffff" },
    accentColor: { type: DataTypes.STRING, allowNull: false, defaultValue: "#f5b301" },
    desktopColumns: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 3 },
    copyrightTh: { type: DataTypes.STRING, allowNull: true },
    copyrightEn: { type: DataTypes.STRING, allowNull: true },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  { sequelize, tableName: "footer_config", modelName: "FooterConfig" }
);
