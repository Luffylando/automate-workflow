"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isValidUserRole = isValidUserRole;
exports.listUsers = listUsers;
exports.getUserById = getUserById;
exports.findUserByEmail = findUserByEmail;
exports.createUser = createUser;
exports.updateUserRole = updateUserRole;
const User_1 = require("../db/entities/User");
const data_source_1 = require("../db/data-source");
const mappers_1 = require("./mappers");
const VALID_ROLES = ["admin", "user"];
function isValidUserRole(role) {
    return VALID_ROLES.includes(role);
}
async function listUsers() {
    const dataSource = await (0, data_source_1.getDataSource)();
    const users = await dataSource.getRepository(User_1.User).find({
        order: { createdAt: "DESC" },
    });
    return users.map(mappers_1.toUserDto);
}
async function getUserById(id) {
    const dataSource = await (0, data_source_1.getDataSource)();
    const user = await dataSource.getRepository(User_1.User).findOne({ where: { id } });
    return user ? (0, mappers_1.toUserDto)(user) : null;
}
async function findUserByEmail(email) {
    const dataSource = await (0, data_source_1.getDataSource)();
    return dataSource.getRepository(User_1.User).findOne({
        where: { email: email.trim().toLowerCase() },
    });
}
async function createUser(input) {
    const dataSource = await (0, data_source_1.getDataSource)();
    const repo = dataSource.getRepository(User_1.User);
    const user = repo.create({
        name: input.name.trim(),
        email: input.email.trim().toLowerCase(),
        role: input.role ?? "user",
    });
    const saved = await repo.save(user);
    return (0, mappers_1.toUserDto)(saved);
}
async function updateUserRole(id, role) {
    const dataSource = await (0, data_source_1.getDataSource)();
    const repo = dataSource.getRepository(User_1.User);
    const user = await repo.findOne({ where: { id } });
    if (!user) {
        return null;
    }
    user.role = role;
    const saved = await repo.save(user);
    return (0, mappers_1.toUserDto)(saved);
}
