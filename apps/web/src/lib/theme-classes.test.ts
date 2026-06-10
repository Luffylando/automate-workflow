import { describe, expect, it } from "vitest";
import {
  HEADER_BAR_CLASS,
  PANEL_COMPACT_CLASS,
  STATUS_BADGE_CLASSES,
} from "./theme-classes";

describe("theme-classes", () => {
  it("uses semantic surface and border tokens for shared layout classes", () => {
    expect(HEADER_BAR_CLASS).toContain("bg-surface");
    expect(HEADER_BAR_CLASS).toContain("border-border");
    expect(PANEL_COMPACT_CLASS).toContain("bg-surface");
    expect(PANEL_COMPACT_CLASS).toContain("border-border");
  });

  it("includes dark variants for status badges", () => {
    for (const className of Object.values(STATUS_BADGE_CLASSES)) {
      expect(className).toContain("dark:");
    }
  });
});
