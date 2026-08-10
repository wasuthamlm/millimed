import { DataTypes, Model, type CreationOptional, type InferAttributes, type InferCreationAttributes } from "sequelize";
import { sequelize } from "@/lib/db/sequelize";

export class SiteHeaderConfig extends Model<InferAttributes<SiteHeaderConfig>, InferCreationAttributes<SiteHeaderConfig>> {
  declare id: CreationOptional<string>;
  declare layout: CreationOptional<string>;
  declare height: CreationOptional<string>;
  declare shadow: CreationOptional<string>;
  declare position: CreationOptional<string>;
  declare bgColor: CreationOptional<string>;
  declare textColor: CreationOptional<string>;
  declare hoverBgColor: CreationOptional<string>;
  declare hoverTextColor: CreationOptional<string>;
  declare activeBgColor: CreationOptional<string>;
  declare activeTextColor: CreationOptional<string>;
  declare iconTextColor: CreationOptional<string>;
  declare logoMode: CreationOptional<string>;
  declare logoTextTh: string | null;
  declare logoTextEn: string | null;
  declare menuWrap: CreationOptional<string>;
  declare menuFontSize: CreationOptional<string>;
  declare menuLevels: CreationOptional<number>;
  declare submenuStyle: CreationOptional<string>;
  declare submenuChildBehavior: CreationOptional<string>;
  declare showSearch: CreationOptional<boolean>;
  declare showLanguage: CreationOptional<boolean>;
  declare showAccount: CreationOptional<boolean>;
  declare showCart: CreationOptional<boolean>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

SiteHeaderConfig.init(
  {
    id: { type: DataTypes.STRING, primaryKey: true, defaultValue: "singleton" },
    layout: { type: DataTypes.STRING, allowNull: false, defaultValue: "logo-left-menu-center" },
    height: { type: DataTypes.STRING, allowNull: false, defaultValue: "standard" },
    shadow: { type: DataTypes.STRING, allowNull: false, defaultValue: "none" },
    position: { type: DataTypes.STRING, allowNull: false, defaultValue: "fixed-top" },
    bgColor: { type: DataTypes.STRING, allowNull: false, defaultValue: "#ffffff" },
    textColor: { type: DataTypes.STRING, allowNull: false, defaultValue: "#334155" },
    hoverBgColor: { type: DataTypes.STRING, allowNull: false, defaultValue: "#f1f5f9" },
    hoverTextColor: { type: DataTypes.STRING, allowNull: false, defaultValue: "#16296b" },
    activeBgColor: { type: DataTypes.STRING, allowNull: false, defaultValue: "#16296b" },
    activeTextColor: { type: DataTypes.STRING, allowNull: false, defaultValue: "#ffffff" },
    iconTextColor: { type: DataTypes.STRING, allowNull: false, defaultValue: "#16296b" },
    logoMode: { type: DataTypes.STRING, allowNull: false, defaultValue: "site-settings" },
    logoTextTh: { type: DataTypes.STRING, allowNull: true },
    logoTextEn: { type: DataTypes.STRING, allowNull: true },
    menuWrap: { type: DataTypes.STRING, allowNull: false, defaultValue: "single-line" },
    menuFontSize: { type: DataTypes.STRING, allowNull: false, defaultValue: "normal" },
    menuLevels: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 2 },
    submenuStyle: { type: DataTypes.STRING, allowNull: false, defaultValue: "hover-open" },
    submenuChildBehavior: { type: DataTypes.STRING, allowNull: false, defaultValue: "below-parent" },
    showSearch: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    showLanguage: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    showAccount: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    showCart: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  { sequelize, tableName: "site_header_config", modelName: "SiteHeaderConfig" }
);
