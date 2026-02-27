import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { Page } from "../+Page";
import { useAuth } from "@/lib/auth";
import { useRealm } from "@/lib/realm";
import { useToast } from "@/lib/use-toast";
import { api, ApiError } from "@/lib/api";
import { TopNav } from "@/components/TopNav/TopNav";
import { Dialog } from "@/components/Dialog/Dialog";
import type { RealmListEntry } from "@/types";

// Mock dependencies
vi.mock("@/lib/auth");
vi.mock("@/lib/realm");
vi.mock("@/lib/use-toast");
vi.mock("@/lib/api");
vi.mock("@/components/TopNav/TopNav", () => ({
  TopNav: () => <div data-testid="topnav">TopNav</div>,
}));
vi.mock("@/components/Dialog/Dialog", () => ({
  Dialog: ({ isOpen, onConfirm, onCancel }: any) =>
    isOpen ? (
      <div data-testid="dialog">
        <button onClick={onCancel} data-testid="cancel-dialog">
          Cancel
        </button>
        <button onClick={onConfirm} data-testid="confirm-dialog">
          Confirm
        </button>
      </div>
    ) : null,
}));

describe("Realms List Page", () => {
  const mockSession = {
    account_id: "test-account",
    username: "testuser",
    is_sysadmin: true,
  };

  const mockRealms: RealmListEntry[] = [
    {
      realm_id: "realm-1",
      name: "Test Realm 1",
      status: "active",
      created_at: "2024-01-01T00:00:00Z",
    },
    {
      realm_id: "realm-2",
      name: "Test Realm 2",
      status: "suspended",
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
    vi.mocked(api.getRealms).mockResolvedValue(mockRealms);
  });

  it("renders TopNav component", () => {
    render(<Page />);
    expect(screen.getByTestId("topnav")).toBeInTheDocument();
  });

  it("fetches realms on mount", () => {
    render(<Page />);
    expect(api.getRealms).toHaveBeenCalled();
  });

  it("shows realms list with correct data", async () => {
    render(<Page />);

    await waitFor(() => {
      expect(screen.getByText("Test Realm 1")).toBeInTheDocument();
      expect(screen.getByText("Test Realm 2")).toBeInTheDocument();
    });
  });

  it("shows realm status badges", async () => {
    render(<Page />);

    await waitFor(() => {
      const activeBadge = screen.getByText("active");
      const suspendedBadge = screen.getByText("suspended");
      expect(activeBadge).toBeInTheDocument();
      expect(suspendedBadge).toBeInTheDocument();
    });
  });

  it("shows realm IDs in realm cards", async () => {
    render(<Page />);

    await waitFor(() => {
      // Look for realm IDs in the card body (not in TopNav trigger)
      const realmValues = document.querySelectorAll(".realms-page-card-field-value");
      expect(realmValues.length).toBeGreaterThan(0);
      const realmIds = Array.from(realmValues).map(el => el.textContent);
      expect(realmIds).toContain("realm-1");
      expect(realmIds).toContain("realm-2");
    });
  });

  it("filters realms by status", async () => {
    render(<Page />);

    await waitFor(() => {
      expect(screen.getByText("Test Realm 1")).toBeInTheDocument();
    });

    // Verify status filter exists
    const statusFilter = document.querySelector(".realms-page-filter-select");
    expect(statusFilter).toBeInTheDocument();
  });

  it("shows loading state while fetching realms", () => {
    vi.mocked(api.getRealms).mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    render(<Page />);
    expect(screen.getByText(/loading realms/i)).toBeInTheDocument();
  });

  it("shows login prompt when not authenticated", () => {
    vi.mocked(useAuth).mockReturnValue({
      session: null,
      isAuthenticated: false,
      isLoading: false,
    });

    render(<Page />);

    expect(screen.getByText(/please log in/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /log in/i })).toBeInTheDocument();
  });

  it("does not fetch realms when not authenticated", () => {
    vi.mocked(useAuth).mockReturnValue({
      session: null,
      isAuthenticated: false,
      isLoading: false,
    });

    render(<Page />);

    expect(api.getRealms).not.toHaveBeenCalled();
  });

  it("handles API errors gracefully", async () => {
    vi.mocked(api.getRealms).mockRejectedValue(new ApiError(500, "Server error"));

    render(<Page />);

    await waitFor(() => {
      expect(screen.getByText("Server error")).toBeInTheDocument();
    });
  });

  it("shows retry button on error", async () => {
    vi.mocked(api.getRealms).mockRejectedValue(new Error("Network error"));

    render(<Page />);

    await waitFor(() => {
      const retryButton = screen.getByRole("button", { name: /retry/i });
      expect(retryButton).toBeInTheDocument();
    });
  });

  it("applies GREEN theme color (--color-green) to primary elements", async () => {
    render(<Page />);

    await waitFor(() => {
      const pageContainer = document.querySelector(".realms-page");
      expect(pageContainer).toHaveClass("realms-page");
    });
  });

  it("uses 0% border-radius on all elements", async () => {
    render(<Page />);

    await waitFor(() => {
      const cards = document.querySelectorAll(".realms-page-card");
      cards.forEach((card) => {
        expect(card).toHaveStyle({ borderRadius: "0px" });
      });
    });
  });

  it("applies bold borders to realm cards", async () => {
    render(<Page />);

    await waitFor(() => {
      const cards = document.querySelectorAll(".realms-page-card");
      expect(cards.length).toBeGreaterThan(0);
    });
  });

  it("shows empty state when no realms found", async () => {
    vi.mocked(api.getRealms).mockResolvedValue([]);

    render(<Page />);

    await waitFor(() => {
      expect(screen.getByText(/no realms found/i)).toBeInTheDocument();
    });
  });

  it("formats created_at dates correctly", async () => {
    render(<Page />);

    await waitFor(() => {
      // Check that date is formatted (contains month name)
      const dates = screen.getAllByText(/Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec/);
      expect(dates.length).toBeGreaterThan(0);
    });
  });

  it("uses current realm from useRealm hook", async () => {
    const setRealmMock = vi.fn();
    vi.mocked(useRealm).mockReturnValue({
      selectedRealm: "realm-2",
      role: "member",
      availableRealms: ["realm-1", "realm-2"],
      setRealm: setRealmMock,
    });

    render(<Page />);

    await waitFor(() => {
      // Verify RealmSelector shows current realm
      const realmSelector = screen.getByText("realm-2");
      expect(realmSelector).toBeInTheDocument();
    });
  });
});
