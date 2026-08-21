import { Sequelize } from "sequelize";

const globalForSequelize = globalThis as unknown as { sequelize?: Sequelize };

const databaseUrl = process.env.DATABASE_URL as string;
const isLocalHost = /^(postgres(ql)?:\/\/)?[^@]*@?(localhost|127\.0\.0\.1)/.test(databaseUrl ?? "");

export const sequelize =
  globalForSequelize.sequelize ??
  new Sequelize(databaseUrl, {
    dialect: "postgres",
    logging: false,
    dialectOptions: isLocalHost
      ? undefined
      : { ssl: { require: true, rejectUnauthorized: false } },
    pool: { max: 10, min: 0, idle: 10000, acquire: 30000 },
  });

if (process.env.NODE_ENV !== "production") {
  globalForSequelize.sequelize = sequelize;
}
