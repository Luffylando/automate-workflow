export type JobStatus = "queued" | "running" | "done" | "failed";

export type TodoPriority = "low" | "medium" | "high";

export interface TodoDto {
  id: string;
  title: string;
  description: string | null;
  priority: TodoPriority;
  dueDate: string | null;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
  averageRating?: number | null;
  ratingCount?: number;
  myRating?: number | null;
}

export interface TodoStatsDto {
  total: number;
  open: number;
  completed: number;
  overdue: number;
  highPriority: number;
  averageRating: number | null;
  byPriority: Record<TodoPriority, number>;
}

export interface TodoRatingDto {
  id: string;
  userId: string;
  todoId: string;
  value: number;
  createdAt: string;
}

export interface JobStatsDto {
  total: number;
  queued: number;
  running: number;
  done: number;
  failed: number;
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
  submittedById?: string;
  submittedByEmail?: string;
  metadata?: Record<string, unknown>;
}

export type UserRole = "admin" | "user";

export interface UserDto {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
}

export type SessionRole = UserRole;

export interface AuthSession {
  role: SessionRole;
  sub: string;
  email: string;
}

/** @deprecated Use AuthSession */
export type AdminSession = AuthSession;
