import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { UsersList } from "./UsersList";

describe("UsersList", () => {
  it("renders user names and emails", () => {
    render(
      <UsersList
        users={[
          {
            id: "1",
            name: "Alex Rivera",
            email: "alex@example.com",
            createdAt: "2026-01-01T00:00:00.000Z",
          },
          {
            id: "2",
            name: "Jordan Lee",
            email: "jordan@example.com",
            createdAt: "2026-01-01T00:00:00.000Z",
          },
        ]}
      />,
    );

    expect(screen.getByRole("heading", { name: "Users" })).toBeInTheDocument();
    expect(screen.getByText("Alex Rivera")).toBeInTheDocument();
    expect(screen.getByText("alex@example.com")).toBeInTheDocument();
    expect(screen.getByText("Jordan Lee")).toBeInTheDocument();
    expect(screen.getByText("jordan@example.com")).toBeInTheDocument();
  });

  it("shows a message when there are no users", () => {
    render(<UsersList users={[]} />);

    expect(screen.getByText("No users yet.")).toBeInTheDocument();
  });
});
