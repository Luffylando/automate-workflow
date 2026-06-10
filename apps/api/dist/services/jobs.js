"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createJob = createJob;
exports.listJobs = listJobs;
exports.getJobStats = getJobStats;
exports.getJob = getJob;
exports.updateJobStatus = updateJobStatus;
const data_source_1 = require("../db/data-source");
const Job_1 = require("../db/entities/Job");
const mappers_1 = require("./mappers");
const submitter_1 = require("./submitter");
const DEFAULT_LIST_LIMIT = 50;
const MAX_LIST_LIMIT = 100;
function parseUtcDateRange(date) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return null;
    }
    const start = new Date(`${date}T00:00:00.000Z`);
    if (Number.isNaN(start.getTime())) {
        return null;
    }
    const end = new Date(start);
    end.setUTCDate(end.getUTCDate() + 1);
    return { start, end };
}
async function enrichJobDto(job) {
    const dto = (0, mappers_1.toJobDto)(job);
    const email = await (0, submitter_1.resolveSubmitterEmail)(job.submittedById, job.submittedByEmail);
    if (!email) {
        return dto;
    }
    return { ...dto, submittedByEmail: email };
}
async function enrichJobDtos(jobs) {
    const dtos = jobs.map(mappers_1.toJobDto);
    const idsNeedingEmail = new Set();
    for (let index = 0; index < jobs.length; index += 1) {
        const job = jobs[index];
        const dto = dtos[index];
        if (!dto) {
            continue;
        }
        if (!dto.submittedByEmail?.trim() && job?.submittedById) {
            idsNeedingEmail.add(job.submittedById);
        }
    }
    if (idsNeedingEmail.size === 0) {
        return dtos;
    }
    const emailsById = await (0, submitter_1.lookupSubmitterEmailsByIds)([...idsNeedingEmail]);
    return dtos.map((dto, index) => {
        if (dto.submittedByEmail?.trim()) {
            return dto;
        }
        const submittedById = jobs[index]?.submittedById;
        if (!submittedById) {
            return dto;
        }
        const email = emailsById.get(submittedById);
        return email ? { ...dto, submittedByEmail: email } : dto;
    });
}
async function createJob(input) {
    const dataSource = await (0, data_source_1.getDataSource)();
    const repo = dataSource.getRepository(Job_1.Job);
    const job = repo.create({
        prompt: input.prompt,
        status: "queued",
        prUrl: null,
        agentId: null,
        agentRunId: null,
        error: null,
        submittedById: input.submittedById ?? null,
        submittedByEmail: input.submittedByEmail ?? null,
        metadata: input.metadata ?? null,
    });
    const saved = await repo.save(job);
    return enrichJobDto(saved);
}
async function listJobs(options = {}) {
    const dataSource = await (0, data_source_1.getDataSource)();
    const limit = Math.min(Math.max(options.limit ?? DEFAULT_LIST_LIMIT, 1), MAX_LIST_LIMIT);
    const offset = Math.max(options.offset ?? 0, 0);
    const query = dataSource
        .getRepository(Job_1.Job)
        .createQueryBuilder("job")
        .orderBy("job.createdAt", "DESC")
        .take(limit)
        .skip(offset);
    const promptSearch = options.prompt?.trim();
    if (promptSearch) {
        query.andWhere("job.prompt ILIKE :prompt", {
            prompt: `%${promptSearch}%`,
        });
    }
    if (options.date) {
        const range = parseUtcDateRange(options.date);
        if (range) {
            query.andWhere("job.createdAt >= :start AND job.createdAt < :end", {
                start: range.start,
                end: range.end,
            });
        }
    }
    const jobs = await query.getMany();
    return enrichJobDtos(jobs);
}
async function getJobStats() {
    const dataSource = await (0, data_source_1.getDataSource)();
    const rows = await dataSource
        .getRepository(Job_1.Job)
        .createQueryBuilder("job")
        .select("job.status", "status")
        .addSelect("COUNT(job.id)", "count")
        .groupBy("job.status")
        .getRawMany();
    const stats = {
        total: 0,
        queued: 0,
        running: 0,
        done: 0,
        failed: 0,
    };
    for (const row of rows) {
        const count = Number(row.count);
        stats[row.status] = count;
        stats.total += count;
    }
    return stats;
}
async function getJob(id) {
    const dataSource = await (0, data_source_1.getDataSource)();
    const job = await dataSource.getRepository(Job_1.Job).findOne({ where: { id } });
    return job ? enrichJobDto(job) : null;
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
    return enrichJobDto(saved);
}
