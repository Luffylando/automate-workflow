import { config } from "../config";
import { getDataSource } from "./data-source";
import { Todo } from "./entities/Todo";
import { TodoRating } from "./entities/TodoRating";
import { User } from "./entities/User";
import { createTodo, updateTodo } from "../services/todos";
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

function daysFromNow(days: number): Date {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + days);
  date.setUTCHours(17, 0, 0, 0);
  return date;
}

const SEED_TODOS = [
  {
    title: "Review dashboard layout",
    description: "Check spacing, stat bar alignment, and mobile breakpoints.",
    priority: "high" as const,
    dueDate: daysFromNow(-1),
    completed: false,
  },
  {
    title: "Ship user management UI",
    description: "Admin panel for listing and creating users.",
    priority: "medium" as const,
    dueDate: daysFromNow(-3),
    completed: true,
  },
  {
    title: "Add rating stars to todo cards",
    description: "Allow signed-in users to rate each todo once.",
    priority: "medium" as const,
    dueDate: daysFromNow(2),
    completed: false,
  },
  {
    title: "Polish dark mode contrast on stat cards",
    description: "Improve badge and border contrast in dark theme.",
    priority: "low" as const,
    dueDate: daysFromNow(5),
    completed: true,
  },
  {
    title: "Write API integration tests",
    description: "Cover todo CRUD, stats endpoint, and rating flows.",
    priority: "high" as const,
    dueDate: daysFromNow(1),
    completed: false,
  },
  {
    title:
      "Document the onboarding flow for new team members joining the automate-workflow project",
    description: "Include local setup, seed data, and verify steps.",
    priority: "low" as const,
    dueDate: daysFromNow(14),
    completed: false,
  },
  {
    title: "Set up CI smoke tests",
    description: "Ensure pnpm verify runs on every push.",
    priority: "medium" as const,
    dueDate: daysFromNow(-2),
    completed: true,
  },
  {
    title: "Refine compact todo panel spacing",
    description: "Tighten list item padding on the dashboard.",
    priority: "low" as const,
    dueDate: daysFromNow(7),
    completed: false,
  },
  {
    title: "Add empty-state illustrations",
    description: null,
    priority: "low" as const,
    dueDate: null,
    completed: false,
  },
  {
    title: "Test mobile dashboard breakpoints",
    description: "Verify grid collapse and scroll areas on small screens.",
    priority: "medium" as const,
    dueDate: daysFromNow(3),
    completed: true,
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
      const todo = await createTodo({
        title: seedTodo.title,
        description: seedTodo.description,
        priority: seedTodo.priority,
        dueDate: seedTodo.dueDate,
      });
      if (seedTodo.completed) {
        await updateTodo(todo.id, { completed: true });
      }
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
