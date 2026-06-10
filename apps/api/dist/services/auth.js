"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SESSION_MAX_AGE_SECONDS = exports.SESSION_COOKIE = void 0;
exports.createSessionToken = createSessionToken;
exports.verifySessionToken = verifySessionToken;
exports.verifyAdminPassword = verifyAdminPassword;
const jose_1 = require("jose");
const config_1 = require("../config");
exports.SESSION_COOKIE = "admin_session";
exports.SESSION_MAX_AGE_SECONDS = 60 * 60 * 24;
function getSessionSecret() {
    return new TextEncoder().encode(config_1.config.sessionSecret);
}
async function createSessionToken() {
    return new jose_1.SignJWT({ role: "admin", sub: "admin" })
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime(`${exports.SESSION_MAX_AGE_SECONDS}s`)
        .sign(getSessionSecret());
}
async function verifySessionToken(token) {
    try {
        const { payload } = await (0, jose_1.jwtVerify)(token, getSessionSecret());
        if (payload.role !== "admin") {
            return null;
        }
        return { role: "admin", sub: String(payload.sub ?? "admin") };
    }
    catch {
        return null;
    }
}
function verifyAdminPassword(password) {
    return password === config_1.config.adminPassword;
}
