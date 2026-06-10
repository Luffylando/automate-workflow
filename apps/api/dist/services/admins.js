"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAdminById = getAdminById;
exports.findAdminByEmail = findAdminByEmail;
exports.verifyAdminCredentials = verifyAdminCredentials;
exports.ensureDefaultAdmin = ensureDefaultAdmin;
const AdminUser_1 = require("../db/entities/AdminUser");
const data_source_1 = require("../db/data-source");
const config_1 = require("../config");
const password_1 = require("./password");
async function getAdminById(id) {
    const dataSource = await (0, data_source_1.getDataSource)();
    return dataSource.getRepository(AdminUser_1.AdminUser).findOne({ where: { id } });
}
async function findAdminByEmail(email) {
    const dataSource = await (0, data_source_1.getDataSource)();
    return dataSource.getRepository(AdminUser_1.AdminUser).findOne({
        where: { email: email.trim().toLowerCase() },
    });
}
async function verifyAdminCredentials(email, password) {
    const admin = await findAdminByEmail(email);
    if (!admin) {
        return null;
    }
    const valid = await (0, password_1.verifyPassword)(password, admin.passwordHash);
    return valid ? admin : null;
}
async function ensureDefaultAdmin() {
    const dataSource = await (0, data_source_1.getDataSource)();
    const repository = dataSource.getRepository(AdminUser_1.AdminUser);
    const email = config_1.config.adminEmail.trim().toLowerCase();
    const existing = await repository.findOne({ where: { email } });
    if (existing) {
        return;
    }
    const admin = repository.create({
        email,
        passwordHash: await (0, password_1.hashPassword)(config_1.config.adminPassword),
    });
    await repository.save(admin);
}
