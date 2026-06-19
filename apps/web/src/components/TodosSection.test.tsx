import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  DASHBOARD_PANEL_HEIGHT_CLASS,
  DASHBOARD_SCROLL_AREA_CLASS,
} from "@/lib/dashboard-layout";
import type { Todo } from "@/lib/types";
import { TodosSection } from "./TodosSection";

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

function sampleTodo(overrides: Partial<Todo> = {}): Todo {
  return {
    id: "1",
    title: "Write tests",
    completed: false,
    priority: "medium",
    status: "todo",
    dueDate: null,
    tags: [],
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("TodosSection", () => {
  it("renders todos with metadata badges", () => {
    render(
      <TodosSection
        initialTodos={[
          sampleTodo({
            priority: "high",
            status: "in_progress",
            dueDate: "2026-12-31T12:00:00.000Z",
            tags: ["testing"],
          }),
        ]}
      />,
    );

    expect(screen.getByRole("heading", { name: "Todos" })).toBeInTheDocument();
    expect(screen.getByText("Write tests")).toBeInTheDocument();
    expect(screen.getByText("High")).toBeInTheDocument();
    expect(screen.getByText("In progress")).toBeInTheDocument();
    expect(screen.getByText("#testing")).toBeInTheDocument();
  });

  it("shows a message when there are no todos", () => {
    render(<TodosSection initialTodos={[]} />);

    expect(screen.getByText("No todos yet.")).toBeInTheDocument();
  });

  it("uses a fixed-height scrollable panel on the dashboard", () => {
    const { container } = render(
      <TodosSection
        variant="compact"
        fixedHeight
        initialTodos={[sampleTodo({ title: "Scrollable task" })]}
      />,
    );

    const panel = container.querySelector("section");
    const scrollArea = panel?.querySelector("div.overflow-y-auto");

    expect(panel?.className).toContain(DASHBOARD_PANEL_HEIGHT_CLASS);
    expect(scrollArea).not.toBeNull();
    for (const className of DASHBOARD_SCROLL_AREA_CLASS.split(" ")) {
      expect(scrollArea?.className).toContain(className);
    }
  });

  it("renders compact variant with open and done counts", () => {
    render(
      <TodosSection
        variant="compact"
        initialTodos={[
          sampleTodo({ id: "1", title: "Open task", status: "todo" }),
          sampleTodo({
            id: "2",
            title: "Done task",
            completed: true,
            status: "done",
          }),
        ]}
      />,
    );

    expect(screen.getByText("1 open · 1 done")).toBeInTheDocument();
  });

  it("rates a todo when rating is enabled", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ value: 4 }),
    });
    vi.stubGlobal("fetch", fetchMock);

    render(
      <TodosSection
        canRate
        initialTodos={[
          sampleTodo({
            averageRating: null,
            ratingCount: 0,
            myRating: null,
          }),
        ]}
      />,
    );

    fireEvent.click(
      screen.getByRole("button", { name: "Rate Write tests 4 stars" }),
    );

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith("/api/todos/1/ratings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value: 4 }),
      });
      expect(screen.getByText("You rated 4 ★")).toBeInTheDocument();
    });
  });

  it("shows an error when the user already rated a todo", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 409,
      json: async () => ({ error: "You have already rated this todo" }),
    });
    vi.stubGlobal("fetch", fetchMock);

    render(
      <TodosSection
        canRate
        initialTodos={[sampleTodo({ myRating: null })]}
      />,
    );

    fireEvent.click(
      screen.getByRole("button", { name: "Rate Write tests 5 stars" }),
    );

    await waitFor(() => {
      expect(
        screen.getByText("You have already rated this todo"),
      ).toBeInTheDocument();
    });
  });

  it("creates a todo through the API", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () =>
        sampleTodo({
          id: "2",
          title: "Ship feature",
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
        body: JSON.stringify({ title: "Ship feature", priority: "medium" }),
      });
      expect(screen.getByText("Ship feature")).toBeInTheDocument();
    });
  });
});
