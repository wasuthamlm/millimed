import "dotenv/config";
import { sequelize } from "./models/index";

async function main() {
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
