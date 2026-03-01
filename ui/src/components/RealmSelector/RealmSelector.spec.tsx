import { describe, expect, vi, beforeEach, test } from "vitest";
import { render, screen } from "@testing-library/react";
import { RealmSelector } from "./RealmSelector";

// Define types locally since they're not exported from lib files
type RealmContextValue = {
  currentRealm: string | null;
  setCurrentRealm: (realm: string | null) => void;
  availableRealms: string[];
  isLoading: boolean;
};

// Mock the useRealm hook
vi.mock("../../lib/realm", () => ({
  useRealm: vi.fn(),
}));

import { useRealm } from "../../lib/realm";

// Helper function to create complete RealmContextValue mock
const createMockRealmValue = (
  overrides: Partial<RealmContextValue> = {},
): RealmContextValue => ({
  currentRealm: "test-realm",
  setCurrentRealm: vi.fn(),
  availableRealms: ["test-realm", "other-realm"],
  isLoading: false,
  ...overrides,
});

describe("RealmSelector", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Loading State", () => {
    test("shows loading message when isLoading is true", () => {
      vi.mocked(useRealm).mockReturnValue(
        createMockRealmValue({ isLoading: true }),
      );
      render(<RealmSelector />);
      expect(
        screen.getByText("Loading realms..."),
      ).toBeInTheDocument();
    });
  });

  describe("Component Rendering", () => {
    beforeEach(() => {
      vi.mocked(useRealm).mockReturnValue(
        createMockRealmValue({
          currentRealm: "test-realm",
          availableRealms: ["test-realm", "other-realm"],
        }),
      );
    });

    test("renders without crashing", () => {
      const { container } = render(<RealmSelector />);
      expect(container).toBeInTheDocument();
    });

    test("renders Realm label", () => {
      render(<RealmSelector />);
      expect(screen.getByText("Realm:")).toBeInTheDocument();
    });

    test("renders select element", () => {
      render(<RealmSelector />);
      const select = screen.getByRole("combobox");
      expect(select).toBeInTheDocument();
    });

    test("displays current realm name in select", () => {
      render(<RealmSelector />);
      const select = screen.getByRole("combobox") as HTMLSelectElement;
      expect(select.value).toBe("test-realm");
    });
  });

  describe("Realm Selection", () => {
    test("displays all available realms as options", () => {
      vi.mocked(useRealm).mockReturnValue(
        createMockRealmValue({
          currentRealm: "test-realm",
          availableRealms: ["test-realm", "other-realm", "third-realm"],
        }),
      );
      render(<RealmSelector />);
      const options = screen.getAllByRole("option");
      expect(options).toHaveLength(3);
      expect(options[0]).toHaveTextContent("test-realm");
      expect(options[1]).toHaveTextContent("other-realm");
      expect(options[2]).toHaveTextContent("third-realm");
    });

    test("calls setCurrentRealm when a different realm is selected", async () => {
      const mockSetCurrentRealm = vi.fn();
      vi.mocked(useRealm).mockReturnValue(
        createMockRealmValue({
          currentRealm: "test-realm",
          availableRealms: ["test-realm", "other-realm"],
          setCurrentRealm: mockSetCurrentRealm,
        }),
      );

      render(<RealmSelector />);
      const select = screen.getByRole("combobox");

      // Simulate selecting a different realm
      await vi
        .waitFor(() => {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-expect-error - testing library event
          select.value = "other-realm";
          select.dispatchEvent(new Event("change", { bubbles: true }));
        });

      expect(mockSetCurrentRealm).toHaveBeenCalledWith("other-realm");
    });

    test("does not call setCurrentRealm when empty value is selected", async () => {
      const mockSetCurrentRealm = vi.fn();
      vi.mocked(useRealm).mockReturnValue(
        createMockRealmValue({
          currentRealm: "test-realm",
          availableRealms: ["test-realm", "other-realm"],
          setCurrentRealm: mockSetCurrentRealm,
        }),
      );

      render(<RealmSelector />);
      const select = screen.getByRole("combobox");

      // Simulate selecting empty value
      await vi
        .waitFor(() => {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-expect-error - testing library event
          select.value = "";
          select.dispatchEvent(new Event("change", { bubbles: true }));
        });

      expect(mockSetCurrentRealm).not.toHaveBeenCalled();
    });
  });

  describe("Empty Realm List", () => {
    test("renders with empty available realms", () => {
      vi.mocked(useRealm).mockReturnValue(
        createMockRealmValue({
          currentRealm: null,
          availableRealms: [],
        }),
      );

      const { container } = render(<RealmSelector />);
      expect(container).toBeInTheDocument();

      const select = screen.getByRole("combobox") as HTMLSelectElement;
      expect(select).toBeInTheDocument();
      expect(select.value).toBe("");
    });
  });

  describe("Edge Cases", () => {
    test("handles null currentRealm", () => {
      vi.mocked(useRealm).mockReturnValue(
        createMockRealmValue({
          currentRealm: null,
          availableRealms: ["test-realm"],
        }),
      );

      render(<RealmSelector />);
      const select = screen.getByRole("combobox") as HTMLSelectElement;
      expect(select.value).toBe("test-realm");
    });

    test("handles single available realm", () => {
      vi.mocked(useRealm).mockReturnValue(
        createMockRealmValue({
          currentRealm: "test-realm",
          availableRealms: ["test-realm"],
        }),
      );

      render(<RealmSelector />);
      const options = screen.getAllByRole("option");
      expect(options).toHaveLength(1);
      expect(options[0]).toHaveTextContent("test-realm");
    });
  });
});
