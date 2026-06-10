import { randomUUID } from "crypto";
import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import type { Job, JobStatus } from "./types";

const DATA_DIR = path.join(process.cwd(), "data");
const JOBS_FILE = path.join(DATA_DIR, "jobs.json");

async function ensureDataFile(): Promise<Job[]> {
  await mkdir(DATA_DIR, { recursive: true });
  try {
    const raw = await readFile(JOBS_FILE, "utf8");
    return JSON.parse(raw) as Job[];
  } catch {
    const jobs: Job[] = [];
    await writeFile(JOBS_FILE, JSON.stringify(jobs, null, 2), "utf8");
    return jobs;
  }
}

async function writeJobs(jobs: Job[]): Promise<void> {
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(JOBS_FILE, JSON.stringify(jobs, null, 2), "utf8");
}

export async function createJob(prompt: string): Promise<Job> {
  const now = new Date().toISOString();
  const job: Job = {
    id: randomUUID(),
    prompt,
    status: "queued",
    createdAt: now,
    updatedAt: now,
  };

  const jobs = await ensureDataFile();
  jobs.unshift(job);
  await writeJobs(jobs);
  return job;
}

export async function getJob(id: string): Promise<Job | null> {
  const jobs = await ensureDataFile();
  return jobs.find((job) => job.id === id) ?? null;
}

export async function updateJobStatus(
  id: string,
  status: JobStatus,
  updates: Partial<Pick<Job, "prUrl" | "agentId" | "agentRunId" | "error">> = {},
): Promise<Job | null> {
  const jobs = await ensureDataFile();
  const index = jobs.findIndex((job) => job.id === id);
  if (index === -1) {
    return null;
  }

  const updated: Job = {
    ...jobs[index],
    ...updates,
    status,
    updatedAt: new Date().toISOString(),
  };
  jobs[index] = updated;
  await writeJobs(jobs);
  return updated;
}
