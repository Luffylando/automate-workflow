import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { ThemeProvider } from "./ThemeProvider";
import { ThemeToggle } from "./ThemeToggle";

function renderWithTheme() {
  return render(
    <ThemeProvider>
      <ThemeToggle />
    </ThemeProvider>,
  );
}

describe("ThemeToggle", () => {
  beforeEach(() => {
    document.documentElement.classList.remove("dark");
    window.localStorage.clear();
  });

  afterEach(() => {
    cleanup();
    document.documentElement.classList.remove("dark");
  });

  it("toggles the dark class on the document root", () => {
    renderWithTheme();

    expect(document.documentElement.classList.contains("dark")).toBe(false);
    expect(screen.getByText("Dark")).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", { name: "Switch to dark theme" }),
    );

    expect(document.documentElement.classList.contains("dark")).toBe(true);
    expect(window.localStorage.getItem("aw-theme")).toBe("dark");
    expect(screen.getByText("Light")).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", { name: "Switch to light theme" }),
    );

    expect(document.documentElement.classList.contains("dark")).toBe(false);
    expect(window.localStorage.getItem("aw-theme")).toBe("light");
    expect(screen.getByText("Dark")).toBeInTheDocument();
  });

  it("keeps the dark class when React mutates the html class attribute", async () => {
    renderWithTheme();

    fireEvent.click(
      screen.getByRole("button", { name: "Switch to dark theme" }),
    );

    document.documentElement.className = "font-vars h-full antialiased";

    await waitFor(() => {
      expect(document.documentElement.classList.contains("dark")).toBe(true);
    });
  });
});
