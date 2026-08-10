import { DataTypes, Model, type CreationOptional, type InferAttributes, type InferCreationAttributes } from "sequelize";
import { sequelize } from "@/lib/db/sequelize";

export class GlobalTheme extends Model<InferAttributes<GlobalTheme>, InferCreationAttributes<GlobalTheme>> {
  declare id: CreationOptional<string>;
  declare fontHeader: CreationOptional<string>;
  declare fontBody: CreationOptional<string>;
  declare colorPrimary: CreationOptional<string>;
  declare colorPrimaryHover: CreationOptional<string>;
  declare colorAccent: CreationOptional<string>;
  declare colorBackground: CreationOptional<string>;
  declare colorText: CreationOptional<string>;
  declare buttonRadius: CreationOptional<string>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

GlobalTheme.init(
  {
    id: { type: DataTypes.STRING, primaryKey: true, defaultValue: "singleton" },
    fontHeader: { type: DataTypes.STRING, allowNull: false, defaultValue: "thai" },
    fontBody: { type: DataTypes.STRING, allowNull: false, defaultValue: "thai" },
    colorPrimary: { type: DataTypes.STRING, allowNull: false, defaultValue: "#16296b" },
    colorPrimaryHover: { type: DataTypes.STRING, allowNull: false, defaultValue: "#0d1a4a" },
    colorAccent: { type: DataTypes.STRING, allowNull: false, defaultValue: "#f5b301" },
    colorBackground: { type: DataTypes.STRING, allowNull: false, defaultValue: "#ffffff" },
    colorText: { type: DataTypes.STRING, allowNull: false, defaultValue: "#171717" },
    buttonRadius: { type: DataTypes.STRING, allowNull: false, defaultValue: "9999px" },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  { sequelize, tableName: "global_theme", modelName: "GlobalTheme" }
);
