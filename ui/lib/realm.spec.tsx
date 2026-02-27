import React from "react";
import { renderHook, act } from "@testing-library/react";
import { describe, expect, beforeEach, afterEach, vi } from "vitest";
import test from "vitest-gwt";
import { RealmProvider, useRealm, AuthContext } from "./realm";
import type { ReactNode } from "react";

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(global, "localStorage", {
  value: localStorageMock,
});

type Context = {
  wrapper: React.ComponentType<{ children: ReactNode }>;
  session: {
    realms: string[];
    roles: Record<string, string>;
  };
  result: ReturnType<typeof useRealm>;
};

describe("RealmProvider", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("filters _admin realm from available realms", () => {
    test("excludes _admin from available realms list", {
      given: {
        session_with_admin_and_other_realms,
        provider_is_rendered,
      },
      when: {
        realm_hook_is_used,
      },
      then: {
        admin_realm_is_not_in_available_realms,
        other_realms_are_available,
      },
    });

    test("only has _admin realm", {
      given: {
        session_with_only_admin_realm,
        provider_is_rendered,
      },
      when: {
        realm_hook_is_used,
      },
      then: {
        available_realms_is_empty,
      },
    });
  });

  describe("persists selected realm to localStorage", () => {
    test("saves realm to localStorage when selected", {
      given: {
        session_with_multiple_realms,
        provider_is_rendered,
      },
      when: {
        realm_is_selected,
      },
      then: {
        localStorage_contains_selected_realm,
      },
    });

    test("uses storage key bifrost_selected_realm", {
      given: {
        session_with_multiple_realms,
        provider_is_rendered,
      },
      when: {
        realm_is_selected,
      },
      then: {
        localStorage_key_is_correct,
      },
    });
  });

  describe("initializes from localStorage", () => {
    test("loads stored realm from localStorage on mount", {
      given: {
        session_with_multiple_realms,
        localStorage_has_stored_realm,
        provider_is_rendered,
      },
      when: {
        realm_hook_is_used,
      },
      then: {
        selected_realm_matches_stored_value,
      },
    });

    test("ignores invalid realm in localStorage", {
      given: {
        session_with_multiple_realms,
        localStorage_has_invalid_realm,
        provider_is_rendered,
      },
      when: {
        realm_hook_is_used,
      },
      then: {
        selected_realm_defaults_to_first_available,
      },
    });
  });

  describe("handles no session", () => {
    test("returns null for selected realm", {
      given: {
        no_session,
        provider_is_rendered,
      },
      when: {
        realm_hook_is_used,
      },
      then: {
        selected_realm_is_null,
        available_realms_is_empty_for_no_session,
      },
    });
  });
});

// Helper function to create wrapper with mock AuthProvider
function createWrapper(session: Context["session"] | null) {
  return function Wrapper({ children }: { children: ReactNode }) {
    // Mock AuthProvider context
    const MockAuthProvider = ({ children }: { children: ReactNode }) => {
      const authContext = {
        session: session,
        isLoading: false,
        isAuthenticated: session !== null,
        error: null,
        login: vi.fn(),
        logout: vi.fn(),
        refreshSession: vi.fn(),
      };
      return React.createElement(AuthContext.Provider, { value: authContext }, children);
    };

    return React.createElement(
      MockAuthProvider,
      null,
      React.createElement(RealmProvider, null, children),
    );
  };
}

function session_with_admin_and_other_realms(this: Context) {
  this.session = {
    realms: ["_admin", "my-project", "team-alpha", "work"],
    roles: {
      _admin: "owner",
      "my-project": "admin",
      "team-alpha": "member",
      work: "viewer",
    },
  };
}

function session_with_only_admin_realm(this: Context) {
  this.session = {
    realms: ["_admin"],
    roles: { _admin: "owner" },
  };
}

function session_with_multiple_realms(this: Context) {
  this.session = {
    realms: ["project-a", "project-b", "project-c"],
    roles: {
      "project-a": "admin",
      "project-b": "member",
      "project-c": "viewer",
    },
  };
}

function no_session(this: Context) {
  this.session = {
    realms: [],
    roles: {},
  };
}

function provider_is_rendered(this: Context) {
  this.wrapper = createWrapper(this.session);
}

function realm_hook_is_used(this: Context) {
  const { result } = renderHook(() => useRealm(), { wrapper: this.wrapper });
  this.result = result.current;
}

function admin_realm_is_not_in_available_realms(this: Context) {
  expect(this.result.availableRealms).not.toContain("_admin");
}

function other_realms_are_available(this: Context) {
  expect(this.result.availableRealms).toEqual(["my-project", "team-alpha", "work"]);
}

function available_realms_is_empty(this: Context) {
  expect(this.result.availableRealms).toEqual([]);
}

function realm_is_selected(this: Context) {
  const { result } = renderHook(() => useRealm(), { wrapper: this.wrapper });
  this.result = result.current;

  act(() => {
    result.current.setRealm("project-b");
  });
  this.result = result.current; // Update after state change
}

function localStorage_contains_selected_realm(this: Context) {
  expect(localStorageMock.setItem).toHaveBeenCalledWith("bifrost_selected_realm", "project-b");
}

function localStorage_key_is_correct(this: Context) {
  expect(localStorageMock.setItem).toHaveBeenCalledWith(expect.any(String), expect.any(String));
  const [key] = localStorageMock.setItem.mock.calls[localStorageMock.setItem.mock.calls.length - 1];
  expect(key).toBe("bifrost_selected_realm");
}

function localStorage_has_stored_realm(this: Context) {
  localStorageMock.getItem.mockReturnValue("project-b");
}

function localStorage_has_invalid_realm(this: Context) {
  localStorageMock.getItem.mockReturnValue("non-existent-realm");
}

function selected_realm_matches_stored_value(this: Context) {
  expect(this.result.selectedRealm).toBe("project-b");
}

function selected_realm_defaults_to_first_available(this: Context) {
  expect(this.result.selectedRealm).toBe("project-a");
}

function selected_realm_is_null(this: Context) {
  expect(this.result.selectedRealm).toBeNull();
}

function available_realms_is_empty_for_no_session(this: Context) {
  expect(this.result.availableRealms).toEqual([]);
}
