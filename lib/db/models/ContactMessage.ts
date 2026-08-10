import { DataTypes, Model, type CreationOptional, type InferAttributes, type InferCreationAttributes } from "sequelize";
import { sequelize } from "@/lib/db/sequelize";

export type MessageStatus = "NEW" | "READ" | "ARCHIVED";

export class ContactMessage extends Model<InferAttributes<ContactMessage>, InferCreationAttributes<ContactMessage>> {
  declare id: CreationOptional<string>;
  declare name: string;
  declare email: string;
  declare phone: string | null;
  declare subject: string | null;
  declare body: string;
  declare status: CreationOptional<MessageStatus>;
  declare createdAt: CreationOptional<Date>;
}

ContactMessage.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false },
    phone: { type: DataTypes.STRING, allowNull: true },
    subject: { type: DataTypes.STRING, allowNull: true },
    body: { type: DataTypes.TEXT, allowNull: false },
    status: { type: DataTypes.ENUM("NEW", "READ", "ARCHIVED"), allowNull: false, defaultValue: "NEW" },
    createdAt: DataTypes.DATE,
  },
  { sequelize, tableName: "contact_messages", modelName: "ContactMessage", updatedAt: false }
);
