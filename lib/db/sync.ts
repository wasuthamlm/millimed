import "dotenv/config";

// DDL needs a direct (non-pooled) connection. Falls back to DATABASE_URL
// when DIRECT_URL isn't set yet (e.g. still pointed at local Postgres).
// Must happen before importing models/index, since that's what constructs
// the shared Sequelize singleton from process.env.DATABASE_URL.
if (process.env.DIRECT_URL) {
  process.env.DATABASE_URL = process.env.DIRECT_URL;
}

async function main() {
  const { sequelize } = await import("./models/index");
  await sequelize.authenticate();
  console.log("Database connection OK.");
  await sequelize.sync({ alter: true });
  console.log("Schema synced.");
  await sequelize.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
