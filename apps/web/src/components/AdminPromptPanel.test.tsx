import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AdminPromptPanel } from "./AdminPromptPanel";

describe("AdminPromptPanel", () => {
  it("opens and closes like a floating chat widget", () => {
    render(<AdminPromptPanel />);

    expect(
      screen.queryByRole("heading", { name: "Prompt console" }),
    ).not.toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", { name: "Open prompt console" }),
    );

    expect(
      screen.getByRole("heading", { name: "Prompt console" }),
    ).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", { name: "Close prompt console" }),
    );

    expect(
      screen.queryByRole("heading", { name: "Prompt console" }),
    ).not.toBeInTheDocument();
  });
});
