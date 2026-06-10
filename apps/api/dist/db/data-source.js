"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppDataSource = void 0;
exports.getDataSource = getDataSource;
require("reflect-metadata");
const typeorm_1 = require("typeorm");
const config_1 = require("../config");
const Job_1 = require("./entities/Job");
const User_1 = require("./entities/User");
exports.AppDataSource = new typeorm_1.DataSource({
    type: "postgres",
    url: config_1.config.databaseUrl,
    entities: [User_1.User, Job_1.Job],
    synchronize: true,
    logging: false,
});
let initialized = false;
async function getDataSource() {
    if (!initialized) {
        if (!exports.AppDataSource.isInitialized) {
            await exports.AppDataSource.initialize();
        }
        initialized = true;
    }
    return exports.AppDataSource;
}
