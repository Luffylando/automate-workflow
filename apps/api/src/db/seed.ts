import { config } from "../config";
import { getDataSource } from "./data-source";
import { Todo } from "./entities/Todo";
import { TodoRating } from "./entities/TodoRating";
import { User } from "./entities/User";
import { createTodo } from "../services/todos";
import type { CreateTodoInput } from "../services/todos";
import { rateTodo } from "../services/todo-ratings";
import { createUser } from "../services/users";

export const DEMO_PASSWORD = "password123";

const SEED_USERS = [
  {
    name: "Alex Rivera",
    email: "alex@example.com",
    role: "user" as const,
  },
  {
    name: "Jordan Lee",
    email: "jordan@example.com",
    role: "admin" as const,
  },
  {
    name: "Sam Patel",
    email: "sam@example.com",
    role: "user" as const,
  },
  {
    name: "Taylor Brooks",
    email: "taylor@example.com",
    role: "user" as const,
  },
  {
    name: "Morgan Chen",
    email: "morgan@example.com",
    role: "user" as const,
  },
];

const SEED_TODOS: CreateTodoInput[] = [
  {
    title: "Review dashboard layout",
    priority: "high",
    status: "in_progress",
    dueDate: "2026-06-25T17:00:00.000Z",
    tags: ["design", "dashboard"],
  },
  {
    title: "Ship user management UI",
    priority: "medium",
    status: "done",
    dueDate: "2026-06-10T17:00:00.000Z",
    tags: ["frontend", "users"],
  },
  {
    title: "Add rating stars to todo cards",
    priority: "medium",
    status: "todo",
    dueDate: "2026-06-28T17:00:00.000Z",
    tags: ["frontend", "todos"],
  },
  {
    title: "Polish dark mode contrast on stat cards",
    priority: "low",
    status: "done",
    tags: ["design", "accessibility"],
  },
  {
    title: "Write API integration tests",
    priority: "high",
    status: "todo",
    dueDate: "2026-06-01T17:00:00.000Z",
    tags: ["testing", "api"],
  },
  {
    title:
      "Document the onboarding flow for new team members joining the automate-workflow project",
    priority: "medium",
    status: "in_progress",
    dueDate: "2026-07-05T17:00:00.000Z",
    tags: ["docs"],
  },
  {
    title: "Set up CI smoke tests",
    priority: "high",
    status: "done",
    tags: ["ci", "testing"],
  },
  {
    title: "Refine compact todo panel spacing",
    priority: "low",
    status: "todo",
    tags: ["ui"],
  },
  {
    title: "Add empty-state illustrations",
    priority: "medium",
    status: "todo",
    dueDate: "2026-07-12T17:00:00.000Z",
    tags: ["design"],
  },
  {
    title: "Test mobile dashboard breakpoints",
    priority: "medium",
    status: "done",
    tags: ["frontend", "responsive"],
  },
];

const SEED_RATINGS: Array<{
  todoTitle: string;
  userEmail: string;
  value: number;
}> = [
  { todoTitle: "Review dashboard layout", userEmail: "alex@example.com", value: 4 },
  { todoTitle: "Review dashboard layout", userEmail: "sam@example.com", value: 5 },
  { todoTitle: "Ship user management UI", userEmail: "jordan@example.com", value: 5 },
  { todoTitle: "Add rating stars to todo cards", userEmail: "taylor@example.com", value: 3 },
  {
    todoTitle: "Polish dark mode contrast on stat cards",
    userEmail: "morgan@example.com",
    value: 4,
  },
  { todoTitle: "Write API integration tests", userEmail: "alex@example.com", value: 2 },
];

export async function seedDemoData(): Promise<void> {
  if (config.isProduction) {
    return;
  }

  const dataSource = await getDataSource();
  const userRepo = dataSource.getRepository(User);
  const todoRepo = dataSource.getRepository(Todo);
  const ratingRepo = dataSource.getRepository(TodoRating);

  if ((await userRepo.count()) === 0) {
    for (const seedUser of SEED_USERS) {
      await createUser({
        name: seedUser.name,
        email: seedUser.email,
        password: DEMO_PASSWORD,
        role: seedUser.role,
      });
    }
  }

  if ((await todoRepo.count()) === 0) {
    for (const seedTodo of SEED_TODOS) {
      await createTodo(seedTodo);
    }
  }

  if ((await ratingRepo.count()) === 0) {
    const users = await userRepo.find();
    const todos = await todoRepo.find();
    const usersByEmail = new Map(users.map((user) => [user.email, user.id]));
    const todosByTitle = new Map(todos.map((todo) => [todo.title, todo.id]));

    for (const seedRating of SEED_RATINGS) {
      const userId = usersByEmail.get(seedRating.userEmail);
      const todoId = todosByTitle.get(seedRating.todoTitle);

      if (!userId || !todoId) {
        continue;
      }

      await rateTodo(userId, todoId, seedRating.value);
    }
  }
}
