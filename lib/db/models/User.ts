import { DataTypes, Model, type CreationOptional, type InferAttributes, type InferCreationAttributes } from "sequelize";
import { sequelize } from "@/lib/db/sequelize";

export type Role = "ADMIN" | "APPROVER" | "CONTRIBUTOR" | "CUSTOMER";
export const ADMIN_ROLES: Role[] = ["ADMIN", "APPROVER", "CONTRIBUTOR"];

export class User extends Model<InferAttributes<User>, InferCreationAttributes<User>> {
  declare id: CreationOptional<string>;
  declare email: string;
  declare passwordHash: string | null;
  declare name: string | null;
  declare role: CreationOptional<Role>;
  declare disabled: CreationOptional<boolean>;
  declare emailVerified: Date | null;
  declare image: string | null;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

User.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    passwordHash: { type: DataTypes.STRING, allowNull: true },
    name: { type: DataTypes.STRING, allowNull: true },
    role: { type: DataTypes.ENUM("ADMIN", "APPROVER", "CONTRIBUTOR", "CUSTOMER"), allowNull: false, defaultValue: "CUSTOMER" },
    disabled: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    emailVerified: { type: DataTypes.DATE, allowNull: true },
    image: { type: DataTypes.STRING, allowNull: true },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  { sequelize, tableName: "users", modelName: "User" }
);
