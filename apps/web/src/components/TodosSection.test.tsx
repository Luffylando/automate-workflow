import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  DASHBOARD_PANEL_HEIGHT_CLASS,
  DASHBOARD_SCROLL_AREA_CLASS,
} from "@/lib/dashboard-layout";
import type { Todo } from "@/lib/types";
import { TodosSection } from "./TodosSection";

const baseTodo: Todo = {
  id: "1",
  title: "Write tests",
  description: "Cover todo UI behavior",
  priority: "medium",
  dueDate: "2020-01-01T17:00:00.000Z",
  completed: false,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("TodosSection", () => {
  it("renders todos with priority and description", () => {
    render(<TodosSection initialTodos={[baseTodo]} />);

    expect(screen.getByRole("heading", { name: "Todos" })).toBeInTheDocument();
    expect(screen.getByText("Write tests")).toBeInTheDocument();
    expect(screen.getByText("Cover todo UI behavior")).toBeInTheDocument();
    expect(screen.getByText("Medium", { selector: "span" })).toBeInTheDocument();
    expect(screen.getByText(/Due Jan/)).toBeInTheDocument();
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
        initialTodos={[baseTodo]}
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

  it("renders compact variant with open, done, and overdue counts", () => {
    render(
      <TodosSection
        variant="compact"
        initialTodos={[
          baseTodo,
          {
            ...baseTodo,
            id: "2",
            title: "Done task",
            completed: true,
            dueDate: "2020-01-01T00:00:00.000Z",
          },
        ]}
      />,
    );

    expect(screen.getByText("1 open · 1 done · 1 overdue")).toBeInTheDocument();
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
          {
            ...baseTodo,
            averageRating: null,
            ratingCount: 0,
            myRating: null,
          },
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
        initialTodos={[
          {
            ...baseTodo,
            myRating: null,
          },
        ]}
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

  it("creates a todo with priority and description through the API", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        id: "2",
        title: "Ship feature",
        description: "Launch the new todo fields",
        priority: "high",
        dueDate: "2026-07-01T12:00:00.000Z",
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
    fireEvent.change(
      screen.getByRole("textbox", { name: "New todo description" }),
      {
        target: { value: "Launch the new todo fields" },
      },
    );
    fireEvent.change(screen.getByRole("combobox", { name: "New todo priority" }), {
      target: { value: "high" },
    });
    fireEvent.change(screen.getByLabelText("New todo due date"), {
      target: { value: "2026-07-01" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Add" }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(1);
      const [url, options] = fetchMock.mock.calls[0] as [
        string,
        { method: string; headers: Record<string, string>; body: string },
      ];
      expect(url).toBe("/api/todos");
      expect(options.method).toBe("POST");
      expect(options.headers).toEqual({ "Content-Type": "application/json" });
      expect(JSON.parse(options.body)).toEqual({
        title: "Ship feature",
        description: "Launch the new todo fields",
        priority: "high",
        dueDate: "2026-07-01T12:00:00.000Z",
      });
      expect(screen.getByText("Ship feature")).toBeInTheDocument();
      expect(screen.getByText("Launch the new todo fields")).toBeInTheDocument();
      expect(screen.getByText("High", { selector: "span" })).toBeInTheDocument();
    });
  });
});
