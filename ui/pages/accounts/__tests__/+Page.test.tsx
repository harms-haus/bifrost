import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { Page } from "../+Page";
import { useAuth } from "@/lib/auth";
import { useRealm } from "@/lib/realm";
import { useToast } from "@/lib/use-toast";
import { api, ApiError } from "@/lib/api";
import { TopNav } from "@/components/TopNav/TopNav";
import type { AccountListEntry } from "@/types";

// Mock dependencies
vi.mock("@/lib/auth");
vi.mock("@/lib/realm");
vi.mock("@/lib/use-toast");
vi.mock("@/lib/api");
vi.mock("@/components/TopNav/TopNav", () => ({
  TopNav: () => <div data-testid="topnav">TopNav</div>,
}));

describe("Accounts List Page", () => {
  const mockSession = {
    account_id: "test-account",
    username: "testuser",
    is_sysadmin: true,
  };

  const mockAccounts: AccountListEntry[] = [
    {
      account_id: "account-1",
      username: "user1",
      status: "active",
      realms: ["realm-1", "realm-2"],
      roles: { "realm-1": "admin", "realm-2": "member" },
      pat_count: 2,
      created_at: "2024-01-01T00:00:00Z",
    },
    {
      account_id: "account-2",
      username: "user2",
      status: "suspended",
      realms: ["realm-1"],
      roles: { "realm-1": "viewer" },
      pat_count: 0,
      created_at: "2024-01-02T00:00:00Z",
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAuth).mockReturnValue({
      session: mockSession,
      isAuthenticated: true,
      isLoading: false,
    });
    vi.mocked(useRealm).mockReturnValue({
      selectedRealm: "realm-1",
      role: "member",
      availableRealms: ["realm-1", "realm-2"],
      setRealm: vi.fn(),
    });
    vi.mocked(useToast).mockReturnValue({
      show: vi.fn(),
    });
    vi.mocked(api.getAccounts).mockResolvedValue(mockAccounts);
  });

  it("renders TopNav component", () => {
    render(<Page />);
    expect(screen.getByTestId("topnav")).toBeInTheDocument();
  });

  it("fetches accounts on mount", () => {
    render(<Page />);
    expect(api.getAccounts).toHaveBeenCalled();
  });

  it("shows accounts list with correct data", async () => {
    render(<Page />);

    await waitFor(() => {
      expect(screen.getByText("user1")).toBeInTheDocument();
      expect(screen.getByText("user2")).toBeInTheDocument();
    });
  });

  it("shows account status badges", async () => {
    render(<Page />);

    await waitFor(() => {
      const activeBadge = screen.getByText("active");
      const suspendedBadge = screen.getByText("suspended");
      expect(activeBadge).toBeInTheDocument();
      expect(suspendedBadge).toBeInTheDocument();
    });
  });

  it("shows loading state while fetching", () => {
    vi.mocked(api.getAccounts).mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    render(<Page />);

    expect(screen.getByText(/Loading accounts.../i)).toBeInTheDocument();
  });

  it("shows error message when API fails", async () => {
    vi.clearAllMocks();
    vi.mocked(useAuth).mockReturnValue({
      session: mockSession,
      isAuthenticated: true,
      isLoading: false,
    });
    vi.mocked(useRealm).mockReturnValue({
      selectedRealm: "realm-1",
      role: "member",
      availableRealms: ["realm-1", "realm-2"],
      setRealm: vi.fn(),
    });
    vi.mocked(useToast).mockReturnValue({
      show: vi.fn(),
    });
    vi.mocked(api.getAccounts).mockRejectedValue(
      new ApiError(500, "Server error")
    );

    render(<Page />);

    await waitFor(() => {
      expect(screen.getByText(/Server error/i)).toBeInTheDocument();
    });
  });

  it("shows empty state when no accounts exist", async () => {
    vi.mocked(api.getAccounts).mockResolvedValue([]);

    render(<Page />);

    await waitFor(() => {
      expect(
        screen.getByText(/No accounts found/i)
      ).toBeInTheDocument();
    });
  });

  it("shows not authenticated state when not logged in", () => {
    vi.mocked(useAuth).mockReturnValue({
      session: null,
      isAuthenticated: false,
      isLoading: false,
    });

    render(<Page />);

    expect(screen.getByText(/Please log in/i)).toBeInTheDocument();
  });

  it("shows access denied when not a sysadmin", () => {
    vi.mocked(useAuth).mockReturnValue({
      session: { ...mockSession, is_sysadmin: false },
      isAuthenticated: true,
      isLoading: false,
    });

    render(<Page />);

    expect(screen.getByText(/Access Denied/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Only system administrators can access this page/i)
    ).toBeInTheDocument();
  });

  it("renders accounts table with correct headers", async () => {
    render(<Page />);

    await waitFor(() => {
      expect(screen.getByText(/Username/i)).toBeInTheDocument();
      const realmsHeaders = screen.getAllByText(/Realms/i);
      expect(realmsHeaders).toHaveLength(3); // subtitle, filter option, table header
      expect(screen.getByText(/Status/i)).toBeInTheDocument();
      expect(screen.getByText(/Created/i)).toBeInTheDocument();
    });
  });

  it("displays account realms as comma-separated list", async () => {
    render(<Page />);

    await waitFor(() => {
      expect(screen.getByText(/realm-1, realm-2/i)).toBeInTheDocument();
    });
  });

  it("displays formatted creation date", async () => {
    render(<Page />);

    await waitFor(() => {
      // Date is formatted to locale string
      expect(screen.getByText(/Jan 1, 2024/i)).toBeInTheDocument();
    });
  });
});
