import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { TodosSection } from "./TodosSection";

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("TodosSection", () => {
  it("renders todos", () => {
    render(
      <TodosSection
        initialTodos={[
          {
            id: "1",
            title: "Write tests",
            completed: false,
            createdAt: "2026-01-01T00:00:00.000Z",
            updatedAt: "2026-01-01T00:00:00.000Z",
          },
        ]}
      />,
    );

    expect(screen.getByRole("heading", { name: "Todos" })).toBeInTheDocument();
    expect(screen.getByText("Write tests")).toBeInTheDocument();
  });

  it("shows a message when there are no todos", () => {
    render(<TodosSection initialTodos={[]} />);

    expect(screen.getByText("No todos yet.")).toBeInTheDocument();
  });

  it("renders compact variant with open and done counts", () => {
    render(
      <TodosSection
        variant="compact"
        initialTodos={[
          {
            id: "1",
            title: "Open task",
            completed: false,
            createdAt: "2026-01-01T00:00:00.000Z",
            updatedAt: "2026-01-01T00:00:00.000Z",
          },
          {
            id: "2",
            title: "Done task",
            completed: true,
            createdAt: "2026-01-01T00:00:00.000Z",
            updatedAt: "2026-01-01T00:00:00.000Z",
          },
        ]}
      />,
    );

    expect(screen.getByText("1 open · 1 done")).toBeInTheDocument();
  });

  it("creates a todo through the API", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        id: "2",
        title: "Ship feature",
        completed: false,
        createdAt: "2026-01-02T00:00:00.000Z",
        updatedAt: "2026-01-02T00:00:00.000Z",
      }),
    });
    vi.stubGlobal("fetch", fetchMock);

    render(<TodosSection initialTodos={[]} />);

    fireEvent.change(screen.getByRole("textbox", { name: "New todo title" }), {
      target: { value: "Ship feature" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Add" }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith("/api/todos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "Ship feature" }),
      });
      expect(screen.getByText("Ship feature")).toBeInTheDocument();
    });
  });
});
