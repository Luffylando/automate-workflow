import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import type { JobStatus } from "../../types";

@Entity("jobs")
export class Job {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column("text")
  prompt!: string;

  @Column({ type: "varchar", length: 20 })
  status!: JobStatus;

  @Column({ type: "varchar", nullable: true })
  prUrl!: string | null;

  @Column({ type: "varchar", nullable: true })
  agentId!: string | null;

  @Column({ type: "varchar", nullable: true })
  agentRunId!: string | null;

  @Column({ type: "text", nullable: true })
  error!: string | null;

  @Column({ type: "varchar", nullable: true })
  submittedById!: string | null;

  @Column({ type: "varchar", nullable: true })
  submittedByEmail!: string | null;

  @Column({ type: "jsonb", nullable: true })
  metadata!: Record<string, unknown> | null;

  @CreateDateColumn({ type: "timestamptz" })
  createdAt!: Date;

  @UpdateDateColumn({ type: "timestamptz" })
  updatedAt!: Date;
}
