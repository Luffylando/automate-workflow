export type JobStatus = "queued" | "running" | "done" | "failed";

export interface JobStats {
  total: number;
  queued: number;
  running: number;
  done: number;
  failed: number;
}

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
  submittedById?: string;
  submittedByEmail?: string;
  metadata?: Record<string, unknown>;
}

export interface Todo {
  id: string;
  title: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
  averageRating?: number | null;
  ratingCount?: number;
  myRating?: number | null;
}

export type UserRole = "admin" | "user";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
}

export interface AuthSession {
  role: UserRole;
  sub: string;
  email: string;
}

/** @deprecated Use AuthSession */
export type AdminSession = AuthSession;
