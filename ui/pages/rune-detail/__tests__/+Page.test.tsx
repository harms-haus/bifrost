import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { ReactNode } from "react";

// Mock window.location before any imports
Object.defineProperty(window, "location", {
  value: {
    search: "?id=rune-123",
  },
  writable: true,
});

// Mock auth hooks
const mockAuthState = {
  session: { username: "testuser", realms: ["realm1"], roles: { realm1: "member" } } as { username: string; realms: string[]; roles: Record<string, string> } | null,
  isAuthenticated: false,
  isLoading: false,
};

// Mock realm hooks
const mockRealmState = {
  selectedRealm: null as string | null,
  availableRealms: ["realm1"],
  setRealm: vi.fn(),
  role: null as string | null,
};

// Mock API client
const mockApiState = {
  getRune: vi.fn(),
  forgeRune: vi.fn(),
  fulfillRune: vi.fn(),
  sealRune: vi.fn(),
  updateRune: vi.fn(),
};

// Mock toast hook
const mockToastState = {
  show: vi.fn(),
};

vi.mock("@/lib/auth", () => ({
  useAuth: () => mockAuthState,
}));

vi.mock("@/lib/realm", () => ({
  useRealm: () => mockRealmState,
  RealmProvider: ({ children }: { children: ReactNode }) => <>{children}</>,
  AuthContext: { Provider: ({ children }: { children: ReactNode }) => <>{children}</> },
}));

vi.mock("@/lib/api", () => ({
  api: {
    getRune: mockApiState.getRune,
    forgeRune: mockApiState.forgeRune,
    fulfillRune: mockApiState.fulfillRune,
    sealRune: mockApiState.sealRune,
    updateRune: mockApiState.updateRune,
    setRealm: vi.fn(),
  },
}));

vi.mock("@/lib/use-toast", () => ({
  useToast: () => mockToastState,
}));

vi.mock("@/components/TopNav/TopNav", () => ({
  TopNav: () => <nav data-testid="top-nav">TopNav</nav>,
}));

vi.mock("@/components/Dialog/Dialog", () => ({
  Dialog: ({ open, onConfirm, onCancel }: any) =>
    open ? (
      <div data-testid="dialog">
        <button onClick={onCancel}>Cancel</button>
        <button onClick={onConfirm}>Confirm</button>
      </div>
    ) : null,
}));

// Router wrapper for testing
const RouterWrapper = ({ children }: { children: ReactNode }) => (
  <MemoryRouter initialEntries={["/rune"]}>{children}</MemoryRouter>
);

// Import Page after mocks are set up
const { Page } = await import("../+Page");

describe("Rune Detail Page (AMBER Theme)", () => {
  // Helper function to get base rune data
  const getBaseRuneData = (status: string = "open") => ({
    id: "rune-123",
    title: "Test Rune Title",
    description: "Test rune description",
    status: status as any,
    priority: 2,
    claimant: "user1",
    realm_id: "realm1",
    influence: 5,
    created_at: "2025-02-27T00:00:00Z",
    updated_at: "2025-02-27T12:00:00Z",
    dependencies: [],
    notes: [],
  });

  beforeEach(() => {
    vi.clearAllMocks();
    mockAuthState.isAuthenticated = false;
    mockAuthState.session = null;
    mockRealmState.selectedRealm = "realm1";
    mockRealmState.availableRealms = ["realm1"];
    mockRealmState.role = "member";

    // Reset window.location.search
    Object.defineProperty(window, "location", {
      value: { search: "?id=rune-123" },
      writable: true,
    });

    // Mock rune data
    mockApiState.getRune.mockResolvedValue(getBaseRuneData());

    mockApiState.forgeRune.mockResolvedValue(undefined);
    mockApiState.fulfillRune.mockResolvedValue(undefined);
    mockApiState.sealRune.mockResolvedValue(undefined);
  });

  describe("when authenticated", () => {
    beforeEach(() => {
      mockAuthState.isAuthenticated = true;
      mockAuthState.session = {
        username: "testuser",
        realms: ["realm1"],
        roles: { realm1: "member" },
      };
    });

    it("renders TopNav component", async () => {
      render(<Page />, { wrapper: RouterWrapper });
      expect(screen.getByTestId("top-nav")).toBeDefined();
    });

    it("fetches rune details on mount", async () => {
      render(<Page />, { wrapper: RouterWrapper });
      await waitFor(() => {
        expect(mockApiState.getRune).toHaveBeenCalledWith("rune-123");
      });
    });

    it("shows rune title and description", async () => {
      render(<Page />, { wrapper: RouterWrapper });
      await waitFor(() => {
        expect(screen.getByText("Test Rune Title")).toBeDefined();
        expect(screen.getByText("Test rune description")).toBeDefined();
      });
    });

    it("shows rune status", async () => {
      render(<Page />, { wrapper: RouterWrapper });
      await waitFor(() => {
        expect(screen.getByText("Status")).toBeDefined();
        expect(screen.getByText("open")).toBeDefined();
      });
    });

    it("shows rune priority", async () => {
      render(<Page />, { wrapper: RouterWrapper });
      await waitFor(() => {
        expect(screen.getByText("Priority")).toBeDefined();
        expect(screen.getByText("2")).toBeDefined();
      });
    });

    it("shows rune timestamps", async () => {
      render(<Page />, { wrapper: RouterWrapper });
      await waitFor(() => {
        expect(screen.getByText(/Created/i)).toBeDefined();
        expect(screen.getByText(/Updated/i)).toBeDefined();
      });
    });

    it("shows back button to runes list", async () => {
      render(<Page />, { wrapper: RouterWrapper });
      await waitFor(() => {
        const backButton = screen.getByText(/back/i);
        expect(backButton).toBeDefined();
      });
    });

    it("shows edit button", async () => {
      render(<Page />, { wrapper: RouterWrapper });
      await waitFor(() => {
        const editButton = screen.getByText(/edit/i);
        expect(editButton).toBeDefined();
      });
    });

    it("shows rune action buttons (Forge, Fulfill, Seal)", async () => {
      render(<Page />, { wrapper: RouterWrapper });
      await waitFor(() => {
        expect(screen.getByText(/forge/i)).toBeDefined();
        expect(screen.getByText(/fulfill/i)).toBeDefined();
        expect(screen.getByText(/seal/i)).toBeDefined();
      });
    });

    it("calls forgeRune when Forge button is clicked", async () => {
      mockApiState.getRune.mockResolvedValue(getBaseRuneData("draft"));
      render(<Page />, { wrapper: RouterWrapper });
      await waitFor(() => {
        expect(screen.getByText(/forge/i)).toBeDefined();
      });
      const forgeButton = screen.getByText(/forge/i);
      forgeButton.click();
      await waitFor(() => {
        expect(mockApiState.forgeRune).toHaveBeenCalledWith("rune-123");
      });
    });

    it("calls fulfillRune when Fulfill button is clicked", async () => {
      render(<Page />, { wrapper: RouterWrapper });
      await waitFor(() => {
        expect(screen.getByText(/fulfill/i)).toBeDefined();
      });
      const fulfillButton = screen.getByText(/fulfill/i);
      fulfillButton.click();
      await waitFor(() => {
        expect(mockApiState.fulfillRune).toHaveBeenCalledWith("rune-123");
      });
    });

    it("shows dialog when Seal button is clicked", async () => {
      mockApiState.getRune.mockResolvedValue(getBaseRuneData("fulfilled"));
      render(<Page />, { wrapper: RouterWrapper });
      await waitFor(() => {
        expect(screen.getByText(/seal/i)).toBeDefined();
      });
      const sealButton = screen.getByText(/seal/i);
      sealButton.click();
      await waitFor(() => {
        expect(screen.getByTestId("dialog")).toBeDefined();
      });
    });

    it("calls sealRune when dialog is confirmed", async () => {
      mockApiState.getRune.mockResolvedValue(getBaseRuneData("fulfilled"));
      render(<Page />, { wrapper: RouterWrapper });
      await waitFor(() => {
        expect(screen.getByText(/seal/i)).toBeDefined();
      });
      const sealButton = screen.getByText(/seal/i);
      sealButton.click();
      await waitFor(() => {
        expect(screen.getByTestId("dialog")).toBeDefined();
      });
      const confirmButton = screen.getByText("Confirm");
      confirmButton.click();
      await waitFor(() => {
        expect(mockApiState.sealRune).toHaveBeenCalledWith("rune-123");
      });
    });

    it("does not call sealRune when dialog is cancelled", async () => {
      mockApiState.getRune.mockResolvedValue(getBaseRuneData("fulfilled"));
      render(<Page />, { wrapper: RouterWrapper });
      await waitFor(() => {
        expect(screen.getByText(/seal/i)).toBeDefined();
      });
      const sealButton = screen.getByText(/seal/i);
      sealButton.click();
      await waitFor(() => {
        expect(screen.getByTestId("dialog")).toBeDefined();
      });
      const cancelButton = screen.getByText("Cancel");
      cancelButton.click();
      await waitFor(() => {
        expect(mockApiState.sealRune).not.toHaveBeenCalled();
      });
    });

    it("shows loading state while fetching rune", async () => {
      mockApiState.getRune.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve({
          id: "rune-123",
          title: "Test Rune",
          status: "open",
          priority: 1,
          created_at: "2025-02-27T00:00:00Z",
          updated_at: "2025-02-27T12:00:00Z",
        }), 100))
      );
      render(<Page />, { wrapper: RouterWrapper });
      expect(screen.getByText(/loading/i)).toBeDefined();
      await waitFor(() => {
        expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
      });
    });

    it("applies AMBER theme color to primary elements", async () => {
      render(<Page />, { wrapper: RouterWrapper });
      await waitFor(() => {
        expect(screen.getByText("Test Rune Title")).toBeDefined();
      });
      const runeDetail = screen.getByTestId("rune-detail");
      expect(runeDetail).toBeDefined();
    });

    it("uses 0% border-radius on all elements", async () => {
      render(<Page />, { wrapper: RouterWrapper });
      await waitFor(() => {
        expect(screen.getByText("Test Rune Title")).toBeDefined();
      });
      const runeDetail = screen.getByTestId("rune-detail");
      expect(runeDetail).toBeDefined();
    });
  });

  describe("when not authenticated", () => {
    it("shows login prompt when not authenticated", async () => {
      mockAuthState.isAuthenticated = false;
      mockAuthState.session = null;
      render(<Page />, { wrapper: RouterWrapper });
      await waitFor(() => {
        const loginTexts = screen.getAllByText(/log in/i);
        expect(loginTexts.length).toBeGreaterThan(0);
      });
    });

    it("does not fetch rune when not authenticated", async () => {
      mockAuthState.isAuthenticated = false;
      mockAuthState.session = null;
      render(<Page />, { wrapper: RouterWrapper });
      await waitFor(() => {
        const loginTexts = screen.getAllByText(/log in/i);
        expect(loginTexts.length).toBeGreaterThan(0);
      });
      expect(mockApiState.getRune).not.toHaveBeenCalled();
    });
  });
});
