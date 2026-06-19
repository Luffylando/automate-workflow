import "dotenv/config";
import "reflect-metadata";
import { getDataSource } from "./db/data-source";
import { seedDemoData } from "./db/seed";

async function run(): Promise<void> {
  await getDataSource();
  await seedDemoData();
  console.log("Demo data seeded (skipped if data already exists).");
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
