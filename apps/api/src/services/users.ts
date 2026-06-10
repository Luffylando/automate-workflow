import { User } from "../db/entities/User";
import { getDataSource } from "../db/data-source";
import type { UserDto, UserRole } from "../types";
import { hashPassword, verifyPassword } from "./password";
import { toUserDto } from "./mappers";

const VALID_ROLES: UserRole[] = ["admin", "user"];
const MIN_PASSWORD_LENGTH = 8;

export function isValidUserRole(role: string): role is UserRole {
  return VALID_ROLES.includes(role as UserRole);
}

export function validatePassword(password: string): string | null {
  if (!password) {
    return "Password is required";
  }
  if (password.length < MIN_PASSWORD_LENGTH) {
    return `Password must be at least ${MIN_PASSWORD_LENGTH} characters`;
  }
  return null;
}

export async function listUsers(): Promise<UserDto[]> {
  const dataSource = await getDataSource();
  const users = await dataSource.getRepository(User).find({
    order: { createdAt: "DESC" },
  });
  return users.map(toUserDto);
}

export async function getUserById(id: string): Promise<UserDto | null> {
  const dataSource = await getDataSource();
  const user = await dataSource.getRepository(User).findOne({ where: { id } });
  return user ? toUserDto(user) : null;
}

export async function findUserByEmail(email: string): Promise<User | null> {
  const dataSource = await getDataSource();
  return dataSource.getRepository(User).findOne({
    where: { email: email.trim().toLowerCase() },
  });
}

export async function verifyUserCredentials(
  email: string,
  password: string,
): Promise<User | null> {
  const user = await findUserByEmail(email);
  if (!user?.passwordHash) {
    return null;
  }

  const valid = await verifyPassword(password, user.passwordHash);
  return valid ? user : null;
}

export async function createUser(input: {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
}): Promise<UserDto> {
  const passwordError = validatePassword(input.password);
  if (passwordError) {
    throw new Error(passwordError);
  }

  const dataSource = await getDataSource();
  const repo = dataSource.getRepository(User);
  const user = repo.create({
    name: input.name.trim(),
    email: input.email.trim().toLowerCase(),
    passwordHash: await hashPassword(input.password),
    role: input.role ?? "user",
  });
  const saved = await repo.save(user);
  return toUserDto(saved);
}

export async function updateUserRole(
  id: string,
  role: UserRole,
): Promise<UserDto | null> {
  const dataSource = await getDataSource();
  const repo = dataSource.getRepository(User);
  const user = await repo.findOne({ where: { id } });

  if (!user) {
    return null;
  }

  user.role = role;
  const saved = await repo.save(user);
  return toUserDto(saved);
}
