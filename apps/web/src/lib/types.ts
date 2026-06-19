export type JobStatus = "queued" | "running" | "done" | "failed";

export type TodoPriority = "low" | "medium" | "high";
export type TodoStatus = "todo" | "in_progress" | "done" | "cancelled";

export interface JobStats {
  total: number;
  queued: number;
  running: number;
  done: number;
  failed: number;
}

export interface TodoStats {
  total: number;
  open: number;
  done: number;
  cancelled: number;
  inProgress: number;
  overdue: number;
  highPriority: number;
  rated: number;
  averageRating: number | null;
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
  priority: TodoPriority;
  status: TodoStatus;
  dueDate: string | null;
  tags: string[];
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
