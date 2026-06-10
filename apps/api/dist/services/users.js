"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listUsers = listUsers;
const data_source_1 = require("../db/data-source");
const User_1 = require("../db/entities/User");
const mappers_1 = require("./mappers");
async function listUsers() {
    const dataSource = await (0, data_source_1.getDataSource)();
    const users = await dataSource.getRepository(User_1.User).find({
        order: { name: "ASC" },
    });
    return users.map(mappers_1.toUserDto);
}
