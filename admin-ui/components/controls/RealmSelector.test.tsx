import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { RealmSelector } from "./RealmSelector";

// Mock the auth hooks
const mockRealmState = {
  selectedRealm: null as string | null,
  availableRealms: [] as string[],
  setRealm: vi.fn(),
  role: null as string | null,
};

const mockAuthState = {
  session: null as { is_sysadmin: boolean } | null,
};

vi.mock("@/lib/auth", () => ({
  useRealm: () => mockRealmState,
  useAuth: () => mockAuthState,
}));

describe("RealmSelector", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRealmState.selectedRealm = null;
    mockRealmState.availableRealms = [];
    mockRealmState.role = null;
    mockAuthState.session = null;
  });

  describe("when not authenticated", () => {
    it("renders nothing when no realms available", () => {
      mockRealmState.availableRealms = [];
      mockRealmState.selectedRealm = null;

      const { container } = render(<RealmSelector />);

      expect(container.firstChild).toBeNull();
    });
  });

  describe("when authenticated with single realm", () => {
    beforeEach(() => {
      mockRealmState.availableRealms = ["realm-1"];
      mockRealmState.selectedRealm = "realm-1";
      mockRealmState.role = "member";
      mockAuthState.session = { is_sysadmin: false };
    });

    it("shows current realm", () => {
      render(<RealmSelector />);

      expect(screen.getByText("realm-1")).toBeDefined();
    });

    it("does not show dropdown for single realm", () => {
      render(<RealmSelector />);

      // Should not have a button to open dropdown
      expect(screen.queryByRole("button", { name: /select realm/i })).toBeNull();
    });
  });

  describe("when authenticated with multiple realms", () => {
    beforeEach(() => {
      mockRealmState.availableRealms = ["realm-1", "realm-2", "realm-3"];
      mockRealmState.selectedRealm = "realm-1";
      mockRealmState.role = "admin";
      mockAuthState.session = { is_sysadmin: false };
    });

    it("shows dropdown button with current realm", () => {
      render(<RealmSelector />);

      const button = screen.getByRole("button", { name: /select realm/i });
      expect(button).toBeDefined();
      expect(button.textContent).toContain("realm-1");
    });

    it("opens dropdown on click", () => {
      render(<RealmSelector />);

      const button = screen.getByRole("button", { name: /select realm/i });
      fireEvent.click(button);

      // Should show realm options
      expect(screen.getByRole("option", { name: /realm-1/i })).toBeDefined();
      expect(screen.getByRole("option", { name: /realm-2/i })).toBeDefined();
      expect(screen.getByRole("option", { name: /realm-3/i })).toBeDefined();
    });

    it("calls setRealm when selecting a different realm", () => {
      render(<RealmSelector />);

      const button = screen.getByRole("button", { name: /select realm/i });
      fireEvent.click(button);

      const option = screen.getByRole("option", { name: /realm-2/i });
      fireEvent.click(option);

      expect(mockRealmState.setRealm).toHaveBeenCalledWith("realm-2");
    });

    it("highlights current realm in dropdown", () => {
      render(<RealmSelector />);

      const button = screen.getByRole("button", { name: /select realm/i });
      fireEvent.click(button);

      const currentOption = screen.getByRole("option", { name: /realm-1/i });
      expect(currentOption.getAttribute("aria-selected")).toBe("true");
    });
  });

  describe("sysadmin view", () => {
    beforeEach(() => {
      // SysAdmins see all realms except _admin
      mockRealmState.availableRealms = ["realm-1", "realm-2", "_admin"];
      mockRealmState.selectedRealm = "realm-1";
      mockRealmState.role = "admin";
      mockAuthState.session = { is_sysadmin: true };
    });

    it("filters out _admin realm from the list", () => {
      render(<RealmSelector />);

      const button = screen.getByRole("button", { name: /select realm/i });
      fireEvent.click(button);

      expect(screen.getByRole("option", { name: /realm-1/i })).toBeDefined();
      expect(screen.getByRole("option", { name: /realm-2/i })).toBeDefined();
      expect(screen.queryByRole("option", { name: /_admin/i })).toBeNull();
    });
  });

  describe("accessibility", () => {
    beforeEach(() => {
      mockRealmState.availableRealms = ["realm-1", "realm-2"];
      mockRealmState.selectedRealm = "realm-1";
      mockRealmState.role = "member";
      mockAuthState.session = { is_sysadmin: false };
    });

    it("has accessible label for the dropdown", () => {
      render(<RealmSelector />);

      const button = screen.getByRole("button", { name: /select realm/i });
      expect(button).toBeDefined();
      expect(button.getAttribute("aria-label")).toMatch(/select realm/i);
    });
  });
});
