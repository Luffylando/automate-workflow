import { describe, expect, it } from "vitest";
import {
  isValidTodoPriority,
  parseOptionalDueDate,
} from "./todo-validation";

describe("todo validation", () => {
  it("accepts valid priorities", () => {
    expect(isValidTodoPriority("low")).toBe(true);
    expect(isValidTodoPriority("medium")).toBe(true);
    expect(isValidTodoPriority("high")).toBe(true);
    expect(isValidTodoPriority("urgent")).toBe(false);
  });

  it("parses optional due dates", () => {
    expect(parseOptionalDueDate(undefined)).toBeUndefined();
    expect(parseOptionalDueDate(null)).toBeNull();
    expect(parseOptionalDueDate("")).toBeNull();

    const parsed = parseOptionalDueDate("2026-06-20T12:00:00.000Z");
    expect(parsed).toBeInstanceOf(Date);
    expect(parsed?.toISOString()).toBe("2026-06-20T12:00:00.000Z");

    expect(parseOptionalDueDate("not-a-date")).toBeUndefined();
  });
});
