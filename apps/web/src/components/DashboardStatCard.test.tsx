import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { DashboardStatCard } from "./DashboardStatCard";

describe("DashboardStatCard", () => {
  it("renders label and value", () => {
    render(<DashboardStatCard label="Open tasks" value={4} />);

    expect(screen.getByText("Open tasks")).toBeInTheDocument();
    expect(screen.getByText("4")).toBeInTheDocument();
  });
});
