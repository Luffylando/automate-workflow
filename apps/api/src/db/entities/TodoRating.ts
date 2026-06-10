import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  Unique,
} from "typeorm";

@Entity("todo_ratings")
@Unique(["userId", "todoId"])
export class TodoRating {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "uuid" })
  userId!: string;

  @Column({ type: "uuid" })
  todoId!: string;

  @Column({ type: "smallint" })
  value!: number;

  @CreateDateColumn({ type: "timestamptz" })
  createdAt!: Date;
}
