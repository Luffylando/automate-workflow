import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { UsersSection } from "./UsersSection";

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("UsersSection", () => {
  it("renders users", () => {
    render(
      <UsersSection
        initialUsers={[
          {
            id: "1",
            name: "Alex Rivera",
            email: "alex@example.com",
            role: "user",
            createdAt: "2026-01-01T00:00:00.000Z",
          },
        ]}
      />,
    );

    expect(screen.getByRole("heading", { name: "Users" })).toBeInTheDocument();
    expect(screen.getByText("Alex Rivera")).toBeInTheDocument();
    expect(screen.getByText("alex@example.com")).toBeInTheDocument();
  });

  it("shows a message when there are no users", () => {
    render(<UsersSection initialUsers={[]} />);

    expect(screen.getByText("No users yet.")).toBeInTheDocument();
  });

  it("creates a user through the API", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        id: "2",
        name: "Jordan Lee",
        email: "jordan@example.com",
        role: "admin",
        createdAt: "2026-01-02T00:00:00.000Z",
      }),
    });
    vi.stubGlobal("fetch", fetchMock);

    render(<UsersSection initialUsers={[]} />);

    fireEvent.change(screen.getByRole("textbox", { name: "New user name" }), {
      target: { value: "Jordan Lee" },
    });
    fireEvent.change(screen.getByRole("textbox", { name: "New user email" }), {
      target: { value: "jordan@example.com" },
    });
    fireEvent.change(screen.getByRole("combobox", { name: "New user role" }), {
      target: { value: "admin" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Create user" }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Jordan Lee",
          email: "jordan@example.com",
          role: "admin",
        }),
      });
      expect(screen.getByText("Jordan Lee")).toBeInTheDocument();
    });
  });
});
