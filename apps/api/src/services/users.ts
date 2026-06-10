import { User } from "../db/entities/User";
import { getDataSource } from "../db/data-source";
import type { UserDto, UserRole } from "../types";
import { toUserDto } from "./mappers";

const VALID_ROLES: UserRole[] = ["admin", "user"];

export function isValidUserRole(role: string): role is UserRole {
  return VALID_ROLES.includes(role as UserRole);
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

export async function createUser(input: {
  name: string;
  email: string;
  role?: UserRole;
}): Promise<UserDto> {
  const dataSource = await getDataSource();
  const repo = dataSource.getRepository(User);
  const user = repo.create({
    name: input.name.trim(),
    email: input.email.trim().toLowerCase(),
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
