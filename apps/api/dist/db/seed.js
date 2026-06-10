"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedUsers = seedUsers;
const data_source_1 = require("./data-source");
const User_1 = require("./entities/User");
const SEED_USERS = [
    { name: "Alex Rivera", email: "alex@example.com" },
    { name: "Jordan Lee", email: "jordan@example.com" },
    { name: "Sam Patel", email: "sam@example.com" },
];
async function seedUsers() {
    const dataSource = await (0, data_source_1.getDataSource)();
    const repo = dataSource.getRepository(User_1.User);
    const count = await repo.count();
    if (count > 0) {
        return;
    }
    await repo.save(SEED_USERS.map((user) => repo.create(user)));
}
