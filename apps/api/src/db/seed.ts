import { getDataSource } from "./data-source";
import { User } from "./entities/User";

const SEED_USERS = [
  { name: "Alex Rivera", email: "alex@example.com" },
  { name: "Jordan Lee", email: "jordan@example.com" },
  { name: "Sam Patel", email: "sam@example.com" },
];

export async function seedUsers(): Promise<void> {
  const dataSource = await getDataSource();
  const repo = dataSource.getRepository(User);
  const count = await repo.count();

  if (count > 0) {
    return;
  }

  await repo.save(SEED_USERS.map((user) => repo.create(user)));
}
