export type JobStatus = "queued" | "running" | "done" | "failed";

export interface Job {
  id: string;
  prompt: string;
  status: JobStatus;
  createdAt: string;
  updatedAt: string;
  prUrl?: string;
  agentId?: string;
  agentRunId?: string;
  error?: string;
}

export interface AdminSession {
  role: "admin";
  sub: string;
}
