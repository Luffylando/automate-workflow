export type JobStatus = "queued" | "running" | "done" | "failed";

export interface UserDto {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface JobDto {
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
