export type JobStatus = "queued" | "running" | "done" | "failed";

export interface TodoDto {
  id: string;
  title: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
  averageRating?: number | null;
  ratingCount?: number;
  myRating?: number | null;
}

export interface TodoRatingDto {
  id: string;
  userId: string;
  todoId: string;
  value: number;
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
