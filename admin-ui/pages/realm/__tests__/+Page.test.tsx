import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent, act } from "@testing-library/react";
import { ReactNode } from "react";

// Mock the auth hooks
const mockAuthState = {
  session: null as {
    username: string;
    account_id: string;
    is_sysadmin: boolean;
    roles: Record<string, string>;
  } | null,
  isAuthenticated: false,
  isLoading: false,
};

const mockRealmState = {
  selectedRealm: null as string | null,
  availableRealms: [] as string[],
  setRealm: vi.fn(),
  role: null as string | null,
};

// Mock API client
const mockApiState = {
  getRealm: vi.fn(),
  assignRole: vi.fn(),
  revokeRole: vi.fn(),
  grantRealm: vi.fn(),
};
vi.mock("@/lib/auth", () => ({
  useAuth: () => mockAuthState,
  useRealm: () => mockRealmState,
}));
vi.mock("@/lib/api", () => ({
  ApiClient: class MockApiClient {
    getRealm = mockApiState.getRealm;
    assignRole = mockApiState.assignRole;
    revokeRole = mockApiState.revokeRole;
    grantRealm = mockApiState.grantRealm;
  },
}));
// Router wrapper for testing
const RouterWrapper = ({ children }: { children: ReactNode }) => (
  <div>{children}</div>
);
// Import Page after mocks are set up
const { Page } = await import("../+Page");
// Mock realm data
const mockRealmDetail = {
  realm_id: "realm-1",
  name: "Test Realm",
  status: "active" as const,
  created_at: "2024-01-01T00:00:00Z",
  members: [
    { account_id: "acct-1", username: "owner1", role: "owner" },
    { account_id: "acct-2", username: "admin1", role: "admin" },
    { account_id: "acct-3", username: "member1", role: "member" },
    { account_id: "acct-4", username: "viewer1", role: "viewer" },
  ],
};
describe("Realm Settings Page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuthState.session = null;
    mockAuthState.isAuthenticated = false;
    mockAuthState.isLoading = false;
    mockRealmState.selectedRealm = null;
    mockRealmState.availableRealms = [];
    mockRealmState.role = null;
    mockApiState.getRealm.mockReset();
    mockApiState.assignRole.mockReset();
    mockApiState.revokeRole.mockReset();
    mockApiState.grantRealm.mockReset();
  });
  describe("when not authenticated", () => {
    it("shows login prompt", () => {
    render(<Page />, { wrapper: RouterWrapper });
    expect(screen.getByText(/log in/i)).toBeDefined();
  });
  });
  describe("when authenticated but no realm selected", () => {
    beforeEach(() => {
      mockAuthState.isAuthenticated = true;
      mockAuthState.session = {
        username: "testuser",
        account_id: "acct-test",
        is_sysadmin: false,
        roles: {},
      };
      mockRealmState.selectedRealm = null;
      mockRealmState.availableRealms = [];
    });
    it("shows no realm selected message", () => {
    render(<Page />, { wrapper: RouterWrapper });
    expect(screen.getByText(/no realm selected/i)).toBeDefined();
  });
  });
  describe("when authenticated as regular member", () => {
    beforeEach(() => {
      mockAuthState.isAuthenticated = true;
      mockAuthState.session = {
        username: "testuser",
        account_id: "acct-test",
        is_sysadmin: false,
        roles: { "realm-1": "member" },
      };
      mockRealmState.selectedRealm = "realm-1";
      mockRealmState.availableRealms = ["realm-1"];
      mockRealmState.role = "member";
      mockApiState.getRealm.mockResolvedValue(mockRealmDetail);
    });
    it("shows access denied message for non-admins", async () => {
      render(<Page />, { wrapper: RouterWrapper });
      // Wait for the component to render
      await waitFor(() => {
        expect(screen.getByText(/access denied/i)).toBeDefined();
      });
    });
  });
  describe("when authenticated as realm admin", () => {
    beforeEach(() => {
      mockAuthState.isAuthenticated = true;
      mockAuthState.session = {
        username: "admin1",
        account_id: "acct-2",
        is_sysadmin: false,
        roles: { "realm-1": "admin" },
      };
      mockRealmState.selectedRealm = "realm-1";
      mockRealmState.availableRealms = ["realm-1"];
      mockRealmState.role = "admin";
      mockApiState.getRealm.mockResolvedValue(mockRealmDetail);
    });
    it("fetches realm details on mount", async () => {
      render(<Page />, { wrapper: RouterWrapper });
      await waitFor(() => {
        expect(mockApiState.getRealm).toHaveBeenCalledWith("realm-1");
      });
    });
    it("shows realm name and ID", async () => {
      render(<Page />, { wrapper: RouterWrapper });
      await waitFor(() => {
        expect(screen.getByText("Test Realm")).toBeDefined();
        expect(screen.getByText(/realm-1/i)).toBeDefined();
      });
    });
    it("shows member list", async () => {
      render(<Page />, { wrapper: RouterWrapper });
      await waitFor(() => {
        expect(screen.getByText("owner1")).toBeDefined();
        expect(screen.getByText("admin1")).toBeDefined();
        expect(screen.getByText("member1")).toBeDefined();
        expect(screen.getByText("viewer1")).toBeDefined();
      });
    });
    it("shows role badges for members", async () => {
      render(<Page />, { wrapper: RouterWrapper });
      await waitFor(() => {
        expect(screen.getByText("owner")).toBeDefined();
        expect(screen.getByText("admin")).toBeDefined();
        expect(screen.getByText("member")).toBeDefined();
        expect(screen.getByText("viewer")).toBeDefined();
      });
    });
    it("shows add member form", async () => {
      render(<Page />, { wrapper: RouterWrapper });
      await waitFor(() => {
        expect(screen.getByPlaceholderText(/username/i)).toBeDefined();
        expect(screen.getByRole("button", { name: /add member/i })).toBeDefined();
      });
    });
    it("shows loading state while fetching", () => {
      mockApiState.getRealm.mockImplementation(() => new Promise(() => {}));
      render(<Page />, { wrapper: RouterWrapper });
      expect(screen.getByText(/loading/i)).toBeDefined();
    });
  });
  describe("when authenticated as realm owner", () => {
    beforeEach(() => {
      mockAuthState.isAuthenticated = true;
      mockAuthState.session = {
        username: "owner1",
        account_id: "acct-1",
        is_sysadmin: false,
        roles: { "realm-1": "owner" },
      };
      mockRealmState.selectedRealm = "realm-1";
      mockRealmState.availableRealms = ["realm-1"];
      mockRealmState.role = "owner";
      mockApiState.getRealm.mockResolvedValue(mockRealmDetail);
    });
    it("allows access to realm settings", async () => {
      render(<Page />, { wrapper: RouterWrapper });
      await waitFor(() => {
        expect(screen.getByText("Test Realm")).toBeDefined();
      });
    });
  });
  describe("when authenticated as sysadmin", () => {
    beforeEach(() => {
      mockAuthState.isAuthenticated = true;
      mockAuthState.session = {
        username: "sysadmin",
        account_id: "acct-sysadmin",
        is_sysadmin: true,
        roles: { "realm-1": "admin" },
      };
      mockRealmState.selectedRealm = "realm-1";
      mockRealmState.availableRealms = ["realm-1"];
      mockRealmState.role = "admin";
      mockApiState.getRealm.mockResolvedValue(mockRealmDetail);
    });
    it("allows access to realm settings", async () => {
      render(<Page />, { wrapper: RouterWrapper });
      await waitFor(() => {
        expect(screen.getByText("Test Realm")).toBeDefined();
      });
    });
  });
  describe("add member functionality", () => {
    beforeEach(() => {
      mockAuthState.isAuthenticated = true;
      mockAuthState.session = {
        username: "admin1",
        account_id: "acct-2",
        is_sysadmin: false,
        roles: { "realm-1": "admin" },
      };
      mockRealmState.selectedRealm = "realm-1";
      mockRealmState.availableRealms = ["realm-1"];
      mockRealmState.role = "admin";
      mockApiState.getRealm.mockResolvedValue(mockRealmDetail);
      mockApiState.grantRealm.mockResolvedValue(undefined);
      mockApiState.assignRole.mockResolvedValue(undefined);
    });
    it("calls grantRealm when adding a new member", async () => {
      render(<Page />, { wrapper: RouterWrapper });
      await waitFor(() => {
        expect(screen.getByPlaceholderText(/username/i)).toBeDefined();
      });
      const usernameInput = screen.getByPlaceholderText(/username/i) as HTMLInputElement;
      fireEvent.change(usernameInput, { target: { value: "newuser" } });
      const addButton = screen.getByRole("button", { name: /add member/i });
      await act(async () => {
        addButton.click();
      });
      await waitFor(() => {
        expect(mockApiState.grantRealm).toHaveBeenCalled();
      });
    });
    it("shows error for empty username", async () => {
      render(<Page />, { wrapper: RouterWrapper });
      await waitFor(() => {
        expect(screen.getByPlaceholderText(/username/i)).toBeDefined();
      });
      const addButton = screen.getByRole("button", { name: /add member/i });
      await act(async () => {
        addButton.click();
      });
      expect(mockApiState.grantRealm).not.toHaveBeenCalled();
    });
  });
});
