import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("@/lib/use-toast", () => ({
  useToast: () => vi.fn(),
}));

vi.mock("@/lib/api", () => ({
  api: {
    createAccount: vi.fn(),
  },
}));

vi.mock("@/lib/realm", () => ({
  useRealm: () => ({
    selectedRealm: "test-realm",
    availableRealms: ["test-realm"],
    setRealm: vi.fn(),
    role: "member",
  }),
}));

vi.mock("@/lib/auth", () => ({
  useAuth: () => ({
    session: {
      account_id: "test-account-id",
      username: "test-user",
      is_sysadmin: true,
    },
    isAuthenticated: true,
  }),
}));

vi.mock("vike/client/router", () => ({
  navigate: vi.fn(),
}));

const { Page } = await import("../+Page");

describe("New Account Page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders page title", () => {
    render(<Page />);
    expect(screen.getByText("Create New Account")).toBeInTheDocument();
  });

  it("renders subtitle", () => {
    render(<Page />);
    expect(screen.getByText(/Enter account details and create/i)).toBeInTheDocument();
  });

  it("has container classes", () => {
    const { container } = render(<Page />);
    expect(container.querySelector(".new-account-container")).toBeInTheDocument();
  });

  it("has card classes", () => {
    const { container } = render(<Page />);
    expect(container.querySelector(".new-account-card")).toBeInTheDocument();
  });
});
