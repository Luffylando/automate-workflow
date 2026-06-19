"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEMO_PASSWORD = void 0;
exports.seedDemoData = seedDemoData;
const config_1 = require("../config");
const data_source_1 = require("./data-source");
const Todo_1 = require("./entities/Todo");
const TodoRating_1 = require("./entities/TodoRating");
const User_1 = require("./entities/User");
const todos_1 = require("../services/todos");
const todo_ratings_1 = require("../services/todo-ratings");
const users_1 = require("../services/users");
exports.DEMO_PASSWORD = "password123";
const SEED_USERS = [
    {
        name: "Alex Rivera",
        email: "alex@example.com",
        role: "user",
    },
    {
        name: "Jordan Lee",
        email: "jordan@example.com",
        role: "admin",
    },
    {
        name: "Sam Patel",
        email: "sam@example.com",
        role: "user",
    },
    {
        name: "Taylor Brooks",
        email: "taylor@example.com",
        role: "user",
    },
    {
        name: "Morgan Chen",
        email: "morgan@example.com",
        role: "user",
    },
];
function daysFromNow(days) {
    const date = new Date();
    date.setUTCDate(date.getUTCDate() + days);
    date.setUTCHours(17, 0, 0, 0);
    return date;
}
const SEED_TODOS = [
    {
        title: "Review dashboard layout",
        description: "Check spacing, stat bar alignment, and mobile breakpoints.",
        priority: "high",
        dueDate: daysFromNow(-1),
        completed: false,
    },
    {
        title: "Ship user management UI",
        description: "Admin panel for listing and creating users.",
        priority: "medium",
        dueDate: daysFromNow(-3),
        completed: true,
    },
    {
        title: "Add rating stars to todo cards",
        description: "Allow signed-in users to rate each todo once.",
        priority: "medium",
        dueDate: daysFromNow(2),
        completed: false,
    },
    {
        title: "Polish dark mode contrast on stat cards",
        description: "Improve badge and border contrast in dark theme.",
        priority: "low",
        dueDate: daysFromNow(5),
        completed: true,
    },
    {
        title: "Write API integration tests",
        description: "Cover todo CRUD, stats endpoint, and rating flows.",
        priority: "high",
        dueDate: daysFromNow(1),
        completed: false,
    },
    {
        title: "Document the onboarding flow for new team members joining the automate-workflow project",
        description: "Include local setup, seed data, and verify steps.",
        priority: "low",
        dueDate: daysFromNow(14),
        completed: false,
    },
    {
        title: "Set up CI smoke tests",
        description: "Ensure pnpm verify runs on every push.",
        priority: "medium",
        dueDate: daysFromNow(-2),
        completed: true,
    },
    {
        title: "Refine compact todo panel spacing",
        description: "Tighten list item padding on the dashboard.",
        priority: "low",
        dueDate: daysFromNow(7),
        completed: false,
    },
    {
        title: "Add empty-state illustrations",
        description: null,
        priority: "low",
        dueDate: null,
        completed: false,
    },
    {
        title: "Test mobile dashboard breakpoints",
        description: "Verify grid collapse and scroll areas on small screens.",
        priority: "medium",
        dueDate: daysFromNow(3),
        completed: true,
    },
];
const SEED_RATINGS = [
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
async function seedDemoData() {
    if (config_1.config.isProduction) {
        return;
    }
    const dataSource = await (0, data_source_1.getDataSource)();
    const userRepo = dataSource.getRepository(User_1.User);
    const todoRepo = dataSource.getRepository(Todo_1.Todo);
    const ratingRepo = dataSource.getRepository(TodoRating_1.TodoRating);
    if ((await userRepo.count()) === 0) {
        for (const seedUser of SEED_USERS) {
            await (0, users_1.createUser)({
                name: seedUser.name,
                email: seedUser.email,
                password: exports.DEMO_PASSWORD,
                role: seedUser.role,
            });
        }
    }
    if ((await todoRepo.count()) === 0) {
        for (const seedTodo of SEED_TODOS) {
            const todo = await (0, todos_1.createTodo)({
                title: seedTodo.title,
                description: seedTodo.description,
                priority: seedTodo.priority,
                dueDate: seedTodo.dueDate,
            });
            if (seedTodo.completed) {
                await (0, todos_1.updateTodo)(todo.id, { completed: true });
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
            await (0, todo_ratings_1.rateTodo)(userId, todoId, seedRating.value);
        }
    }
}
