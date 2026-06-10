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

export interface Todo {
  id: string;
  title: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

export type UserRole = "admin" | "user";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
}

export interface AdminSession {
  role: "admin";
  sub: string;
  email: string;
}
