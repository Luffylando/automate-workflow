import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AdminPromptPanelGate } from "./AdminPromptPanelGate";

const mockGetAdminSession = vi.fn();

vi.mock("@/lib/server-api", () => ({
  getAdminSession: () => mockGetAdminSession(),
}));

describe("AdminPromptPanelGate", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the prompt console for admin sessions", async () => {
    mockGetAdminSession.mockResolvedValue({
      role: "admin",
      sub: "admin-1",
      email: "admin@example.com",
    });

    render(await AdminPromptPanelGate());

    expect(
      screen.getByRole("button", { name: "Open prompt console" }),
    ).toBeInTheDocument();
  });

  it("renders nothing for non-admin sessions", async () => {
    mockGetAdminSession.mockResolvedValue(null);

    const { container } = render(await AdminPromptPanelGate());

    expect(container).toBeEmptyDOMElement();
  });
});
