"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.lookupSubmitterEmail = lookupSubmitterEmail;
exports.lookupSubmitterEmailsByIds = lookupSubmitterEmailsByIds;
exports.resolveSubmitterEmail = resolveSubmitterEmail;
const admins_1 = require("./admins");
const users_1 = require("./users");
async function lookupSubmitterEmail(submittedById) {
    const user = await (0, users_1.getUserById)(submittedById);
    if (user?.email.trim()) {
        return user.email.trim();
    }
    const admin = await (0, admins_1.getAdminById)(submittedById);
    if (admin?.email.trim()) {
        return admin.email.trim();
    }
    return undefined;
}
async function lookupSubmitterEmailsByIds(submittedByIds) {
    const emails = new Map();
    await Promise.all(submittedByIds.map(async (id) => {
        const email = await lookupSubmitterEmail(id);
        if (email) {
            emails.set(id, email);
        }
    }));
    return emails;
}
async function resolveSubmitterEmail(submittedById, submittedByEmail) {
    const trimmedEmail = submittedByEmail?.trim();
    if (trimmedEmail) {
        return trimmedEmail;
    }
    if (!submittedById) {
        return undefined;
    }
    return lookupSubmitterEmail(submittedById);
}
