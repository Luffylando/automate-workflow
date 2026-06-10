"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hashPassword = hashPassword;
exports.verifyPassword = verifyPassword;
const crypto_1 = require("crypto");
const util_1 = require("util");
const scryptAsync = (0, util_1.promisify)(crypto_1.scrypt);
const KEY_LENGTH = 64;
async function hashPassword(password) {
    const salt = (0, crypto_1.randomBytes)(16).toString("hex");
    const derived = (await scryptAsync(password, salt, KEY_LENGTH));
    return `${salt}:${derived.toString("hex")}`;
}
async function verifyPassword(password, storedHash) {
    const [salt, key] = storedHash.split(":");
    if (!salt || !key) {
        return false;
    }
    const derived = (await scryptAsync(password, salt, KEY_LENGTH));
    const keyBuffer = Buffer.from(key, "hex");
    if (derived.length !== keyBuffer.length) {
        return false;
    }
    return (0, crypto_1.timingSafeEqual)(derived, keyBuffer);
}
