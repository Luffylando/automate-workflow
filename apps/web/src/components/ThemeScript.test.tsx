import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ThemeScript } from "./ThemeScript";

describe("ThemeScript", () => {
  it("does not render a script element on the client", () => {
    const { container } = render(<ThemeScript />);

    expect(container.querySelector("script")).toBeNull();
  });
});
