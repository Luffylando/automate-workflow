"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SESSION_MAX_AGE_SECONDS = exports.SESSION_COOKIE = void 0;
exports.createSessionToken = createSessionToken;
exports.verifySessionToken = verifySessionToken;
exports.extractBearerToken = extractBearerToken;
const jose_1 = require("jose");
const config_1 = require("../config");
exports.SESSION_COOKIE = "admin_session";
exports.SESSION_MAX_AGE_SECONDS = 60 * 60 * 24;
function getSessionSecret() {
    return new TextEncoder().encode(config_1.config.sessionSecret);
}
async function createSessionToken(adminId, email) {
    return new jose_1.SignJWT({ role: "admin", sub: adminId, email })
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime(`${exports.SESSION_MAX_AGE_SECONDS}s`)
        .sign(getSessionSecret());
}
async function verifySessionToken(token) {
    try {
        const { payload } = await (0, jose_1.jwtVerify)(token, getSessionSecret());
        if (payload.role !== "admin" || typeof payload.sub !== "string") {
            return null;
        }
        const email = typeof payload.email === "string" ? payload.email : "admin@localhost";
        return { role: "admin", sub: payload.sub, email };
    }
    catch {
        return null;
    }
}
function extractBearerToken(authorizationHeader) {
    if (!authorizationHeader?.startsWith("Bearer ")) {
        return null;
    }
    const token = authorizationHeader.slice("Bearer ".length).trim();
    return token || null;
}
