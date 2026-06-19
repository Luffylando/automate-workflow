import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import type { TodoPriority, TodoStatus } from "../../types";

@Entity("todos")
export class Todo {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar", length: 500 })
  title!: string;

  @Column({ type: "boolean", default: false })
  completed!: boolean;

  @Column({ type: "varchar", length: 20, default: "medium" })
  priority!: TodoPriority;

  @Column({ type: "varchar", length: 20, default: "todo" })
  status!: TodoStatus;

  @Column({ type: "timestamptz", nullable: true })
  dueDate!: Date | null;

  @Column({ type: "jsonb", default: () => "'[]'" })
  tags!: string[];

  @CreateDateColumn({ type: "timestamptz" })
  createdAt!: Date;

  @UpdateDateColumn({ type: "timestamptz" })
  updatedAt!: Date;
}
