export type JobStatus = "queued" | "running" | "done" | "failed";

export interface TodoDto {
  id: string;
  title: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
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
  email: string;
}
