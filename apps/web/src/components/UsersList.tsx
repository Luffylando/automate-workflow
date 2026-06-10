import type { User } from "@/lib/types";

interface UsersListProps {
  users: User[];
}

export function UsersList({ users }: UsersListProps) {
  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-8">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-zinc-900">Users</h2>
        <p className="mt-1 text-zinc-600">
          Team members stored in the app database.
        </p>
      </div>

      {users.length === 0 ? (
        <p className="text-sm text-zinc-500">No users yet.</p>
      ) : (
        <ul className="divide-y divide-zinc-200 rounded-xl border border-zinc-200">
          {users.map((user) => (
            <li
              key={user.id}
              className="flex items-center justify-between gap-4 px-4 py-3"
            >
              <div>
                <p className="font-medium text-zinc-900">{user.name}</p>
                <p className="text-sm text-zinc-500">{user.email}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
