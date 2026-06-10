import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, beforeEach } from "vitest";
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

  it("toggles the dark class on the document root", () => {
    renderWithTheme();

    expect(document.documentElement.classList.contains("dark")).toBe(false);

    fireEvent.click(
      screen.getByRole("button", { name: "Switch to dark theme" }),
    );

    expect(document.documentElement.classList.contains("dark")).toBe(true);
    expect(window.localStorage.getItem("aw-theme")).toBe("dark");

    fireEvent.click(
      screen.getByRole("button", { name: "Switch to light theme" }),
    );

    expect(document.documentElement.classList.contains("dark")).toBe(false);
    expect(window.localStorage.getItem("aw-theme")).toBe("light");
  });
});
