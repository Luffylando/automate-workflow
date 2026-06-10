import { AdminUser } from "../db/entities/AdminUser";
import { getDataSource } from "../db/data-source";
import { config } from "../config";
import { hashPassword, verifyPassword } from "./password";

export async function findAdminByEmail(
  email: string,
): Promise<AdminUser | null> {
  const dataSource = await getDataSource();
  return dataSource.getRepository(AdminUser).findOne({
    where: { email: email.trim().toLowerCase() },
  });
}

export async function verifyAdminCredentials(
  email: string,
  password: string,
): Promise<AdminUser | null> {
  const admin = await findAdminByEmail(email);
  if (!admin) {
    return null;
  }

  const valid = await verifyPassword(password, admin.passwordHash);
  return valid ? admin : null;
}

export async function ensureDefaultAdmin(): Promise<void> {
  const dataSource = await getDataSource();
  const repository = dataSource.getRepository(AdminUser);
  const email = config.adminEmail.trim().toLowerCase();
  const existing = await repository.findOne({ where: { email } });

  if (existing) {
    return;
  }

  const admin = repository.create({
    email,
    passwordHash: await hashPassword(config.adminPassword),
  });

  await repository.save(admin);
}
