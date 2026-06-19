import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

export type TodoPriority = "low" | "medium" | "high";

@Entity("todos")
export class Todo {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar", length: 500 })
  title!: string;

  @Column({ type: "text", nullable: true })
  description!: string | null;

  @Column({ type: "varchar", length: 10, default: "medium" })
  priority!: TodoPriority;

  @Column({ type: "timestamptz", nullable: true })
  dueDate!: Date | null;

  @Column({ type: "boolean", default: false })
  completed!: boolean;

  @CreateDateColumn({ type: "timestamptz" })
  createdAt!: Date;

  @UpdateDateColumn({ type: "timestamptz" })
  updatedAt!: Date;
}
