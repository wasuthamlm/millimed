import { DataTypes, Model, type CreationOptional, type InferAttributes, type InferCreationAttributes } from "sequelize";
import { sequelize } from "@/lib/db/sequelize";

export class FooterContact extends Model<InferAttributes<FooterContact>, InferCreationAttributes<FooterContact>> {
  declare id: CreationOptional<string>;
  declare phone: string | null;
  declare email: string | null;
  declare address: string | null;
  declare addressEn: string | null;
  declare tagline: string | null;
  declare taglineEn: string | null;
  declare companyNameTh: string | null;
  declare companyNameEn: string | null;
  declare taxId: string | null;
  declare lineId: string | null;
  declare googleMapsEmbedUrl: string | null;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

FooterContact.init(
  {
    id: { type: DataTypes.STRING, primaryKey: true, defaultValue: "singleton" },
    phone: { type: DataTypes.STRING, allowNull: true },
    email: { type: DataTypes.STRING, allowNull: true },
    address: { type: DataTypes.TEXT, allowNull: true },
    addressEn: { type: DataTypes.TEXT, allowNull: true },
    tagline: { type: DataTypes.STRING, allowNull: true },
    taglineEn: { type: DataTypes.STRING, allowNull: true },
    companyNameTh: { type: DataTypes.STRING, allowNull: true },
    companyNameEn: { type: DataTypes.STRING, allowNull: true },
    taxId: { type: DataTypes.STRING, allowNull: true },
    lineId: { type: DataTypes.STRING, allowNull: true },
    googleMapsEmbedUrl: { type: DataTypes.TEXT, allowNull: true },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  { sequelize, tableName: "footer_contact", modelName: "FooterContact" }
);
