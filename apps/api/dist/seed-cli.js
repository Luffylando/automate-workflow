"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
require("reflect-metadata");
const data_source_1 = require("./db/data-source");
const seed_1 = require("./db/seed");
async function run() {
    await (0, data_source_1.getDataSource)();
    await (0, seed_1.seedDemoData)();
    console.log("Demo data seeded (skipped if data already exists).");
}
run().catch((error) => {
    console.error(error);
    process.exit(1);
});
