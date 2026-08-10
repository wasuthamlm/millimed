import { DataTypes, Model, type CreationOptional, type InferAttributes, type InferCreationAttributes } from "sequelize";
import { sequelize } from "@/lib/db/sequelize";

export class PopupConfig extends Model<InferAttributes<PopupConfig>, InferCreationAttributes<PopupConfig>> {
  declare id: CreationOptional<string>;
  declare enabled: CreationOptional<boolean>;
  declare titleTh: string | null;
  declare imageId: string | null;
  declare link: string | null;
  declare frequency: CreationOptional<string>;
  declare startDate: Date | null;
  declare endDate: Date | null;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

PopupConfig.init(
  {
    id: { type: DataTypes.STRING, primaryKey: true, defaultValue: "singleton" },
    enabled: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    titleTh: { type: DataTypes.STRING, allowNull: true },
    imageId: { type: DataTypes.UUID, allowNull: true },
    link: { type: DataTypes.STRING, allowNull: true },
    frequency: { type: DataTypes.STRING, allowNull: false, defaultValue: "once-per-day" },
    startDate: { type: DataTypes.DATE, allowNull: true },
    endDate: { type: DataTypes.DATE, allowNull: true },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  { sequelize, tableName: "popup_config", modelName: "PopupConfig" }
);
