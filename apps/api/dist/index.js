"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
require("reflect-metadata");
const cookie_1 = __importDefault(require("@fastify/cookie"));
const fastify_1 = __importDefault(require("fastify"));
const config_1 = require("./config");
const data_source_1 = require("./db/data-source");
const admin_auth_1 = require("./plugins/admin-auth");
const admin_prompts_1 = require("./routes/admin-prompts");
const auth_1 = require("./routes/auth");
const jobs_1 = require("./routes/jobs");
const todos_1 = require("./routes/todos");
async function start() {
    await (0, data_source_1.getDataSource)();
    const fastify = (0, fastify_1.default)({ logger: true });
    await fastify.register(cookie_1.default);
    (0, admin_auth_1.registerAdminAuth)(fastify);
    await fastify.register(auth_1.authRoutes);
    await fastify.register(todos_1.todosRoutes);
    await fastify.register(jobs_1.jobsRoutes);
    await fastify.register(admin_prompts_1.adminPromptsRoutes);
    fastify.get("/health", async () => ({ ok: true }));
    await fastify.listen({ port: config_1.config.port, host: config_1.config.host });
}
start().catch((error) => {
    console.error(error);
    process.exit(1);
});
