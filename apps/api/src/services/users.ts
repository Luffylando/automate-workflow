import { getDataSource } from "../db/data-source";
import { User } from "../db/entities/User";
import type { UserDto } from "../types";
import { toUserDto } from "./mappers";

export async function listUsers(): Promise<UserDto[]> {
  const dataSource = await getDataSource();
  const users = await dataSource.getRepository(User).find({
    order: { name: "ASC" },
  });
  return users.map(toUserDto);
}
