import { DataTypes, Model, type CreationOptional, type InferAttributes, type InferCreationAttributes } from "sequelize";
import { sequelize } from "@/lib/db/sequelize";

export type NavPlacement = "HEADER" | "FOOTER";

export class NavLink extends Model<InferAttributes<NavLink>, InferCreationAttributes<NavLink>> {
  declare id: CreationOptional<string>;
  declare labelTh: string;
  declare labelEn: string | null;
  declare href: string;
  declare order: CreationOptional<number>;
  declare active: CreationOptional<boolean>;
  declare placement: CreationOptional<NavPlacement>;
  declare parentId: string | null;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

NavLink.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    labelTh: { type: DataTypes.STRING, allowNull: false },
    labelEn: { type: DataTypes.STRING, allowNull: true },
    href: { type: DataTypes.STRING, allowNull: false },
    order: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    placement: { type: DataTypes.ENUM("HEADER", "FOOTER"), allowNull: false, defaultValue: "HEADER" },
    parentId: { type: DataTypes.UUID, allowNull: true },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  { sequelize, tableName: "nav_links", modelName: "NavLink" }
);
