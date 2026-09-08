import { Sequelize } from "sequelize";
import pg from "pg";

const globalForSequelize = globalThis as unknown as { sequelize?: Sequelize };

const databaseUrl = process.env.DATABASE_URL?.trim();
if (!databaseUrl) {
  throw new Error("DATABASE_URL is not set in this environment");
}
if (!/^postgres(ql)?:\/\//.test(databaseUrl)) {
  throw new Error('DATABASE_URL must start with "postgres://" or "postgresql://" — check for stray quotes or whitespace in the env var value');
}
const isLocalHost = /^(postgres(ql)?:\/\/)?[^@]*@?(localhost|127\.0\.0\.1)/.test(databaseUrl);

export const sequelize =
  globalForSequelize.sequelize ??
  new Sequelize(databaseUrl, {
    dialect: "postgres",
    dialectModule: pg,
    logging: false,
    dialectOptions: isLocalHost
      ? undefined
      : { ssl: { require: true, rejectUnauthorized: false } },
    pool: { max: 10, min: 0, idle: 10000, acquire: 30000 },
  });

if (process.env.NODE_ENV !== "production") {
  globalForSequelize.sequelize = sequelize;
}
