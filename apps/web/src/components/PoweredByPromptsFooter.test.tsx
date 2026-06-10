import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PoweredByPromptsFooter } from "./PoweredByPromptsFooter";

describe("PoweredByPromptsFooter", () => {
  it("renders the powered by prompts message", () => {
    render(<PoweredByPromptsFooter />);

    expect(screen.getByRole("contentinfo")).toHaveTextContent("Powered by prompts");
  });
});
