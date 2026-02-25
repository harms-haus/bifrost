import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { ReactNode } from "react";

// Mock the auth hooks
const mockAuthState = {
  session: null as {
    username: string;
    account_id: string;
    is_sysadmin: boolean;
  } | null,
  isAuthenticated: false,
  isLoading: false,
};

// Mock API client
const mockApiState = {
  getRealm: vi.fn(),
  assignRole: vi.fn(),
  revokeRole: vi.fn(),
};

vi.mock("@/lib/auth", () => ({
  useAuth: () => mockAuthState,
}));

vi.mock("@/lib/api", () => ({
  ApiClient: class MockApiClient {
    getRealm = mockApiState.getRealm;
    assignRole = mockApiState.assignRole;
    revokeRole = mockApiState.revokeRole;
  },
  ApiError: class ApiError extends Error {
    constructor(public status: number, message: string) {
      super(message);
      this.name = "ApiError";
    }
  },
}));

// Router wrapper for testing
const RouterWrapper = ({ children }: { children: ReactNode }) => (
  <div>{children}</div>
);

// Mock window.location.pathname
Object.defineProperty(window, "location", {
  value: {
    pathname: "/ui/admin/realms/realm-1",
    href: "",
    reload: vi.fn(),
  },
  writable: true,
});

// Import Page and ApiError after mocks are set up
const { Page } = await import("../+Page");
const { ApiError } = await import("@/lib/api");

// Mock data
const mockRealmDetail = {
  realm_id: "realm-1",
  name: "Production",
  status: "active" as const,
  created_at: "2024-01-01T00:00:00Z",
  members: [
    { account_id: "acct-1", username: "alice", role: "owner" },
    { account_id: "acct-2", username: "bob", role: "admin" },
    { account_id: "acct-3", username: "charlie", role: "member" },
  ],
};

describe("Realm Detail Page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuthState.session = null;
    mockAuthState.isAuthenticated = false;
    mockAuthState.isLoading = false;
    mockApiState.getRealm.mockReset();
    mockApiState.assignRole.mockReset();
    mockApiState.revokeRole.mockReset();
  });

  describe("when not authenticated", () => {
    it("shows login prompt", () => {
      render(<Page />, { wrapper: RouterWrapper });
      expect(screen.getByText(/log in/i)).toBeDefined();
    });
  });

  describe("when authenticated but not sysadmin", () => {
    beforeEach(() => {
      mockAuthState.isAuthenticated = true;
      mockAuthState.session = {
        username: "regularuser",
        account_id: "acct-regular",
        is_sysadmin: false,
      };
    });

    it("shows access denied message", () => {
      render(<Page />, { wrapper: RouterWrapper });
      expect(screen.getByText(/access denied/i)).toBeDefined();
    });
  });

  describe("when authenticated as sysadmin", () => {
    beforeEach(() => {
      mockAuthState.isAuthenticated = true;
      mockAuthState.session = {
        username: "sysadmin",
        account_id: "acct-sysadmin",
        is_sysadmin: true,
      };
      mockApiState.getRealm.mockResolvedValue(mockRealmDetail);
    });

    it("fetches realm details on mount", async () => {
      render(<Page />, { wrapper: RouterWrapper });

      await waitFor(() => {
        expect(mockApiState.getRealm).toHaveBeenCalledWith("realm-1");
      });
    });

    it("shows realm name", async () => {
      render(<Page />, { wrapper: RouterWrapper });

      await waitFor(() => {
        expect(screen.getByText("Production")).toBeDefined();
      });
    });

    it("shows realm status badge", async () => {
      render(<Page />, { wrapper: RouterWrapper });

      await waitFor(() => {
        // Status appears in multiple places, check for status section
        const statusElements = screen.getAllByText("active");
        expect(statusElements.length).toBeGreaterThan(0);
      });
    });

    it("shows members list", async () => {
      render(<Page />, { wrapper: RouterWrapper });

      await waitFor(() => {
        expect(screen.getByText("alice")).toBeDefined();
        expect(screen.getByText("bob")).toBeDefined();
        expect(screen.getByText("charlie")).toBeDefined();
      });
    });

    it("shows member roles", async () => {
      render(<Page />, { wrapper: RouterWrapper });

      await waitFor(() => {
        expect(screen.getByText("owner")).toBeDefined();
        expect(screen.getByText("admin")).toBeDefined();
        expect(screen.getByText("member")).toBeDefined();
      });
    });

    it("shows loading state while fetching", () => {
      mockApiState.getRealm.mockImplementation(() => new Promise(() => {}));
      render(<Page />, { wrapper: RouterWrapper });
      expect(screen.getByText(/loading/i)).toBeDefined();
    });

    it("shows error state on fetch failure", async () => {
      mockApiState.getRealm.mockRejectedValue(new ApiError(500, "Failed to load"));
      render(<Page />, { wrapper: RouterWrapper });

      await waitFor(() => {
        expect(screen.getByText(/error/i)).toBeDefined();
      });
    });
  });
});
