import { DataTypes, Model, type CreationOptional, type InferAttributes, type InferCreationAttributes } from "sequelize";
import { sequelize } from "@/lib/db/sequelize";

export class SiteBannerConfig extends Model<InferAttributes<SiteBannerConfig>, InferCreationAttributes<SiteBannerConfig>> {
  declare id: CreationOptional<string>;
  declare transitionEffect: CreationOptional<string>;
  declare direction: CreationOptional<string>;
  declare transitionSpeedMs: CreationOptional<number>;
  declare displayDurationMs: CreationOptional<number>;
  declare autoplay: CreationOptional<boolean>;
  declare loop: CreationOptional<boolean>;
  declare pauseOnHover: CreationOptional<boolean>;
  declare showArrows: CreationOptional<boolean>;
  declare showDots: CreationOptional<boolean>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

SiteBannerConfig.init(
  {
    id: { type: DataTypes.STRING, primaryKey: true, defaultValue: "singleton" },
    transitionEffect: { type: DataTypes.STRING, allowNull: false, defaultValue: "fade" },
    direction: { type: DataTypes.STRING, allowNull: false, defaultValue: "ltr" },
    transitionSpeedMs: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 500 },
    displayDurationMs: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 5000 },
    autoplay: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    loop: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    pauseOnHover: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    showArrows: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    showDots: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  { sequelize, tableName: "site_banner_config", modelName: "SiteBannerConfig" }
);
