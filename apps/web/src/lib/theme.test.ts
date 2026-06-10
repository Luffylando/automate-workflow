import { describe, expect, it, beforeEach } from "vitest";
import {
  STORAGE_KEY,
  applyThemeClass,
  persistTheme,
  readStoredTheme,
  resolveTheme,
} from "./theme";

describe("theme", () => {
  beforeEach(() => {
    document.documentElement.classList.remove("dark");
    window.localStorage.clear();
  });

  it("resolves explicit light and dark themes", () => {
    expect(resolveTheme("light")).toBe("light");
    expect(resolveTheme("dark")).toBe("dark");
  });

  it("applies and removes the dark class on the document root", () => {
    applyThemeClass("dark");
    expect(document.documentElement.classList.contains("dark")).toBe(true);

    applyThemeClass("light");
    expect(document.documentElement.classList.contains("dark")).toBe(false);
  });

  it("persists and reads theme preference", () => {
    persistTheme("dark");
    expect(window.localStorage.getItem(STORAGE_KEY)).toBe("dark");
    expect(readStoredTheme()).toBe("dark");
  });
});
