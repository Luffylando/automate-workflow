import { getAdminById } from "./admins";
import { getUserById } from "./users";

export async function lookupSubmitterEmail(
  submittedById: string,
): Promise<string | undefined> {
  const user = await getUserById(submittedById);
  if (user?.email.trim()) {
    return user.email.trim();
  }

  const admin = await getAdminById(submittedById);
  if (admin?.email.trim()) {
    return admin.email.trim();
  }

  return undefined;
}

export async function lookupSubmitterEmailsByIds(
  submittedByIds: string[],
): Promise<Map<string, string>> {
  const emails = new Map<string, string>();

  await Promise.all(
    submittedByIds.map(async (id) => {
      const email = await lookupSubmitterEmail(id);
      if (email) {
        emails.set(id, email);
      }
    }),
  );

  return emails;
}

export async function resolveSubmitterEmail(
  submittedById: string | null | undefined,
  submittedByEmail: string | null | undefined,
): Promise<string | undefined> {
  const trimmedEmail = submittedByEmail?.trim();
  if (trimmedEmail) {
    return trimmedEmail;
  }

  if (!submittedById) {
    return undefined;
  }

  return lookupSubmitterEmail(submittedById);
}
