import { expect, vi, beforeEach } from "vitest";
import test from "vitest-gwt";
import { render, screen, fireEvent, within, waitFor } from "@testing-library/react";
import { RealmProvider, AuthContext } from "@/lib/realm";
import type { ReactNode } from "react";
import { RealmSelector } from "@/components/RealmSelector/RealmSelector";

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(() => null),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

beforeEach(() => {
  vi.clearAllMocks();
  // @ts-expect-error
  global.localStorage = localStorageMock;
});

type Context = {
  wrapper: ({ children }: { children: ReactNode }) => ReactNode;
};

const setup_realm_provider = function (this: Context) {
  const mockSession = {
    realms: ["realm1", "realm2", "_admin"],
    roles: { realm1: "owner", realm2: "admin", _admin: "owner" },
  };

  this.wrapper = ({ children }) => (
    <AuthContext.Provider value={{ session: mockSession }}>
      <RealmProvider>{children}</RealmProvider>
    </AuthContext.Provider>
  );
};

const render_realm_selector = function (this: Context) {
  render(<RealmSelector />, { wrapper: this.wrapper });
};

const current_realm_is_displayed_in_trigger = function (this: Context) {
  // Should show the first available realm (realm1) as the default selected value
  const trigger = screen.getByRole("combobox");
  expect(trigger).toBeDefined();
  expect(trigger.textContent).toContain("realm1");
};

test("renders current realm name in trigger", {
  given: {
    setup_realm_provider,
  },
  when: {
    render_realm_selector,
  },
  then: {
    current_realm_is_displayed_in_trigger,
  },
});

type ClickContext = {
  wrapper: ({ children }: { children: ReactNode }) => ReactNode;
};

const setup_realm_provider_for_click = function (this: ClickContext) {
  const mockSession = {
    realms: ["realm1", "realm2", "_admin"],
    roles: { realm1: "owner", realm2: "admin", _admin: "owner" },
  };

  this.wrapper = ({ children }) => (
    <AuthContext.Provider value={{ session: mockSession }}>
      <RealmProvider>{children}</RealmProvider>
    </AuthContext.Provider>
  );
};

const render_and_click_trigger = function (this: ClickContext) {
  render(<RealmSelector />, { wrapper: this.wrapper });
  const trigger = screen.getByRole("combobox");
  fireEvent.click(trigger);
};

const available_realms_are_shown_without_admin = function (this: ClickContext) {
  // Get the listbox (dropdown)
  const listbox = screen.getByRole("listbox");
  const { getByText } = within(listbox);

  // Should show realm1 and realm2 in the dropdown
  const realm1Option = getByText("realm1");
  const realm2Option = getByText("realm2");

  expect(realm1Option).toBeDefined();
  expect(realm2Option).toBeDefined();

  // _admin should NOT be visible in the dropdown
  const adminOption = within(listbox).queryByText("_admin");
  expect(adminOption).toBeNull();
};

test("shows available realms in dropdown excluding _admin", {
  given: {
    setup_realm_provider_for_click,
  },
  when: {
    render_and_click_trigger,
  },
  then: {
    available_realms_are_shown_without_admin,
  },
});

type SelectContext = {
  wrapper: ({ children }: { children: ReactNode }) => ReactNode;
};

const setup_realm_provider_for_selection = function (this: SelectContext) {
  const mockSession = {
    realms: ["realm1", "realm2", "_admin"],
    roles: { realm1: "owner", realm2: "admin", _admin: "owner" },
  };

  this.wrapper = ({ children }) => (
    <AuthContext.Provider value={{ session: mockSession }}>
      <RealmProvider>{children}</RealmProvider>
    </AuthContext.Provider>
  );
};

const select_realm2 = function (this: SelectContext) {
  render(<RealmSelector />, { wrapper: this.wrapper });

  const trigger = screen.getByRole("combobox");
  fireEvent.click(trigger);

  // Click realm2 in the dropdown
  const listbox = screen.getByRole("listbox");
  const { getByText } = within(listbox);
  const realm2Option = getByText("realm2");
  fireEvent.click(realm2Option);
};

const realm_context_is_updated = function (this: SelectContext) {
  // After clicking realm2, the trigger should show "realm2"
  // Use waitFor to wait for the state update to propagate
  waitFor(() => {
    const trigger = screen.getByRole("combobox");
    expect(trigger.textContent).toContain("realm2");
  });
};

test("updates realm context on selection", {
  given: {
    setup_realm_provider_for_selection,
  },
  when: {
    select_realm2,
  },
  then: {
    realm_context_is_updated,
  },
});
