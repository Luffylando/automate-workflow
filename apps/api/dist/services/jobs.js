"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createJob = createJob;
exports.getJob = getJob;
exports.updateJobStatus = updateJobStatus;
const data_source_1 = require("../db/data-source");
const Job_1 = require("../db/entities/Job");
const mappers_1 = require("./mappers");
async function createJob(prompt) {
    const dataSource = await (0, data_source_1.getDataSource)();
    const repo = dataSource.getRepository(Job_1.Job);
    const job = repo.create({
        prompt,
        status: "queued",
        prUrl: null,
        agentId: null,
        agentRunId: null,
        error: null,
    });
    const saved = await repo.save(job);
    return (0, mappers_1.toJobDto)(saved);
}
async function getJob(id) {
    const dataSource = await (0, data_source_1.getDataSource)();
    const job = await dataSource.getRepository(Job_1.Job).findOne({ where: { id } });
    return job ? (0, mappers_1.toJobDto)(job) : null;
}
async function updateJobStatus(id, status, updates = {}) {
    const dataSource = await (0, data_source_1.getDataSource)();
    const repo = dataSource.getRepository(Job_1.Job);
    const job = await repo.findOne({ where: { id } });
    if (!job) {
        return null;
    }
    job.status = status;
    if ("prUrl" in updates)
        job.prUrl = updates.prUrl ?? null;
    if ("agentId" in updates)
        job.agentId = updates.agentId ?? null;
    if ("agentRunId" in updates)
        job.agentRunId = updates.agentRunId ?? null;
    if ("error" in updates)
        job.error = updates.error ?? null;
    const saved = await repo.save(job);
    return (0, mappers_1.toJobDto)(saved);
}
