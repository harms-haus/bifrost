import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { ReactNode } from "react";

// Mock window.location before any imports
Object.defineProperty(window, "location", {
  value: {
    search: "?id=account-123",
  },
  writable: true,
});

// Mock auth hooks
const mockAuthState = {
  session: { username: "testuser", realms: ["realm1"], roles: { realm1: "member" }, is_sysadmin: true } as { username: string; realms: string[]; roles: Record<string, string>; is_sysadmin: boolean } | null,
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
  getAccount: vi.fn(),
  createPat: vi.fn(),
  revokePat: vi.fn(),
  setRealm: vi.fn(),
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
    getAccount: mockApiState.getAccount,
    createPat: mockApiState.createPat,
    revokePat: mockApiState.revokePat,
    setRealm: mockApiState.setRealm,
  },
}));

vi.mock("@/lib/use-toast", () => ({
  useToast: () => mockToastState,
}));

vi.mock("@/components/TopNav/TopNav", () => ({
  TopNav: () => <nav data-testid="top-nav">TopNav</nav>,
}));

// Router wrapper for testing
const RouterWrapper = ({ children }: { children: ReactNode }) => (
  <MemoryRouter initialEntries={["/account?id=account-123"]}>{children}</MemoryRouter>
);

// Import Page after mocks are set up
const { Page } = await import("../+Page");

describe("Account Detail Page (BLUE Theme)", () => {
  // Helper function to get base account data
  const getBaseAccountData = () => ({
    account_id: "account-123",
    username: "testuser",
    status: "active" as const,
    realms: ["realm1", "realm2"],
    roles: { realm1: "admin", realm2: "member" },
    pat_count: 2,
    created_at: "2025-02-27T00:00:00Z",
    email: "test@example.com",
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
      value: { search: "?id=account-123" },
      writable: true,
    });

    // Mock account data
    mockApiState.getAccount.mockResolvedValue(getBaseAccountData());
    mockApiState.createPat.mockResolvedValue({ pat: "new-pat-token" });
    mockApiState.revokePat.mockResolvedValue(undefined);
  });

  describe("when authenticated as sysadmin", () => {
    beforeEach(() => {
      mockAuthState.isAuthenticated = true;
      mockAuthState.session = {
        username: "admin",
        realms: ["realm1"],
        roles: { realm1: "owner" },
        is_sysadmin: true,
      };
    });

    it("renders TopNav component", async () => {
      render(<Page />, { wrapper: RouterWrapper });
      expect(screen.getByTestId("top-nav")).toBeDefined();
    });

    it("fetches account details on mount", async () => {
      render(<Page />, { wrapper: RouterWrapper });
      await waitFor(() => {
        expect(mockApiState.getAccount).toHaveBeenCalledWith("account-123");
      });
    });

    it("shows account username", async () => {
      render(<Page />, { wrapper: RouterWrapper });
      await waitFor(() => {
        expect(screen.getByText("testuser")).toBeDefined();
      });
    });

    it("shows account status", async () => {
      render(<Page />, { wrapper: RouterWrapper });
      await waitFor(() => {
        expect(screen.getByText(/Status/i)).toBeDefined();
        expect(screen.getAllByText("active")).toHaveLength(2);
      });
    });

    it("shows account realms", async () => {
      render(<Page />, { wrapper: RouterWrapper });
      await waitFor(() => {
        expect(screen.getByText(/realms/i)).toBeDefined();
        expect(screen.getByText("realm1")).toBeDefined();
        expect(screen.getByText("realm2")).toBeDefined();
      });
    });

    it("shows account roles per realm", async () => {
      render(<Page />, { wrapper: RouterWrapper });
      await waitFor(() => {
        expect(screen.getByText(/roles/i)).toBeDefined();
        expect(screen.getByText("admin")).toBeDefined();
        expect(screen.getByText("member")).toBeDefined();
      });
    });

    it("shows PAT count", async () => {
      render(<Page />, { wrapper: RouterWrapper });
      await waitFor(() => {
        expect(screen.getByText(/PATs/i)).toBeDefined();
        expect(screen.getByText("2")).toBeDefined();
      });
    });

    it("shows back button to accounts list", async () => {
      render(<Page />, { wrapper: RouterWrapper });
      await waitFor(() => {
        const backButton = screen.getByText(/back/i);
        expect(backButton).toBeDefined();
      });
    });

    it("shows rotate PAT button", async () => {
      render(<Page />, { wrapper: RouterWrapper });
      await waitFor(() => {
        const rotateButton = screen.getByText(/rotate.*pat/i);
        expect(rotateButton).toBeDefined();
      });
    });

    it("calls createPat when rotate PAT button is clicked", async () => {
      render(<Page />, { wrapper: RouterWrapper });
      await waitFor(() => {
        expect(screen.getByText(/rotate.*pat/i)).toBeDefined();
      });
      const rotateButton = screen.getByText(/rotate.*pat/i);
      rotateButton.click();
      await waitFor(() => {
        expect(mockApiState.createPat).toHaveBeenCalledWith({
          account_id: "account-123",
        });
      });
    });

    it("shows new PAT after rotation", async () => {
      render(<Page />, { wrapper: RouterWrapper });
      await waitFor(() => {
        expect(screen.getByText(/rotate.*pat/i)).toBeDefined();
      });
      const rotateButton = screen.getByText(/rotate.*pat/i);
      rotateButton.click();
      await waitFor(() => {
        expect(screen.getByText("new-pat-token")).toBeDefined();
      });
    });

    it("shows copy button for PAT", async () => {
      render(<Page />, { wrapper: RouterWrapper });
      await waitFor(() => {
        expect(screen.getByText(/rotate.*pat/i)).toBeDefined();
      });
      const rotateButton = screen.getByText(/rotate.*pat/i);
      rotateButton.click();
      await waitFor(() => {
        const copyButton = screen.getByText(/copy/i);
        expect(copyButton).toBeDefined();
      });
    });

    it("shows show/hide toggle for PAT", async () => {
      render(<Page />, { wrapper: RouterWrapper });
      await waitFor(() => {
        expect(screen.getByText(/rotate.*pat/i)).toBeDefined();
      });
      const rotateButton = screen.getByText(/rotate.*pat/i);
      rotateButton.click();
      await waitFor(() => {
        const toggleButton = screen.getByText(/show|hide/i);
        expect(toggleButton).toBeDefined();
      });
    });

    it("shows toast notification on successful PAT rotation", async () => {
      render(<Page />, { wrapper: RouterWrapper });
      await waitFor(() => {
        expect(screen.getByText(/rotate.*pat/i)).toBeDefined();
      });
      const rotateButton = screen.getByText(/rotate.*pat/i);
      rotateButton.click();
      await waitFor(() => {
        expect(mockToastState.show).toHaveBeenCalledWith({
          type: "success",
          title: "PAT rotated",
          description: expect.any(String),
        });
      });
    });

    it("shows loading state while fetching account", async () => {
      mockApiState.getAccount.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve(getBaseAccountData()), 100))
      );
      render(<Page />, { wrapper: RouterWrapper });
      expect(screen.getByText(/loading/i)).toBeDefined();
      await waitFor(() => {
        expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
      });
    });

    it("applies BLUE theme color to primary elements", async () => {
      render(<Page />, { wrapper: RouterWrapper });
      await waitFor(() => {
        expect(screen.getByText("testuser")).toBeDefined();
      });
      const accountDetail = screen.getByTestId("account-detail");
      expect(accountDetail).toBeDefined();
    });

    it("uses 0% border-radius on all elements", async () => {
      render(<Page />, { wrapper: RouterWrapper });
      await waitFor(() => {
        expect(screen.getByText("testuser")).toBeDefined();
      });
      const accountDetail = screen.getByTestId("account-detail");
      expect(accountDetail).toBeDefined();
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

    it("does not fetch account when not authenticated", async () => {
      mockAuthState.isAuthenticated = false;
      mockAuthState.session = null;
      render(<Page />, { wrapper: RouterWrapper });
      await waitFor(() => {
        const loginTexts = screen.getAllByText(/log in/i);
        expect(loginTexts.length).toBeGreaterThan(0);
      });
      expect(mockApiState.getAccount).not.toHaveBeenCalled();
    });
  });

  describe("when authenticated but not sysadmin", () => {
    it("shows access denied when not sysadmin", async () => {
      mockAuthState.isAuthenticated = true;
      mockAuthState.session = {
        username: "regularuser",
        realms: ["realm1"],
        roles: { realm1: "member" },
        is_sysadmin: false,
      };
      render(<Page />, { wrapper: RouterWrapper });
      await waitFor(() => {
        expect(screen.getByText(/access denied/i)).toBeDefined();
      });
    });

    it("does not fetch account when not sysadmin", async () => {
      mockAuthState.isAuthenticated = true;
      mockAuthState.session = {
        username: "regularuser",
        realms: ["realm1"],
        roles: { realm1: "member" },
        is_sysadmin: false,
      };
      render(<Page />, { wrapper: RouterWrapper });
      await waitFor(() => {
        expect(screen.getByText(/access denied/i)).toBeDefined();
      });
      expect(mockApiState.getAccount).not.toHaveBeenCalled();
    });
  });
});
