"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isValidUserRole = isValidUserRole;
exports.validatePassword = validatePassword;
exports.listUsers = listUsers;
exports.getUserById = getUserById;
exports.findUserByEmail = findUserByEmail;
exports.verifyUserCredentials = verifyUserCredentials;
exports.createUser = createUser;
exports.updateUserRole = updateUserRole;
const User_1 = require("../db/entities/User");
const data_source_1 = require("../db/data-source");
const password_1 = require("./password");
const mappers_1 = require("./mappers");
const VALID_ROLES = ["admin", "user"];
const MIN_PASSWORD_LENGTH = 8;
function isValidUserRole(role) {
    return VALID_ROLES.includes(role);
}
function validatePassword(password) {
    if (!password) {
        return "Password is required";
    }
    if (password.length < MIN_PASSWORD_LENGTH) {
        return `Password must be at least ${MIN_PASSWORD_LENGTH} characters`;
    }
    return null;
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
async function verifyUserCredentials(email, password) {
    const user = await findUserByEmail(email);
    if (!user?.passwordHash) {
        return null;
    }
    const valid = await (0, password_1.verifyPassword)(password, user.passwordHash);
    return valid ? user : null;
}
async function createUser(input) {
    const passwordError = validatePassword(input.password);
    if (passwordError) {
        throw new Error(passwordError);
    }
    const dataSource = await (0, data_source_1.getDataSource)();
    const repo = dataSource.getRepository(User_1.User);
    const user = repo.create({
        name: input.name.trim(),
        email: input.email.trim().toLowerCase(),
        passwordHash: await (0, password_1.hashPassword)(input.password),
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
